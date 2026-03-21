# ShortPurify Python Video Worker

Replaces Cloudinary with local FFmpeg + AI-based active speaker detection.

## Architecture

```
Convex Workflow
  └─ POST https://your-username--shortpurify-process-video.modal.run/api/process-video
              │
         Modal Function (serverless, scales to 0)
              ├─ Downloads source video (UploadThing URL)
              ├─ FFmpeg segment extraction
              ├─ YOLOv8n-face detection
              ├─ LR-ASD active speaker scoring
              ├─ Smooth crop trajectory (scipy Gaussian)
              ├─ FFmpeg 1080×1920 encode
              └─ Uploads clip + thumbnail → UploadThing → returns URLs
```

---

## Setup

### 1. Install Modal CLI

```bash
pip install modal
modal token new      # opens browser to authenticate
```

### 2. Create Modal secrets

```bash
modal secret create shortpurify-secrets \
    UPLOADTHING_SECRET=sk_live_YOUR_KEY \
    WORKER_SECRET=some_random_string_here
```

### 3. Deploy the app

```bash
cd python-worker
modal deploy modal_app.py
```

Modal will print the endpoint URL:
```
✓ Created web endpoint https://your-username--shortpurify-process-video.modal.run
```

### 4. Set the URL in Convex

```bash
npx convex env set VIDEO_WORKER_URL "https://your-username--shortpurify-process-video.modal.run"
npx convex env set VIDEO_WORKER_SECRET "some_random_string_here"
```

### 5. (Optional but recommended) Add LR-ASD weights

Without weights the pipeline uses a largest-face heuristic (works fine for
single-presenter footage). For multi-speaker content, add the real model:

**Option A — download from Google Drive using gdown:**
```bash
pip install gdown
# Get the file ID from https://github.com/Junhua-Liao/LR-ASD#pretrained-models
modal run modal_app.py::setup_weights --gdrive-file-id YOUR_FILE_ID
```

**Option B — you already have the file locally:**
```bash
python setup_modal_weights.py --weights /path/to/finetuning_AVA.model
```

---

## Local testing (no Modal)

```bash
pip install -r requirements.txt
# Also need: git clone https://github.com/Junhua-Liao/LR-ASD

python smart_crop_active_speaker.py \
    --input  sample.mp4   \
    --start  10           \
    --duration 30         \
    --output out.mp4      \
    --thumb  thumb.jpg    \
    --verbose
```

---

## Cost estimate (Modal)

| Clip length | CPU config | Approx time | Approx cost |
|-------------|-----------|-------------|-------------|
| 15s clip    | 4 CPU     | ~45s        | ~$0.001     |
| 60s clip    | 4 CPU     | ~3 min      | ~$0.004     |
| 60s clip    | T4 GPU    | ~40s        | ~$0.007     |

Modal bills per second of actual compute (free $30/month tier included).

To use GPU, change `cpu=4.0, memory=8192` to `gpu="t4"` in `modal_app.py`.

---

## Files

| File | Purpose |
|------|---------|
| `modal_app.py` | Modal serverless app — web endpoint + setup helpers |
| `smart_crop_active_speaker.py` | Core pipeline (FFmpeg + face detection + ASD + crop) |
| `setup_modal_weights.py` | Upload LR-ASD weights to Modal Volume |
| `server.py` | Self-hosted HTTP server alternative (no Modal required) |
| `requirements.txt` | Python dependencies for local use |
