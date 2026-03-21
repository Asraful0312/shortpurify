#!/usr/bin/env bash
# setup.sh — One-time setup for the ShortPurify Python video worker
# Run from the python-worker/ directory:  bash setup.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Checking FFmpeg..."
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: FFmpeg is not installed."
  echo "  macOS:    brew install ffmpeg"
  echo "  Ubuntu:   sudo apt install ffmpeg"
  echo "  Windows:  https://ffmpeg.org/download.html"
  exit 1
fi
ffmpeg -version | head -1

echo ""
echo "==> Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo ""
echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "==> Cloning LR-ASD (Active Speaker Detection)..."
if [ ! -d "LR-ASD" ]; then
  git clone https://github.com/Junhua-Liao/LR-ASD.git
else
  echo "   LR-ASD already cloned. Skipping."
fi

echo ""
echo "==> Checking for LR-ASD weights..."
WEIGHT_DIR="LR-ASD/weight"
mkdir -p "$WEIGHT_DIR"

# The repo's README lists Google Drive links for the weights.
# As of 2024 the fine-tuned AVA model is the best option.
# If gdown is available, download automatically; otherwise print instructions.
if python3 -c "import gdown" &>/dev/null; then
  echo "   Downloading finetuning_AVA.model via gdown..."
  # Replace GDRIVE_FILE_ID with the actual ID from the LR-ASD repo README
  # gdown "https://drive.google.com/uc?id=GDRIVE_FILE_ID" -O "$WEIGHT_DIR/finetuning_AVA.model"
  echo "   NOTE: Uncomment the gdown line above with the correct Google Drive file ID"
  echo "   from https://github.com/Junhua-Liao/LR-ASD#pretrained-models"
else
  echo ""
  echo "   MANUAL STEP REQUIRED:"
  echo "   1. Go to https://github.com/Junhua-Liao/LR-ASD#pretrained-models"
  echo "   2. Download 'finetuning_AVA.model' (or 'pretrain_AVA.model')"
  echo "   3. Place it in: $SCRIPT_DIR/$WEIGHT_DIR/"
  echo ""
  echo "   The pipeline will still work without LR-ASD weights —"
  echo "   it falls back to a largest-face heuristic for speaker selection."
fi

echo ""
echo "==> Setup complete!"
echo ""
echo "To start the worker:"
echo "   source .venv/bin/activate"
echo "   WORKER_SECRET=your_secret UPLOADTHING_SECRET=sk_live_xxx uvicorn server:app --host 0.0.0.0 --port 8787"
echo ""
echo "Test the pipeline directly:"
echo "   python smart_crop_active_speaker.py --input sample.mp4 --start 10 --duration 30 --output out.mp4 --thumb thumb.jpg --verbose"
