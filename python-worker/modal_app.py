"""
modal_app.py — ShortPurify video processing on Modal.com

Deploy:
  pip3 install modal
  modal token new
  modal secret create shortpurify-secrets WORKER_SECRET=your_random_secret
  cd python-worker
  python3 -m modal deploy modal_app.py
  # → put the printed URL in Convex:
  # npx convex env set VIDEO_WORKER_URL "https://username--shortpurify-process-video.modal.run"
  # npx convex env set VIDEO_WORKER_SECRET "your_random_secret"
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import os
import tempfile
import urllib.request
from pathlib import Path

import modal

# ── Persistent volume — weights survive between cold starts ───────────────────
volume = modal.Volume.from_name("shortpurify-models", create_if_missing=True)
MODEL_DIR = "/models"

# ── Container image ───────────────────────────────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "ffmpeg", "git", "curl", "wget", "unzip",
        "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev", "libgl1-mesa-glx",
        "fonts-liberation", "fontconfig",
    )
    .run_commands(
        # Install Deno (recommended JS runtime for yt-dlp EJS challenge solving)
        "curl -fsSL https://deno.land/install.sh | sh",
        "ln -sf /root/.deno/bin/deno /usr/local/bin/deno",
    )
    .run_commands(
        "apt-get update",
        "mkdir -p /usr/share/fonts/truetype/custom",
        "wget -q --timeout=30 -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf 'https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf'",
        "wget -q --timeout=30 -O /usr/share/fonts/truetype/custom/Inter-Bold.ttf 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf'",
        # Bangers is now a variable font in Google Fonts — try variable first, fall back to static
        "wget -q --timeout=30 -O /usr/share/fonts/truetype/custom/Bangers-Regular.ttf 'https://github.com/google/fonts/raw/main/ofl/bangers/Bangers%5Bwght%5D.ttf' || wget -q --timeout=30 -O /usr/share/fonts/truetype/custom/Bangers-Regular.ttf 'https://github.com/google/fonts/raw/main/ofl/bangers/static/Bangers-Regular.ttf' || echo 'WARNING: Bangers download failed'",
        "wget -q --timeout=30 -O /usr/share/fonts/truetype/custom/ComicRelief-Regular.ttf 'https://github.com/google/fonts/raw/main/ofl/comicrelief/ComicRelief-Regular.ttf' || echo 'WARNING: Comic Relief download failed'",
        "echo 'cache-bust-2026-05-01'",
        "fc-cache -f -v"
    )
    .pip_install(
        "opencv-python-headless>=4.9",
        "numpy>=1.26",
        "scipy>=1.12",
        "ultralytics>=8.2",
        "torch>=2.2",
        "torchvision>=0.17",
        "python-speech-features>=0.6",
        "fastapi>=0.110",
        "python-multipart",
        "mediapipe==0.10.9",
        "pillow>=10.0",
        "yt-dlp[default]"
    )
    .run_commands("git clone https://github.com/Junhua-Liao/LR-ASD /opt/LR-ASD")
    # Include the local pipeline module in the image (Modal 1.x API)
    .add_local_python_source("smart_crop_active_speaker")
)

app = modal.App("shortpurify", image=image)


# ── Pure-Python helpers (no FastAPI — safe to run locally) ────────────────────

def _verify_secret(provided: str) -> bool:
    secret = os.environ.get("WORKER_SECRET", "")
    if not secret:
        return True
    return hmac.compare_digest(
        hashlib.sha256(provided.encode()).digest(),
        hashlib.sha256(secret.encode()).digest(),
    )


def _download_url(url: str, dest: str) -> None:
    import shutil
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; ShortPurify/1.0)",
        "Accept": "*/*",
    })
    with urllib.request.urlopen(req) as resp, open(dest, "wb") as f:
        shutil.copyfileobj(resp, f)
    logging.info("Downloaded %.1f MB", Path(dest).stat().st_size / 1e6)


def _upload_to_r2(upload_url: str, local_path: str) -> None:
    """PUT a file directly to a presigned R2 URL.

    NOTE: Do NOT set Content-Type — Cloudflare R2 rejects unsigned headers
    that weren't included when the presigned URL was generated.
    """
    with open(local_path, "rb") as f:
        content = f.read()
    req = urllib.request.Request(
        upload_url,
        data=content,
        method="PUT",
    )
    try:
        with urllib.request.urlopen(req) as r:
            if r.status not in (200, 204):
                raise RuntimeError(f"R2 upload failed: {r.status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"R2 upload failed {e.code}: {body}")
    logging.info("Uploaded %s bytes to R2", len(content))


# ── Single web endpoint — handles HTTP + processing in one function ───────────

@app.function(
    secrets=[modal.Secret.from_name("shortpurify-secrets")],
    volumes={MODEL_DIR: volume},
    cpu=4.0,
    memory=8192,
    timeout=600,
    gpu="t4",  # uncomment for ~10x faster inference
)
@modal.fastapi_endpoint(method="POST")
def process_video(body: dict) -> dict:
    """
    POST body (JSON):
      videoUrl       str    — public URL of the source video
      startTime      float  — clip start in seconds
      endTime        float  — clip end in seconds
      projectId      str    — used for logging
      clipIndex      int    — used for logging
      workerSecret   str    — must match WORKER_SECRET env var
      clipUploadUrl  str    — presigned R2 PUT URL for the processed clip
      thumbUploadUrl str    — presigned R2 PUT URL for the thumbnail

    Returns: { ok, thumbnailUploaded }
    """
    # Auth — secret passed in body since @modal.fastapi_endpoint doesn't easily expose raw headers
    if not _verify_secret(body.get("workerSecret", "")):
        return {"ok": False, "error": "Unauthorized"}

    video_url: str = body.get("videoUrl", "")
    start: float = float(body.get("startTime", 0))
    end: float = float(body.get("endTime", 0))
    project_id: str = body.get("projectId", "unknown")
    clip_index: int = int(body.get("clipIndex", 0))
    clip_upload_url: str = body.get("clipUploadUrl", "")
    thumb_upload_url: str = body.get("thumbUploadUrl", "")
    crop_mode: str = body.get("cropMode", "smart_crop")  # "smart_crop" | "blur_background"
    crop_keyframes = body.get("cropKeyframes")  # optional [{time, cropX}] list from review UI
    duration = max(1.0, end - start)

    if not video_url:
        return {"ok": False, "error": "videoUrl is required"}
    if not clip_upload_url:
        return {"ok": False, "error": "clipUploadUrl is required"}

    import smart_crop_active_speaker as pipeline

    pipeline._LR_ASD_DIR = Path(MODEL_DIR) / "LR-ASD"
    os.environ["YOLO_CONFIG_DIR"] = "/opt"
    # pyrefly: ignore [missing-import]
    import ultralytics.utils as _ult_utils
    _ult_utils.SETTINGS["weights_dir"] = "/opt"

    with tempfile.TemporaryDirectory(prefix="sp_") as tmpdir:
        src = str(Path(tmpdir) / "source.mp4")
        out = str(Path(tmpdir) / "clip.mp4")
        thumb = str(Path(tmpdir) / "thumb.jpg")

        try:
            _download_url(video_url, src)
        except Exception as exc:
            return {"ok": False, "error": f"Download failed: {exc}"}

        try:
            pipeline.process_video(
                input_path=src,
                output_path=out,
                start_s=start,
                duration_s=duration,
                thumb_path=thumb,
                dynamic_crop=True,
                crop_mode=crop_mode,
                crop_keyframes=crop_keyframes,
            )
        except Exception as exc:
            logging.exception("Pipeline error")
            return {"ok": False, "error": f"Pipeline failed: {exc}"}

        try:
            _upload_to_r2(clip_upload_url, out)
        except Exception as exc:
            logging.exception("Clip R2 upload error")
            return {"ok": False, "error": f"Clip upload failed: {exc}"}

        thumbnail_uploaded = False
        if thumb_upload_url and Path(thumb).exists():
            try:
                _upload_to_r2(thumb_upload_url, thumb)
                thumbnail_uploaded = True
            except Exception as exc:
                logging.warning("Thumbnail upload failed (non-fatal): %s", exc)

    logging.info("Done: project=%s clip=%s thumbnail=%s", project_id, clip_index, thumbnail_uploaded)
    return {"ok": True, "thumbnailUploaded": thumbnail_uploaded}


# ── YouTube Extraction endpoint ───────────────────────────────────────────────

@app.function(
    secrets=[modal.Secret.from_name("shortpurify-secrets")],
    volumes={MODEL_DIR: volume},
    cpu=2.0,
    memory=4096,
    timeout=600,
)
@modal.fastapi_endpoint(method="POST")
def extract_youtube_info(body: dict) -> dict:
    """
    POST body (JSON):
      youtubeUrl     str
      workerSecret   str
      uploadUrl      str  — presigned R2 PUT URL (optional, if provided video is downloaded + uploaded)

    Returns: { ok, title, r2Key?, playbackUrl?, durationSeconds?, error? }

    If uploadUrl is provided:
      - Downloads the best available quality (up to 1080p) using yt-dlp + ffmpeg merge
      - Uploads the merged MP4 to R2 via the presigned URL
      - Returns r2Key so the caller can generate a signed serving URL

    Falls back to returning a direct playbackUrl if upload fails or uploadUrl not provided.
    """
    if not _verify_secret(body.get("workerSecret", "")):
        return {"ok": False, "error": "Unauthorized"}

    video_url = body.get("youtubeUrl", "")
    if not video_url:
        return {"ok": False, "error": "youtubeUrl is required"}

    upload_url: str = body.get("uploadUrl", "")

    import yt_dlp
    import tempfile, os

    cookies_path = '/models/cookies.txt' if Path('/models/cookies.txt').exists() else None

    # ── Step 1: extract metadata ────────────────────────────────────────────────
    meta_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
    }
    if cookies_path:
        meta_opts['cookiefile'] = cookies_path

    try:
        with yt_dlp.YoutubeDL(meta_opts) as ydl:
            v_info = ydl.extract_info(video_url, download=False)
            if not v_info:
                return {"ok": False, "error": "yt-dlp returned no info"}

        res_title = v_info.get("title", "YouTube Video")
        duration_s = v_info.get("duration")

    except Exception as e:
        import traceback
        logging.error(f"yt-dlp meta error: {e}\n{traceback.format_exc()}")
        return {"ok": False, "error": f"YouTube Error: {e}"}

    # ── Step 2: if uploadUrl provided, download best quality and upload to R2 ───
    if upload_url:
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = os.path.join(tmpdir, "video.mp4")
            dl_opts = {
                'quiet': True,
                'no_warnings': True,
                # Best video up to 1080p merged with best audio, output as mp4
                'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
                'merge_output_format': 'mp4',
                'outtmpl': out_path,
                'postprocessors': [{
                    'key': 'FFmpegVideoConvertor',
                    'preferedformat': 'mp4',
                }],
            }
            if cookies_path:
                dl_opts['cookiefile'] = cookies_path

            try:
                with yt_dlp.YoutubeDL(dl_opts) as ydl:
                    ydl.download([video_url])

                # yt-dlp may append .mp4 extension
                if not os.path.exists(out_path):
                    candidates = [f for f in os.listdir(tmpdir) if f.endswith('.mp4')]
                    if candidates:
                        out_path = os.path.join(tmpdir, candidates[0])

                if os.path.exists(out_path):
                    _upload_to_r2(upload_url, out_path)
                    logging.info("YouTube video downloaded and uploaded to R2: %s", out_path)
                    return {"ok": True, "title": res_title, "uploaded": True, "durationSeconds": duration_s}
                else:
                    logging.warning("Downloaded file not found, falling back to playback URL")
            except Exception as e:
                import traceback
                logging.error(f"yt-dlp download error: {e}\n{traceback.format_exc()}")
                # Fall through to playback URL fallback

    # ── Step 3: fallback — return a direct playback URL ─────────────────────────
    try:
        all_fmts = v_info.get("formats", []) or []

        # Direct HTTPS streams only (avoid .m3u8 manifests)
        playable = [
            fmt for fmt in all_fmts
            if fmt.get("url")
            and not fmt.get("protocol", "").startswith("m3u8")
            and "manifest/hls_playlist" not in fmt.get("url", "")
        ]

        # Prefer muxed streams
        muxed = [
            f for f in playable
            if f.get("vcodec") != "none" and f.get("acodec") != "none" and f.get("height", 0) <= 1080
        ]
        if muxed:
            best = sorted(muxed, key=lambda f: (f.get("height", 0), f.get("tbr", 0) or 0), reverse=True)[0]
            return {"ok": True, "title": res_title, "playbackUrl": best["url"], "durationSeconds": duration_s}

        video_only = [f for f in playable if f.get("vcodec") != "none" and f.get("height", 0) <= 1080]
        if video_only:
            best = sorted(video_only, key=lambda f: (f.get("height", 0), f.get("tbr", 0) or 0), reverse=True)[0]
            return {"ok": True, "title": res_title, "playbackUrl": best["url"], "durationSeconds": duration_s}

        if playable:
            return {"ok": True, "title": res_title, "playbackUrl": playable[-1]["url"], "durationSeconds": duration_s}

        raw_fmts = [f for f in all_fmts if f.get("url")]
        if raw_fmts:
            return {"ok": True, "title": res_title, "playbackUrl": raw_fmts[-1]["url"], "durationSeconds": duration_s}

        if v_info.get("url"):
            return {"ok": True, "title": res_title, "playbackUrl": v_info["url"], "durationSeconds": duration_s}

        return {"ok": False, "error": "No playback URL available"}

    except Exception as e:
        import traceback
        err_msg = str(e)
        logging.error(f"yt-dlp fallback error: {err_msg}\n{traceback.format_exc()}")
        return {"ok": False, "error": f"YouTube Error: {err_msg}"}



# ── Subtitle burn endpoint ────────────────────────────────────────────────────

_FONT_PATHS = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
]


def _find_font(font_family: str) -> str:
    family = font_family.lower()
    paths = {
        "impact":        "/usr/share/fonts/truetype/custom/Anton-Regular.ttf",
        "bangers":       "/usr/share/fonts/truetype/custom/Bangers-Regular.ttf",
        "comic relief":  "/usr/share/fonts/truetype/custom/ComicRelief-Regular.ttf",
        "arial":         "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "georgia":       "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "courier":       "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
    }
    for k, p in paths.items():
        if k in family and Path(p).exists():
            return p
    inter_p = "/usr/share/fonts/truetype/custom/Inter-Bold.ttf"
    if Path(inter_p).exists(): return inter_p

    for p in _FONT_PATHS:
        if Path(p).exists():
            return p
    return ""


def _render_subtitle_frames(
    subtitle_words: list,
    settings: dict,
    vid_w: int,
    vid_h: int,
    tmpdir: str,
) -> list:
    """
    Render one transparent RGBA PNG per word-event using Pillow.
    Supports 5 templates: classic | bold | neon | cinematic | minimal
    Returns [(ev_start_s, ev_end_s, png_path), ...]
    """
    # pyrefly: ignore [missing-import]
    from PIL import Image, ImageDraw, ImageFont, ImageFilter

    LONG_PAUSE_MS  = 800
    template       = settings.get("template", "classic") or "classic"
    font_size_px   = max(20, int(int(settings.get("fontSize", 26)) * vid_w / 390))
    words_per_line = int(settings.get("wordsPerLine", 3))
    center_x       = float(settings.get("x",  50)) / 100.0 * vid_w
    center_y       = float(settings.get("y",  78)) / 100.0 * vid_h
    scale_factor   = vid_w / 390.0

    def parse_rgba(css: str, alpha: int = 255):
        h = css.lstrip("#")
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha)

    text_rgba    = parse_rgba(settings.get("textColor",      "#ffffff"))
    hl_text_rgba = parse_rgba(settings.get("highlightColor", "#000000"))
    hl_bg_rgba   = parse_rgba(settings.get("highlightBg",    "#facc15"))

    font_family = settings.get("fontFamily", "Inter")
    font_path   = _find_font(font_family)

    font_obj = None
    if font_path:
        try:
            font_obj = ImageFont.truetype(font_path, font_size_px)
        except Exception:
            pass
    if not font_obj:
        for p in _FONT_PATHS:
            try:
                font_obj = ImageFont.truetype(p, font_size_px)
                break
            except Exception:
                pass

    LINE_HEIGHT = int(font_size_px * 1.35)
    pad_x       = int(font_size_px * 0.05)  # Tightened padding
    pad_y       = int(font_size_px * 0.08)
    gap_x       = int(font_size_px * 0.15) # Tightened gap
    c_radius    = int(font_size_px * 0.15)

    def measure(text: str, fnt) -> float:
        if fnt:
            try:
                return float(fnt.getlength(text))
            except Exception:
                pass
        return len(text) * font_size_px * 0.55

    def get_text_bounds(draw, fnt, scale=1.0):
        if fnt:
            try:
                bb = draw.textbbox((0, 0), "Ay|", font=fnt, anchor="la")
                return bb[1], bb[3]
            except Exception:
                pass
        return int(-font_size_px * 0.8 * scale), int(font_size_px * 0.2 * scale)

    def scale_font(base_fnt, new_size):
        if font_path:
            try:
                return ImageFont.truetype(font_path, max(10, new_size))
            except Exception:
                pass
        if _FONT_PATHS:
            try:
                return ImageFont.truetype(_FONT_PATHS[0], max(10, new_size))
            except Exception:
                pass
        return base_fnt

    def draw_outlined_text(draw, xy, text, fnt, fill, stroke_w, stroke_rgba=(0, 0, 0, 220)):
        ox, oy = xy
        for dx in range(-stroke_w, stroke_w + 1):
            for dy in range(-stroke_w, stroke_w + 1):
                if dx == 0 and dy == 0:
                    continue
                draw.text((ox + dx, oy + dy), text, font=fnt, fill=stroke_rgba)
        draw.text(xy, text, font=fnt, fill=fill)

    # ── shared layout helper ─────────────────────────────────────────────────

    def layout_row(chunk, base_fnt, full_chunk=None):
        """Return (scaled_font, scale, span_widths, total_w, c_pad_x, c_pad_y, c_gap_x, rad)"""
        # Calculate scale based on the FULL chunk (if provided) so the font doesn't shrink mid-sentence
        ref_chunk = full_chunk if full_chunk is not None else chunk
        ref_w_sum = sum(measure(cw["text"], base_fnt) + 2 * pad_x for cw in ref_chunk)
        ref_tw    = ref_w_sum + gap_x * max(0, len(ref_chunk) - 1)
        
        sc    = 1.0
        sfnt  = base_fnt
        max_w = vid_w * 0.85
        if ref_tw > max_w:
            sc   = max_w / ref_tw
            sfnt = scale_font(base_fnt, int(font_size_px * sc))

        # Layout the actual visible chunk using the stable scale
        cp_x = int(pad_x * sc)
        cp_y = int(pad_y * sc)
        cg_x = int(gap_x * sc)
        rad  = int(c_radius * sc)
        spans = [measure(cw["text"], sfnt) + 2 * cp_x for cw in chunk]
        total = sum(spans) + cg_x * max(0, len(chunk) - 1)
        return sfnt, sc, spans, total, cp_x, cp_y, cg_x, rad

    # ── per-template render functions ────────────────────────────────────────

    def render_classic(_img, draw, shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None, frame_idx=0):
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy  = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                span_w  = spans[col_idx]
                x_int   = int(x_cur)
                is_act  = (cw is active_word)
                wt      = cw["text"]
                if is_act:
                    draw.rounded_rectangle(
                        [x_int, text_y + std_top - cp_y, x_int + int(span_w), text_y + std_bottom + cp_y],
                        radius=rad, fill=hl_bg_rgba,
                    )
                    if sfnt:
                        draw.text((x_int + cp_x, text_y), wt, font=sfnt, fill=hl_text_rgba, anchor="la")
                else:
                    if sfnt:
                        shadow_draw.text((x_int + cp_x, text_y), wt, font=sfnt, fill=(0, 0, 0, 255), anchor="la")
                        draw.text((x_int + cp_x, text_y), wt, font=sfnt, fill=text_rgba, anchor="la")
                x_cur += span_w + cg_x

    def render_neon(img, draw, _shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None):
        # highlightBg is repurposed as the glow colour for this template
        glow_rgba = hl_bg_rgba
        bar_pad_x = int(14 * scale_factor)
        bar_pad_y = int(5 * scale_factor)

        # Pre-compute layout so we can do 3 ordered passes (strip → glow → text)
        row_layouts = []
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y = int(row_cy - (std_bottom + std_top) / 2)
            row_layouts.append((chunk, sfnt, spans, total_w, cp_x, cp_y, cg_x, std_top, std_bottom, text_y))

        # Pass 1 — dark strip background per row
        for (chunk, sfnt, spans, total_w, cp_x, cp_y, cg_x, std_top, std_bottom, text_y) in row_layouts:
            row_left  = int(center_x - total_w / 2 - bar_pad_x)
            row_right = int(center_x + total_w / 2 + bar_pad_x)
            draw.rounded_rectangle(
                [row_left, text_y + std_top - bar_pad_y, row_right, text_y + std_bottom + bar_pad_y],
                radius=int(6 * scale_factor), fill=(0, 0, 0, 140),
            )

        # Pass 2 — colored glow composited directly into img
        # Initialize with (R, G, B, 0) to prevent dark fringing when blurring transparent pixels
        glow_r, glow_g, glow_b, _ = glow_rgba
        text_r, text_g, text_b, _ = text_rgba
        
        act_layer = Image.new("RGBA", (vid_w, vid_h), (glow_r, glow_g, glow_b, 0))
        act_d = ImageDraw.Draw(act_layer)
        
        inact_layer = Image.new("RGBA", (vid_w, vid_h), (text_r, text_g, text_b, 0))
        inact_d = ImageDraw.Draw(inact_layer)

        for (chunk, sfnt, spans, total_w, cp_x, cp_y, cg_x, std_top, std_bottom, text_y) in row_layouts:
            x_cur = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                if sfnt:
                    if cw is active_word:
                        glow_base = (glow_r, glow_g, glow_b, 180)
                        act_d.text((int(x_cur) + cp_x, text_y), cw["text"], font=sfnt, fill=glow_base, anchor="la")
                    else:
                        in_glow_rgba = (text_r, text_g, text_b, 100)
                        inact_d.text((int(x_cur) + cp_x, text_y), cw["text"], font=sfnt, fill=in_glow_rgba, anchor="la")
                x_cur += spans[col_idx] + cg_x
                
        ac_g1 = act_layer.filter(ImageFilter.GaussianBlur(int(3 * scale_factor)))
        ac_g2 = act_layer.filter(ImageFilter.GaussianBlur(int(6 * scale_factor)))
        ac_g3 = act_layer.filter(ImageFilter.GaussianBlur(int(12 * scale_factor)))

        in_g1 = inact_layer.filter(ImageFilter.GaussianBlur(int(3 * scale_factor)))

        img.alpha_composite(in_g1)
        img.alpha_composite(ac_g3)
        img.alpha_composite(ac_g2)
        img.alpha_composite(ac_g1)

        # Pass 3 — sharp text drawn on top of glow
        for (chunk, sfnt, spans, total_w, cp_x, cp_y, cg_x, std_top, std_bottom, text_y) in row_layouts:
            x_cur = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                if sfnt:
                    fill = hl_text_rgba if cw is active_word else text_rgba
                    draw.text((int(x_cur) + cp_x, text_y), cw["text"], font=sfnt, fill=fill, anchor="la")
                x_cur += spans[col_idx] + cg_x

    def render_cinematic(_img, draw, _shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None):
        bar_h    = int(LINE_HEIGHT * 1.3)
        bar_pad  = int(4 * scale_factor)
        total_bar_h = bar_h * num_rows + bar_pad * (num_rows - 1)
        bar_top  = int(center_y - total_bar_h / 2)
        # Full-width dark bar across all rows
        draw.rectangle([0, bar_top - bar_pad, vid_w, bar_top + total_bar_h + bar_pad],
                       fill=(0, 0, 0, 178))
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy  = bar_top + bar_h * row_idx + bar_h // 2
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                span_w = spans[col_idx]
                x_int  = int(x_cur)
                is_act = (cw is active_word)
                wt     = cw["text"]
                fill   = hl_text_rgba if is_act else text_rgba
                if sfnt:
                    draw.text((x_int + cp_x, text_y), wt, font=sfnt, fill=fill, anchor="la")
                x_cur += span_w + cg_x

    def render_minimal(_img, draw, shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None):
        uline_rgba = hl_bg_rgba  # underline uses highlightBg
        uline_w    = max(2, int(3 * scale_factor))
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy  = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                span_w = spans[col_idx]
                x_int  = int(x_cur)
                is_act = (cw is active_word)
                wt     = cw["text"]
                fill   = hl_text_rgba if is_act else text_rgba
                stroke = max(1, int(font_size_px // 18))
                if sfnt:
                    shadow_draw.text((x_int + cp_x, text_y), wt, font=sfnt, fill=(0, 0, 0, 200), anchor="la")
                    draw_outlined_text(draw, (x_int + cp_x, text_y), wt, sfnt, fill, stroke, (0, 0, 0, 140))
                if is_act:
                    uline_y = text_y + std_bottom + int(2 * scale_factor)
                    draw.rectangle([x_int + cp_x, uline_y,
                                    x_int + int(span_w) - cp_x, uline_y + uline_w],
                                   fill=uline_rgba)
                x_cur += span_w + cg_x

    def render_beasty(_img, draw, shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None):
        for chunk in display_chunks:
            for cw in chunk:
                cw["text"] = cw["text"].upper()

        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy  = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                span_w = spans[col_idx]
                x_int  = int(x_cur)
                is_act = (cw is active_word)
                wt     = cw["text"]
                fill   = hl_text_rgba if is_act else text_rgba
                stroke = max(2, int(font_size_px // 12))
                if sfnt:
                    sh_off = int(4 * scale_factor)
                    shadow_draw.text((x_int + cp_x + sh_off, text_y + sh_off), wt, font=sfnt, fill=(0, 0, 0, 255), anchor="la")
                    draw_outlined_text(draw, (x_int + cp_x, text_y), wt, sfnt, fill, stroke, (0, 0, 0, 255))
                x_cur += span_w + cg_x


    def render_karaoke(_img, draw, shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None):
        K_SCALE = 1.15
        for chunk in display_chunks:
            for cw in chunk:
                cw["text"] = cw["text"].upper()
                
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            
            b_sc = sc * K_SCALE
            big_fnt = scale_font(font_obj, int(font_size_px * b_sc))
            
            new_spans = []
            for col_idx, cw in enumerate(chunk):
                if cw is active_word:
                    new_spans.append(measure(cw["text"], big_fnt) + 2 * cp_x)
                else:
                    new_spans.append(spans[col_idx])
            new_total = sum(new_spans) + cg_x * max(0, len(chunk) - 1)
            
            row_cy  = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            
            x_cur   = center_x - new_total / 2
            
            for col_idx, cw in enumerate(chunk):
                span_w = new_spans[col_idx]
                x_int  = int(x_cur)
                is_act = (cw is active_word)
                wt     = cw["text"]
                fill   = hl_text_rgba if is_act else text_rgba
                stroke = max(1, int(font_size_px // 20))
                
                fnt_to_use = big_fnt if is_act else sfnt
                
                # Perfect vertical center by balancing height offset
                if is_act:
                    big_top, big_bottom = get_text_bounds(draw, big_fnt, sc * K_SCALE)
                    y_offset = int(((std_bottom - std_top) - (big_bottom - big_top)) / 2)
                else:
                    y_offset = 0
                
                if sfnt:
                    shadow_draw.text((x_int + cp_x, text_y + y_offset + int(2 * scale_factor)), wt, font=fnt_to_use, fill=(0, 0, 0, 255), anchor="la")
                    draw_outlined_text(draw, (x_int + cp_x, text_y + y_offset), wt, fnt_to_use, fill, stroke, (0, 0, 0, 216))
                x_cur += span_w + cg_x

    def render_comic(img, _draw, _shadow_draw, display_chunks, num_rows, _active_word, display_full_chunks=None):
        import math
        dot_rgba    = text_rgba
        shadow_rgba = hl_text_rgba
        bg_rgba     = hl_bg_rgba

        # Replicate web math exactly - boosted for parity
        fs = float(settings.get("fontSize", 30))
        
        # Thicker stroke and deeper shadows for that "pop" look
        css_stroke = max(1.5, fs * 0.04)
        css_sh_red = css_stroke + max(1.0, fs * 0.02)
        css_sh_black = css_sh_red + max(1.5, fs * 0.03)
        
        # Web dot pattern in CSS pixels - tiny and sharp
        css_dot_step = 10.0
        css_dot_r = 0.5

        # Scale to video resolution (scale_factor = vid_w / 390.0)
        stroke_px = max(2, int(css_stroke * scale_factor))
        sh_red    = max(4, int(css_sh_red * scale_factor))
        sh_black  = max(7, int(css_sh_black * scale_factor))
        dot_step  = max(6, int(css_dot_step * scale_factor))
        dot_r     = max(1, int(css_dot_r * scale_factor))

        for chunk in display_chunks:
            for cw in chunk:
                cw["text"] = cw["text"].upper()

        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            row_cy  = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            std_top, std_bottom = get_text_bounds(draw, sfnt, sc)
            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2

            for col_idx, cw in enumerate(chunk):
                span_w = spans[col_idx]
                x_int  = int(x_cur)
                wt     = cw["text"]

                tw = measure(wt, sfnt)
                
                # Extra padding for massive shadows and skew
                pad_x = sh_black + int(font_size_px * sc * 0.5)
                pad_y = sh_black + int(font_size_px * sc * 0.5)
                
                W = int(tw + pad_x * 2)
                H = int(font_size_px * sc * 2.5 + pad_y * 2)

                # 1. Pattern Canvas
                pattern = Image.new("RGBA", (W, H), bg_rgba)
                pd = ImageDraw.Draw(pattern)
                for dy in range(0, H, dot_step):
                    for dx in range(0, W, dot_step):
                        pd.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=dot_rgba)

                # 2. Text Mask
                mask = Image.new("L", (W, H), 0)
                md = ImageDraw.Draw(mask)
                if sfnt:
                    md.text((pad_x, pad_y), wt, font=sfnt, fill=255, anchor="la")

                word_img = Image.new("RGBA", (W, H), (0,0,0,0))
                word_img.paste(pattern, (0,0), mask)

                # 3. Apply Black Stroke to the word
                final_word = Image.new("RGBA", (W, H), (0,0,0,0))
                fd = ImageDraw.Draw(final_word)
                if sfnt:
                    # Draw solid black stroke behind the dotted fill
                    fd.text((pad_x, pad_y), wt, font=sfnt, fill=(0,0,0,255), 
                            stroke_width=stroke_px, stroke_fill=(0,0,0,255), anchor="la")
                final_word.alpha_composite(word_img)

                # 4. Skew (4 degrees to lean right)
                skew_angle = 4 * math.pi / 180
                m_skew = (1, math.tan(skew_angle), 0, 0, 1, 0)
                skewed = final_word.transform(final_word.size, Image.AFFINE, m_skew, resample=Image.BICUBIC)

                # 5. Layered 3D Shadows
                black_shadow = Image.new("RGBA", skewed.size, (0,0,0,255))
                black_shadow.putalpha(skewed.split()[3])

                red_shadow = Image.new("RGBA", skewed.size, shadow_rgba)
                red_shadow.putalpha(skewed.split()[3])

                # 6. Compositing onto main frame
                paste_x = x_int + cp_x - pad_x
                paste_y = text_y - pad_y

                img.paste(black_shadow, (paste_x + sh_black, paste_y + sh_black), black_shadow)
                img.paste(red_shadow, (paste_x + sh_red, paste_y + sh_red), red_shadow)
                img.paste(skewed, (paste_x, paste_y), skewed)

                x_cur += span_w + cg_x

    def render_shadow(_img, draw, _shadow_draw, display_chunks, num_rows, active_word, display_full_chunks=None, frame_idx=0):
        import math
        shadow_rgba = hl_bg_rgba
        
        for row_idx, chunk in enumerate(display_chunks):
            full_chunk = display_full_chunks[row_idx] if display_full_chunks else None
            # Initial layout to get baseline scaling
            _, sc, _, _, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj, full_chunk)
            
            # Global total width calculation with zero gap for active words
            row_spans = []
            row_fonts = []
            row_total_w = 0
            for i, cw in enumerate(chunk):
                is_act = (cw is active_word)
                word_scale = 1.1 if is_act else 1.0
                cur_fnt = scale_font(font_obj, int(font_size_px * sc * word_scale))
                wt = cw["text"].strip().upper()
                w = measure(wt, cur_fnt)
                # Skew compensation: pull word left to tighten the gap at the top
                if is_act:
                    skew_pull = int(font_size_px * sc * 0.15)
                    w -= skew_pull
                row_spans.append(w)
                row_fonts.append(cur_fnt)
                row_total_w += w
                if i < len(chunk) - 1:
                    next_is_act = (chunk[i+1] is active_word)
                    # Zero gap if active is involved to force them together
                    gap = -8 if (is_act or next_is_act) else cg_x
                    row_total_w += gap


            row_cy = center_y if num_rows == 1 else center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT
            # Align on baseline
            baseline_y = row_cy + int(font_size_px * sc * 0.2)
            x_cur = center_x - row_total_w / 2

            for col_idx, cw in enumerate(chunk):
                span_w = row_spans[col_idx]
                sfnt   = row_fonts[col_idx]
                x_int  = int(x_cur)
                wt     = cw["text"].strip().upper()
                is_act = (cw is active_word)
                fill   = hl_text_rgba if is_act else text_rgba
                
                # Composite/Draw
                if is_act:
                    pad_x, pad_y = int(60 * scale_factor), int(60 * scale_factor)
                    # Slightly wider canvas for transformations
                    W, H = int(span_w + pad_x*2 + int(font_size_px * sc * 0.3)), int(font_size_px * sc * 3 + pad_y*2)
                    
                    stripe_size = max(4, int(4 * scale_factor))
                    shift = (frame_idx % 20) * (stripe_size / 20.0)
                    pattern = Image.new("RGBA", (W, H), (0,0,0,0))
                    pd = ImageDraw.Draw(pattern)
                    for i in range(-H*2, W*2, stripe_size):
                        pd.line([(i + shift, 0), (i + H + shift, H)], fill=shadow_rgba, width=max(1, stripe_size // 2))
                    
                    mask = Image.new("L", (W, H), 0)
                    md = ImageDraw.Draw(mask)
                    off_val = int(3 * scale_factor)
                    md.text((pad_x + off_val, pad_y + off_val), wt, font=sfnt, fill=255, anchor="ls")
                    shadow_img = Image.new("RGBA", (W, H), (0,0,0,0))
                    shadow_img.paste(pattern, (0,0), mask)
                    
                    text_img = Image.new("RGBA", (W, H), (0,0,0,0))
                    td = ImageDraw.Draw(text_img)
                    td.text((pad_x, pad_y), wt, font=sfnt, fill=fill, anchor="ls")
                    
                    skew_factor = 0.2 
                    offset_x = -skew_factor * (H * 0.7)
                    final_shadow = shadow_img.transform((W, H), Image.AFFINE, (1, skew_factor, offset_x, 0, 1, 0), resample=Image.BICUBIC)
                    final_text = text_img.transform((W, H), Image.AFFINE, (1, skew_factor, offset_x, 0, 1, 0), resample=Image.BICUBIC)
                    
                    # SKEW PULL: shift active word left to compensate for right-lean slant
                    skew_pull = int(font_size_px * sc * 0.15)
                    _img.alpha_composite(final_shadow, (int(x_int - pad_x - skew_pull), int(baseline_y - pad_y)))
                    _img.alpha_composite(final_text, (int(x_int - pad_x - skew_pull), int(baseline_y - pad_y)))
                else:
                    draw.text((x_int, baseline_y), wt, font=sfnt, fill=fill, anchor="ls")
                
                # Advance x_cur with zero gap for active words
                if col_idx < len(chunk) - 1:
                    next_is_act = (chunk[col_idx+1] is active_word)
                    gap = 0 if (is_act or next_is_act) else cg_x
                    x_cur += span_w + gap

    # ── main loop ────────────────────────────────────────────────────────────

    RENDER_FNS = {
        "classic":   render_classic,
        "neon":      render_neon,
        "cinematic": render_cinematic,
        "minimal":   render_minimal,
        "beasty":    render_beasty,
        "karaoke":   render_karaoke,
        "comic":     render_comic,
        "shadow":    render_shadow,
    }
    render_fn = RENDER_FNS.get(template, render_classic)

    n = len(subtitle_words)
    frames = []

    for wi in range(n):
        word        = subtitle_words[wi]
        ev_start_ms = word["startMs"]

        if wi + 1 < n:
            gap       = subtitle_words[wi + 1]["startMs"] - word["endMs"]
            ev_end_ms = (
                subtitle_words[wi + 1]["startMs"]
                if gap <= LONG_PAUSE_MS
                else word["endMs"] + 200
            )
        else:
            ev_end_ms = word["endMs"] + 200

        if ev_end_ms <= ev_start_ms:
            continue

        spoken         = subtitle_words[:wi + 1]
        all_chunks     = [spoken[j:j + words_per_line] for j in range(0, len(spoken), words_per_line)]
        
        # Get the full rows to keep scaling stable
        all_full_chunks = [subtitle_words[j:j + words_per_line] for j in range(0, len(subtitle_words), words_per_line)]
        
        display_chunks = all_chunks[-2:]
        display_full_chunks = all_full_chunks[:len(all_chunks)][-2:]
        num_rows       = len(display_chunks)

        # Animation support: if template is shadow, render multiple frames per word
        anim_fps = 10 if template == "shadow" else 0
        
        duration_ms = ev_end_ms - ev_start_ms
        num_frames = max(1, int((duration_ms / 1000.0) * anim_fps)) if anim_fps > 0 else 1
        frame_dur_ms = duration_ms / num_frames

        for fi in range(num_frames):
            f_start_ms = ev_start_ms + fi * frame_dur_ms
            f_end_ms = ev_start_ms + (fi + 1) * frame_dur_ms
            
            img          = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
            draw         = ImageDraw.Draw(img)
            shadow_layer = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
            shadow_draw  = ImageDraw.Draw(shadow_layer)

            # Use frame_idx for animation logic
            frame_idx = int(f_start_ms / 1000.0 * 30) # Use global time for consistent animation
            
            # Pass frame_idx to render_fn if it supports it
            try:
                # pyrefly: ignore [unexpected-keyword]
                render_fn(img, draw, shadow_draw, display_chunks, num_rows, word, display_full_chunks, frame_idx=frame_idx)
            except TypeError:
                render_fn(img, draw, shadow_draw, display_chunks, num_rows, word, display_full_chunks)

            # Composite shadow/glow
            if template == "neon":
                final_img = img
            else:
                blur1 = shadow_layer.filter(ImageFilter.GaussianBlur(int(4 * scale_factor)))
                blur2 = shadow_layer.filter(ImageFilter.GaussianBlur(int(8 * scale_factor)))
                final_img = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
                final_img.alpha_composite(blur2)
                final_img.alpha_composite(blur1)
                final_img.alpha_composite(img)

            png_path = f"{tmpdir}/frame_{wi:05d}_{fi:02d}.png"
            final_img.save(png_path, "PNG")
            frames.append((f_start_ms / 1000.0, f_end_ms / 1000.0, png_path))

    return frames


@app.function(
    secrets=[modal.Secret.from_name("shortpurify-secrets")],
    cpu=2.0,
    memory=4096,
    timeout=300,
)
@modal.fastapi_endpoint(method="POST")
def burn_subtitles(body: dict) -> dict:
    """
    POST body:
      workerSecret    str  — auth
      clipUrl         str  — signed GET URL for the source clip
      uploadUrl       str  — presigned PUT URL for the output file
      subtitleWords   list — [{text, startMs, endMs}]
      settings        dict — SubtitleSettings
    Returns: { ok: bool, error?: str }
    """
    import json
    import shutil
    import subprocess

    if not _verify_secret(body.get("workerSecret", "")):
        return {"ok": False, "error": "Unauthorized"}

    clip_url   = body.get("clipUrl", "")
    upload_url = body.get("uploadUrl", "")
    words      = body.get("subtitleWords", [])
    settings   = body.get("settings", {})

    if not clip_url or not upload_url:
        return {"ok": False, "error": "clipUrl and uploadUrl are required"}

    try:
        with tempfile.TemporaryDirectory(prefix="sp_sub_") as tmpdir:
            input_path  = f"{tmpdir}/input.mp4"
            output_path = f"{tmpdir}/output.mp4"

            try:
                _download_url(clip_url, input_path)
            except Exception as exc:
                return {"ok": False, "error": f"Download failed: {exc}"}

            # Get video dimensions + duration via ffprobe
            probe = subprocess.run(
                ["ffprobe", "-v", "quiet", "-print_format", "json",
                 "-show_streams", "-show_format", input_path],
                capture_output=True, text=True,
            )
            try:
                info = json.loads(probe.stdout)
            except Exception:
                info = {}
            vid_stream = next(
                (s for s in info.get("streams", []) if s.get("codec_type") == "video"),
                None,
            )
            vid_w   = int(vid_stream["width"])  if vid_stream else 1080
            vid_h   = int(vid_stream["height"]) if vid_stream else 1920
            vid_dur = float(info.get("format", {}).get("duration", 60.0))

            if not words:
                shutil.copy(input_path, output_path)
            else:
                # pyrefly: ignore [missing-import]
                from PIL import Image

                # Render one transparent RGBA PNG per word-event.
                # This avoids FFmpeg drawtext filter complexity entirely — no
                # enable= expressions, no filter-graph reinit errors.
                frames = _render_subtitle_frames(words, settings, vid_w, vid_h, tmpdir)

                if not frames:
                    shutil.copy(input_path, output_path)
                else:
                    # Transparent blank frame for silent gaps / pauses
                    blank_png = f"{tmpdir}/blank.png"
                    Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0)).save(blank_png, "PNG")

                    # Build a continuous timeline covering [0, vid_dur]
                    frames.sort(key=lambda f: f[0])
                    timeline = []   # [(duration_s, png_path), ...]
                    cursor = 0.0
                    for (s, e, png) in frames:
                        if s > cursor + 0.001:
                            timeline.append((s - cursor, blank_png))
                        timeline.append((e - s, png))
                        cursor = e
                    if vid_dur > cursor + 0.001:
                        timeline.append((vid_dur - cursor, blank_png))

                    # Write ffconcat index
                    concat_file = f"{tmpdir}/subs.txt"
                    with open(concat_file, "w") as f:
                        f.write("ffconcat version 1.0\n")
                        for (dur, png) in timeline:
                            f.write(f"file '{png}'\n")
                            f.write(f"duration {max(0.001, dur):.6f}\n")
                        # ffconcat requires a final entry with no duration
                        if timeline:
                            f.write(f"file '{timeline[-1][1]}'\n")

                    logging.info(
                        "PIL subtitle render: %d word frames, %d timeline entries, vid_dur=%.2fs",
                        len(frames), len(timeline), vid_dur,
                    )

                    fc_string = "[0:v][1:v]overlay=format=yuv420"
                    watermark = body.get("watermark", "")
                    if watermark:
                        wf = _FONT_PATHS[0]
                        fc_string += f",drawtext=text='{watermark}':fontfile='{wf}':x=w*0.03:y=h*0.02:fontsize=h*0.02:fontcolor=white@0.6:shadowcolor=black@0.4:shadowx=2:shadowy=2"

                    # Composite subtitle PNGs directly over the clip via concat demuxer.
                    # No drawtext filters, no enable= expressions, no filter-graph reinit.
                    result = subprocess.run(
                        ["ffmpeg", "-y",
                         "-i", input_path,
                         "-f", "concat", "-safe", "0", "-i", concat_file,
                         "-filter_complex", fc_string,
                         "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                         "-pix_fmt", "yuv420p",
                         "-c:a", "copy",
                         "-movflags", "+faststart",
                         "-loglevel", "error",
                         output_path],
                        capture_output=True, text=True,
                    )
                    if result.returncode != 0:
                        return {"ok": False, "error": f"FFmpeg failed: {result.stderr[-800:]}"}

            try:
                _upload_to_r2(upload_url, output_path)
            except Exception as exc:
                return {"ok": False, "error": f"Upload failed: {exc}"}

    except Exception as exc:
        logging.exception("burn_subtitles unexpected error")
        return {"ok": False, "error": f"Server error: {exc}"}

    return {"ok": True}


# ── One-off: load LR-ASD weights into the Volume ─────────────────────────────
# Run after first deploy:  python3 -m modal run modal_app.py::download_weights --gdrive-file-id YOUR_ID

@app.function(volumes={MODEL_DIR: volume}, timeout=300)
def download_weights(gdrive_file_id: str = ""):
    import subprocess

    weight_dir = Path(MODEL_DIR) / "LR-ASD" / "weight"
    weight_dir.mkdir(parents=True, exist_ok=True)
    weight_path = weight_dir / "finetuning_AVA.model"

    if weight_path.exists():
        print(f"Already in volume ({weight_path.stat().st_size / 1e6:.1f} MB)")
        return

    if not gdrive_file_id:
        print("No file ID given. Find it at https://github.com/Junhua-Liao/LR-ASD#pretrained-models\nPipeline will use largest-face fallback without weights.")
        return

    subprocess.run(["pip", "install", "-q", "gdown"], check=True)
    subprocess.run(
        ["python", "-c", f"import gdown; gdown.download(id='{gdrive_file_id}', output='{weight_path}', quiet=False)"],
        check=True,
    )
    volume.commit()
    print(f"Weights saved ({weight_path.stat().st_size / 1e6:.1f} MB)")


@app.function(volumes={MODEL_DIR: volume})
def upload_weights(weight_bytes: bytes, filename: str = "finetuning_AVA.model"):
    dest = Path(MODEL_DIR) / "LR-ASD" / "weight" / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(weight_bytes)
    volume.commit()
    print(f"Uploaded {filename} ({len(weight_bytes) / 1e6:.1f} MB) to Volume")


@app.function(volumes={MODEL_DIR: volume})
def upload_cookies(cookie_bytes: bytes):
    dest = Path(MODEL_DIR) / "cookies.txt"
    dest.write_bytes(cookie_bytes)
    volume.commit()
    print("Uploaded cookies.txt to Volume")

@app.local_entrypoint()
def mount_cookies(local_path: str):
    with open(local_path, "rb") as f:
        cookie_bytes = f.read()
    upload_cookies.remote(cookie_bytes)




