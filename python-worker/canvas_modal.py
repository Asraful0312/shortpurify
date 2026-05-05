"""
canvas_modal.py — Node-canvas + ffmpeg subtitle burn worker for Modal.

Renders subtitle overlays with all 8 templates and word entrance animations.
Uses node-canvas (native C++ canvas) instead of Chromium → ~30-90s vs 5-7min.

Required Modal secret (shortpurify-secrets):
  WORKER_SECRET — shared secret validated on every request

Env var in Convex:
  BURN_SUBTITLES_URL — set to the Modal endpoint URL returned after deployment
"""

import modal
import os
import json
import subprocess
from pathlib import Path

# ─── Image ────────────────────────────────────────────────────────────────────

local_worker = Path(__file__).resolve().parent.parent / "node-canvas-worker"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install([
        # Build tools for node-canvas native addon
        "build-essential",
        "python3",
        "pkg-config",
        # Cairo / Pango — required by node-canvas
        "libcairo2-dev",
        "libpango1.0-dev",
        "libjpeg-dev",
        "libgif-dev",
        "librsvg2-dev",
        # ffmpeg for video processing
        "ffmpeg",
        # Fonts
        "fonts-liberation",        # Liberation Sans (Arial substitute)
        "fonts-open-sans",         # Open Sans
        "fonts-dejavu",            # DejaVu family (good Unicode coverage)
        "fontconfig",
        # curl for Node.js installer
        "curl",
        "ca-certificates",
        "gnupg",
    ])
    .run_commands(
        # Install Node.js 20 via NodeSource
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs",
        "node --version",
        "npm --version",
        # Refresh font cache
        "fc-cache -fv",
    )
    .add_local_dir(str(local_worker), remote_path="/worker", copy=True)
    .run_commands(
        # Build canvas from source so it links against the system Cairo/Pango.
        # Pre-built binaries may lack Pango support, causing ctx.fillText() to silently fail.
        "cd /worker && npm install --build-from-source canvas",
        # Install remaining dependencies (tsx etc.)
        "cd /worker && npm install",
        # Verify tsx is available
        "cd /worker && node_modules/.bin/tsx --version",
        # Download fonts into a Fontconfig-scanned directory so Pango can find them.
        # /usr/local/share/fonts/ is always scanned by fontconfig on Debian.
        "mkdir -p /usr/local/share/fonts/canvas",
        "curl -fsSL -o /usr/local/share/fonts/canvas/Impact.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf'",
        "curl -fsSL -o /usr/local/share/fonts/canvas/Inter-Black.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Black.ttf'",
        "curl -fsSL -o /usr/local/share/fonts/canvas/Inter-Bold.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf'",
        "curl -fsSL -o /usr/local/share/fonts/canvas/Inter-Regular.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf'",
        "curl -fsSL -o /usr/local/share/fonts/canvas/Bangers.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/bangers/Bangers-Regular.ttf'",
        "curl -fsSL -o /usr/local/share/fonts/canvas/ComicRelief.ttf "
            "'https://github.com/google/fonts/raw/main/ofl/comicrelief/ComicRelief-Regular.ttf'",
        # Rebuild Fontconfig cache so Pango discovers the new fonts
        "fc-cache -fv",
        "fc-list | grep -i inter || echo 'WARNING: Inter not found in fc-list'",
        "fc-list | grep -i impact || echo 'WARNING: Impact not found in fc-list'",
        "ls -lh /usr/local/share/fonts/canvas/",
        # Also keep a /worker/fonts symlink for registerFont() in render.ts
        "ln -s /usr/local/share/fonts/canvas /worker/fonts",
    )
    .pip_install("fastapi[standard]")
)

app = modal.App("shortpurify-canvas-worker", image=image)

# ─── Worker class ─────────────────────────────────────────────────────────────

@app.cls(
    secrets=[modal.Secret.from_name("shortpurify-secrets")],
    cpu=4.0,
    timeout=600,  # 10 minute timeout
)
class CanvasWorker:

    @modal.fastapi_endpoint(method="POST")
    async def burn_subtitles(self, body: dict):
        from fastapi.responses import JSONResponse

        # Validate shared secret
        expected = os.environ.get("WORKER_SECRET", "")
        if expected and body.get("workerSecret") != expected:
            return JSONResponse({"ok": False, "error": "Unauthorized"}, status_code=401)

        # Run the Node.js render script, pass request body via stdin
        payload = json.dumps(body)
        result = subprocess.run(
            ["node_modules/.bin/tsx", "src/render.ts"],
            input=payload,
            capture_output=True,
            text=True,
            cwd="/worker",
            timeout=540,  # 9 min (leave 1 min for overhead)
        )

        if result.returncode != 0:
            err_tail = (result.stderr or "")[-1000:]
            print(f"[canvas] Node stderr:\n{err_tail}")
            return JSONResponse(
                {"ok": False, "error": f"Node process exited {result.returncode}: {err_tail}"},
                status_code=500,
            )

        # Print Node stderr to Modal logs for debugging
        if result.stderr:
            print(f"[canvas] Node log:\n{result.stderr[-4000:]}")

        try:
            output = json.loads(result.stdout.strip())
            return JSONResponse(output)
        except Exception:
            return JSONResponse({"ok": True})
