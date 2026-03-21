#!/usr/bin/env python3
"""
server.py — Lightweight HTTP server that wraps smart_crop_active_speaker.py.

Convex (or any other caller) POSTs a job; the server:
  1. Downloads the source video from UploadThing (or any public URL).
  2. Calls the pipeline.
  3. Uploads the output MP4 + thumbnail to UploadThing (or S3).
  4. Returns { ok, clipUrl, thumbnailUrl }.

Start:
  uvicorn server:app --host 0.0.0.0 --port 8787 --workers 2

Or for a quick dev run:
  python server.py

Environment variables required:
  UPLOADTHING_SECRET   — UploadThing API key for uploads
  WORKER_SECRET        — Shared secret checked via X-Worker-Secret header
                         (keep this in your Convex env too)
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import tempfile
import urllib.request
from pathlib import Path
from typing import Optional

LOG = logging.getLogger("worker.server")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)

# ─── Try to import FastAPI; fall back to stdlib http.server ──────────────────
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.responses import JSONResponse
    import uvicorn
    _FASTAPI = True
except ImportError:
    _FASTAPI = False
    LOG.warning("FastAPI not installed — using stdlib HTTP server (single-threaded)")

# ── pipeline ──────────────────────────────────────────────────────────────────
from smart_crop_active_speaker import process_video  # noqa: E402

WORKER_SECRET = os.environ.get("WORKER_SECRET", "")


# ──────────────────────────────────────────────────────────────────────────────
# Upload helper — sends the processed file back to UploadThing
# ──────────────────────────────────────────────────────────────────────────────

def _upload_to_uploadthing(local_path: str, filename: str) -> str:
    """
    Upload a file to UploadThing using their direct presigned-URL flow.
    Returns the public ufsUrl of the uploaded file.

    Requires UPLOADTHING_SECRET env var.
    Full API reference: https://docs.uploadthing.com/api-reference/server
    """
    secret = os.environ.get("UPLOADTHING_SECRET", "")
    if not secret:
        raise RuntimeError("UPLOADTHING_SECRET env var is not set")

    file_size = Path(local_path).stat().st_size
    mime = "video/mp4" if local_path.endswith(".mp4") else "image/jpeg"

    # Step 1 — Request a presigned URL
    req_body = json.dumps({
        "files": [{"name": filename, "size": file_size, "type": mime}],
    }).encode()
    req = urllib.request.Request(
        "https://uploadthing.com/api/uploadFiles",
        data=req_body,
        headers={
            "Content-Type": "application/json",
            "X-Uploadthing-Api-Key": secret,
        },
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())

    presigned = data["data"][0]
    upload_url: str = presigned["url"]
    fields: dict = presigned.get("fields", {})
    file_url: str = presigned["fileUrl"]   # final public URL

    # Step 2 — Multipart POST to S3-compatible presigned URL
    with open(local_path, "rb") as fh:
        content = fh.read()

    boundary = b"----UploadThingBoundary"
    body_parts: list[bytes] = []
    for key, val in fields.items():
        body_parts.append(
            b"--" + boundary + b"\r\n"
            b'Content-Disposition: form-data; name="' + key.encode() + b'"\r\n\r\n'
            + val.encode() + b"\r\n"
        )
    body_parts.append(
        b"--" + boundary + b"\r\n"
        b'Content-Disposition: form-data; name="file"; filename="' + filename.encode() + b'"\r\n'
        b"Content-Type: " + mime.encode() + b"\r\n\r\n"
        + content + b"\r\n"
    )
    body_parts.append(b"--" + boundary + b"--\r\n")
    body = b"".join(body_parts)

    upload_req = urllib.request.Request(
        upload_url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary.decode()}"},
        method="POST",
    )
    with urllib.request.urlopen(upload_req) as resp:
        if resp.status not in (200, 204):
            raise RuntimeError(f"UploadThing S3 upload failed: {resp.status}")

    return file_url


def _download_video(url: str, dest: str) -> None:
    """Download a remote video to a local path."""
    LOG.info("Downloading %s…", url)
    urllib.request.urlretrieve(url, dest)
    LOG.info("Downloaded %.1f MB", Path(dest).stat().st_size / 1e6)


def _verify_secret(provided: str) -> bool:
    if not WORKER_SECRET:
        return True  # disabled — only for dev
    return hmac.compare_digest(
        hashlib.sha256(provided.encode()).digest(),
        hashlib.sha256(WORKER_SECRET.encode()).digest(),
    )


# ──────────────────────────────────────────────────────────────────────────────
# Request handler
# ──────────────────────────────────────────────────────────────────────────────

def handle_process_request(body: dict, secret_header: str) -> dict:
    """
    body keys:
      videoUrl      str      — public URL of the source video
      startTime     float    — clip start in seconds
      endTime       float    — clip end in seconds
      projectId     str      — used for output filenames
      clipIndex     int      — used for output filenames

    Returns:
      { ok, clipUrl, thumbnailUrl }
    """
    if not _verify_secret(secret_header or ""):
        return {"ok": False, "error": "Unauthorized"}

    video_url: str = body.get("videoUrl", "")
    start: float = float(body.get("startTime", 0))
    end: float = float(body.get("endTime", 0))
    project_id: str = body.get("projectId", "unknown")
    clip_index: int = int(body.get("clipIndex", 0))
    duration = max(1.0, end - start)

    if not video_url:
        return {"ok": False, "error": "videoUrl is required"}

    with tempfile.TemporaryDirectory(prefix="sp_job_") as tmpdir:
        src_path = str(Path(tmpdir) / "source.mp4")
        out_path = str(Path(tmpdir) / "clip.mp4")
        thumb_path = str(Path(tmpdir) / "thumb.jpg")

        # Download source
        try:
            _download_video(video_url, src_path)
        except Exception as exc:
            return {"ok": False, "error": f"Download failed: {exc}"}

        # Run pipeline
        try:
            process_video(
                input_path=src_path,
                output_path=out_path,
                start_s=start,
                duration_s=duration,
                thumb_path=thumb_path,
                dynamic_crop=True,
            )
        except Exception as exc:
            LOG.exception("Pipeline error")
            return {"ok": False, "error": f"Pipeline failed: {exc}"}

        # Upload outputs
        slug = f"{project_id}-clip{clip_index}"
        try:
            clip_url = _upload_to_uploadthing(out_path, f"{slug}.mp4")
            thumb_url: Optional[str] = None
            if Path(thumb_path).exists():
                thumb_url = _upload_to_uploadthing(thumb_path, f"{slug}-thumb.jpg")
        except Exception as exc:
            LOG.exception("Upload error")
            return {"ok": False, "error": f"Upload failed: {exc}"}

    return {"ok": True, "clipUrl": clip_url, "thumbnailUrl": thumb_url}


# ──────────────────────────────────────────────────────────────────────────────
# FastAPI app (preferred)
# ──────────────────────────────────────────────────────────────────────────────

if _FASTAPI:
    app = FastAPI(title="ShortPurify Video Worker")

    @app.get("/health")
    def health():
        return {"ok": True}

    @app.post("/api/process-video")
    async def process_video_endpoint(request: Request):
        body = await request.json()
        secret = request.headers.get("X-Worker-Secret", "")
        result = handle_process_request(body, secret)
        status = 200 if result.get("ok") else 500
        return JSONResponse(content=result, status_code=status)

    if __name__ == "__main__":
        uvicorn.run("server:app", host="0.0.0.0", port=8787, reload=False, workers=1)

# ──────────────────────────────────────────────────────────────────────────────
# stdlib fallback (single-threaded, no external deps)
# ──────────────────────────────────────────────────────────────────────────────
else:
    import http.server
    import socketserver

    class _Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            LOG.info(fmt, *args)

        def do_GET(self):
            if self.path == "/health":
                self._json({"ok": True})
            else:
                self._json({"ok": False, "error": "Not found"}, 404)

        def do_POST(self):
            if self.path != "/api/process-video":
                self._json({"ok": False, "error": "Not found"}, 404)
                return
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            secret = self.headers.get("X-Worker-Secret", "")
            result = handle_process_request(body, secret)
            self._json(result, 200 if result.get("ok") else 500)

        def _json(self, data: dict, code: int = 200):
            payload = json.dumps(data).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    if __name__ == "__main__":
        PORT = int(os.environ.get("PORT", 8787))
        with socketserver.TCPServer(("", PORT), _Handler) as httpd:
            LOG.info("Worker listening on :%d", PORT)
            httpd.serve_forever()
