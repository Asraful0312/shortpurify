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
        "ffmpeg", "git", "curl",
        "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev", "libgl1-mesa-glx",
        "libass-dev", "fonts-liberation",
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


# ── Subtitle burn endpoint ────────────────────────────────────────────────────

def _generate_ass(subtitle_words: list, settings: dict, vid_w: int, vid_h: int) -> str:
    """Build an ASS subtitle file matching the frontend's word-by-word karaoke style.

    Each word gets its own positioned event so Base and HL layers are pixel-perfect.
    Words appear one-by-one (append style), hide during long speech pauses, and show
    only the last 2 rows — identical to the SubtitleOverlay React component.
    """
    font_size_px = max(20, int(int(settings.get("fontSize", 26)) * vid_w / 390))

    try:
        from PIL import ImageFont
        font_paths = [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
        ]
        font_obj = None
        for p in font_paths:
            try:
                font_obj = ImageFont.truetype(p, font_size_px)
                break
            except Exception:
                pass

        def word_width(text: str) -> float:
            return font_obj.getlength(text) if font_obj else len(text) * font_size_px * 0.55
    except ImportError:
        def word_width(text: str) -> float:
            return len(text) * font_size_px * 0.55

    # Map frontend fontFamily to installed system fonts
    main_font = settings.get("fontFamily", "Inter, sans-serif").split(",")[0].strip()
    ASS_FONT_MAP = {
        "Inter": "Liberation Sans",
        "Arial": "Liberation Sans",
        "Impact": "Liberation Sans",
        "Georgia": "Liberation Serif",
        "Courier New": "Liberation Mono",
    }
    ass_font = ASS_FONT_MAP.get(main_font, "Liberation Sans")

    words_per_line = int(settings.get("wordsPerLine", 3))
    center_x = int(float(settings.get("x", 50)) / 100.0 * vid_w)
    center_y = int(float(settings.get("y", 78)) / 100.0 * vid_h)

    def hex_to_ass(color: str) -> str:
        h = color.lstrip("#")
        r, g, b = h[0:2], h[2:4], h[4:6]
        return f"&H00{b}{g}{r}".upper()

    text_col = hex_to_ass(settings.get("textColor", "#ffffff"))
    hl_text  = hex_to_ass(settings.get("highlightColor", "#000000"))
    hl_bg    = hex_to_ass(settings.get("highlightBg", "#facc15"))

    def ms_to_ass(ms: float) -> str:
        ms = int(ms)
        cs = (ms % 1000) // 10
        s  = (ms // 1000) % 60
        m  = (ms // 60000) % 60
        h  = ms // 3600000
        return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

    LONG_PAUSE_MS = 800
    WORD_GAP  = max(4, int(font_size_px * 0.25))
    LINE_HEIGHT = int(font_size_px * 1.4)

    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        f"PlayResX: {vid_w}\n"
        f"PlayResY: {vid_h}\n"
        "WrapStyle: 0\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, "
        "Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
        # Base: bold white text + drop shadow
        f"Style: Base,{ass_font},{font_size_px},{text_col},{text_col},&H00000000,&H00000000,"
        "-1,0,0,0,100,100,0,0,1,3,2,5,10,10,0,1\n"
        # HL: opaque solid box.  Both OutlineColour AND BackColour are set to hl_bg
        # because different libass builds use one or the other for the BorderStyle=3 box.
        f"Style: HL,{ass_font},{font_size_px},{hl_text},{hl_text},{hl_bg},{hl_bg},"
        "-1,0,0,0,100,100,0,0,3,0,0,5,10,10,0,1\n\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )

    n = len(subtitle_words)
    dialogue_lines: list[str] = []

    for wi, word in enumerate(subtitle_words):
        event_start = word["startMs"]

        # Determine how long to keep this word-state visible
        if wi + 1 < n:
            next_start = subtitle_words[wi + 1]["startMs"]
            gap = next_start - word["endMs"]
            # Short gap: stay visible until next word; long gap: hide shortly after end
            event_end = next_start if gap <= LONG_PAUSE_MS else word["endMs"] + 200
        else:
            event_end = word["endMs"] + 200

        if event_end <= event_start:
            continue

        # Build display state — mirrors the React component exactly
        spoken = subtitle_words[:wi + 1]
        all_chunks = [spoken[i:i + words_per_line] for i in range(0, len(spoken), words_per_line)]
        display_chunks = all_chunks[-2:]  # last 2 rows only

        num_rows = len(display_chunks)
        t_start = ms_to_ass(event_start)
        t_end   = ms_to_ass(event_end)

        for row_idx, chunk in enumerate(display_chunks):
            # Vertical position: centre both rows around center_y
            if num_rows == 1:
                row_y = center_y
            else:
                row_y = center_y - LINE_HEIGHT // 2 + row_idx * LINE_HEIGHT

            # Measure words and lay them out horizontally, centred on center_x
            widths = [word_width(w["text"]) for w in chunk]
            total_w = sum(widths) + WORD_GAP * max(0, len(chunk) - 1)
            x_cursor = center_x - total_w / 2

            for col_idx, cw in enumerate(chunk):
                # Each word gets its own \pos — Base and HL share the exact same coordinate
                wx = int(x_cursor + widths[col_idx] / 2)

                # Base layer: white word visible for the entire event duration
                dialogue_lines.append(
                    f"Dialogue: 0,{t_start},{t_end},Base,,0,0,0,,"
                    f"{{\\pos({wx},{row_y})\\an5}}{cw['text']}"
                )

                # HL layer: solid colour box around the active (being spoken) word.
                # Uses the HL style (BorderStyle=3 opaque box) with both OutlineColour
                # and BackColour set to hl_bg so it works across all libass versions.
                if cw is word and word["endMs"] > word["startMs"]:
                    hl_s = ms_to_ass(word["startMs"])
                    hl_e = ms_to_ass(word["endMs"])
                    dialogue_lines.append(
                        f"Dialogue: 1,{hl_s},{hl_e},HL,,0,0,0,,"
                        f"{{\\pos({wx},{row_y})\\an5}}{word['text']}"
                    )

                x_cursor += widths[col_idx] + WORD_GAP

    return header + "\n".join(dialogue_lines) + "\n"


@app.function(
    secrets=[modal.Secret.from_name("shortpurify-secrets")],
    cpu=2.0,
    memory=2048,
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
    import subprocess

    if not _verify_secret(body.get("workerSecret", "")):
        return {"ok": False, "error": "Unauthorized"}

    clip_url   = body.get("clipUrl", "")
    upload_url = body.get("uploadUrl", "")
    words      = body.get("subtitleWords", [])
    settings   = body.get("settings", {})

    if not clip_url or not upload_url:
        return {"ok": False, "error": "clipUrl and uploadUrl are required"}

    with tempfile.TemporaryDirectory(prefix="sp_sub_") as tmpdir:
        input_path  = f"{tmpdir}/input.mp4"
        ass_path    = f"{tmpdir}/subs.ass"
        output_path = f"{tmpdir}/output.mp4"

        try:
            _download_url(clip_url, input_path)
        except Exception as exc:
            return {"ok": False, "error": f"Download failed: {exc}"}

        # Get video dimensions via ffprobe
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_streams", input_path],
            capture_output=True, text=True,
        )
        info = json.loads(probe.stdout)
        vid_stream = next(
            (s for s in info.get("streams", []) if s.get("codec_type") == "video"),
            None,
        )
        vid_w = int(vid_stream["width"])  if vid_stream else 1080
        vid_h = int(vid_stream["height"]) if vid_stream else 1920

        # Write ASS file
        ass_content = _generate_ass(words, settings, vid_w, vid_h)
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(ass_content)

        # Burn subtitles — escape the path for the vf string
        safe_ass = ass_path.replace("\\", "/").replace(":", "\\:")
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", input_path,
             "-vf", f"ass={safe_ass}",
             "-c:v", "libx264", "-preset", "fast", "-crf", "22",
             "-c:a", "copy",
             "-movflags", "+faststart",
             "-loglevel", "error",
             output_path],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            return {"ok": False, "error": f"FFmpeg failed: {result.stderr[-500:]}"}

        try:
            _upload_to_r2(upload_url, output_path)
        except Exception as exc:
            return {"ok": False, "error": f"Upload failed: {exc}"}

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
