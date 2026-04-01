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
        "wget -qO /usr/share/fonts/truetype/custom/Inter-Bold.ttf https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Bold.ttf || true",
        "wget -qO /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf || true",
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
    duration = max(1.0, end - start)

    if not video_url:
        return {"ok": False, "error": "videoUrl is required"}
    if not clip_upload_url:
        return {"ok": False, "error": "clipUploadUrl is required"}

    import smart_crop_active_speaker as pipeline

    pipeline._LR_ASD_DIR = Path(MODEL_DIR) / "LR-ASD"
    os.environ["YOLO_CONFIG_DIR"] = "/opt"
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
        "impact": "/usr/share/fonts/truetype/custom/Anton-Regular.ttf",
        "arial": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "georgia": "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "courier": "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
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

    LINE_HEIGHT = int(font_size_px * 1.4)
    pad_x       = int(font_size_px * 0.2)
    pad_y       = int(font_size_px * 0.12)
    gap_x       = int(font_size_px * 0.2)
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

    def layout_row(chunk, base_fnt):
        """Return (scaled_font, scale, span_widths, total_w, c_pad_x, c_pad_y, c_gap_x, rad)"""
        w_sum = sum(measure(cw["text"], base_fnt) + 2 * pad_x for cw in chunk)
        tw    = w_sum + gap_x * max(0, len(chunk) - 1)
        sc    = 1.0
        sfnt  = base_fnt
        max_w = vid_w * 0.85
        if tw > max_w:
            sc   = max_w / tw
            sfnt = scale_font(base_fnt, int(font_size_px * sc))
        cp_x = int(pad_x * sc)
        cp_y = int(pad_y * sc)
        cg_x = int(gap_x * sc)
        rad  = int(c_radius * sc)
        spans = [measure(cw["text"], sfnt) + 2 * cp_x for cw in chunk]
        total = sum(spans) + cg_x * max(0, len(chunk) - 1)
        return sfnt, sc, spans, total, cp_x, cp_y, cg_x, rad

    # ── per-template render functions ────────────────────────────────────────

    def render_classic(_img, draw, shadow_draw, display_chunks, num_rows, active_word):
        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
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

            text_y  = int(row_cy - (std_bottom + std_top) / 2)
            x_cur   = center_x - total_w / 2
            for col_idx, cw in enumerate(chunk):
                span_w = spans[col_idx]
                x_int  = int(x_cur)
                is_act = (cw is active_word)
                wt     = cw["text"].upper()
                fill   = hl_text_rgba if is_act else text_rgba
                if sfnt:
                    draw_outlined_text(draw, (x_int + cp_x, text_y), wt, sfnt, fill, stroke_w, (0, 0, 0, 255))
                x_cur += span_w + cg_x

    def render_neon(img, draw, _shadow_draw, display_chunks, num_rows, active_word):
        # highlightBg is repurposed as the glow colour for this template
        glow_rgba = hl_bg_rgba
        bar_pad_x = int(14 * scale_factor)
        bar_pad_y = int(5 * scale_factor)

        # Pre-compute layout so we can do 3 ordered passes (strip → glow → text)
        row_layouts = []
        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
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

    def render_cinematic(_img, draw, _shadow_draw, display_chunks, num_rows, active_word):
        bar_h    = int(LINE_HEIGHT * 1.3)
        bar_pad  = int(4 * scale_factor)
        total_bar_h = bar_h * num_rows + bar_pad * (num_rows - 1)
        bar_top  = int(center_y - total_bar_h / 2)
        # Full-width dark bar across all rows
        draw.rectangle([0, bar_top - bar_pad, vid_w, bar_top + total_bar_h + bar_pad],
                       fill=(0, 0, 0, 178))
        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
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

    def render_minimal(_img, draw, shadow_draw, display_chunks, num_rows, active_word):
        uline_rgba = hl_bg_rgba  # underline uses highlightBg
        uline_w    = max(2, int(3 * scale_factor))
        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
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

    def render_beasty(_img, draw, shadow_draw, display_chunks, num_rows, active_word):
        for chunk in display_chunks:
            for cw in chunk:
                cw["text"] = cw["text"].upper()

        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
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


    def render_karaoke(_img, draw, shadow_draw, display_chunks, num_rows, active_word):
        K_SCALE = 1.15
        for chunk in display_chunks:
            for cw in chunk:
                cw["text"] = cw["text"].upper()
                
        for row_idx, chunk in enumerate(display_chunks):
            sfnt, sc, spans, total_w, cp_x, cp_y, cg_x, rad = layout_row(chunk, font_obj)
            
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
                # Optional visual pop-up offset for active bigger font
                y_offset = -int((K_SCALE - 1.0) * font_size_px * sc * 0.7) if is_act else 0
                
                if sfnt:
                    shadow_draw.text((x_int + cp_x, text_y + y_offset + int(2 * scale_factor)), wt, font=fnt_to_use, fill=(0, 0, 0, 255), anchor="la")
                    draw_outlined_text(draw, (x_int + cp_x, text_y + y_offset), wt, fnt_to_use, fill, stroke, (0, 0, 0, 216))
                x_cur += span_w + cg_x

    # ── main loop ────────────────────────────────────────────────────────────

    RENDER_FNS = {
        "classic":   render_classic,
        "neon":      render_neon,
        "cinematic": render_cinematic,
        "minimal":   render_minimal,
        "beasty":    render_beasty,
        "karaoke":   render_karaoke,
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
        display_chunks = all_chunks[-2:]
        num_rows       = len(display_chunks)

        img          = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
        draw         = ImageDraw.Draw(img)
        shadow_layer = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
        shadow_draw  = ImageDraw.Draw(shadow_layer)

        render_fn(img, draw, shadow_draw, display_chunks, num_rows, word)

        # Composite shadow/glow
        # Neon manages its own glow internally (composited directly into img),
        # so no shadow_layer processing is needed for that template.
        if template == "neon":
            final_img = img
        else:
            blur1 = shadow_layer.filter(ImageFilter.GaussianBlur(int(4 * scale_factor)))
            blur2 = shadow_layer.filter(ImageFilter.GaussianBlur(int(8 * scale_factor)))
            final_img = Image.new("RGBA", (vid_w, vid_h), (0, 0, 0, 0))
            final_img.alpha_composite(blur2)
            final_img.alpha_composite(blur1)
            final_img.alpha_composite(img)

        png_path = f"{tmpdir}/frame_{wi:05d}.png"
        final_img.save(png_path, "PNG")
        frames.append((ev_start_ms / 1000.0, ev_end_ms / 1000.0, png_path))

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




