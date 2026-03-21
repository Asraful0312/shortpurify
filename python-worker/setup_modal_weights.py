"""
setup_modal_weights.py
──────────────────────
Push a locally-downloaded LR-ASD weight file into the Modal Volume.

Use this when you've already downloaded the weights manually
(e.g. from Google Drive) and just need to push them to Modal.

Usage:
  python setup_modal_weights.py --weights /path/to/finetuning_AVA.model

Or, if your weight file is on Google Drive and you have gdown installed:
  pip install gdown
  gdown "https://drive.google.com/uc?id=YOUR_FILE_ID" -O finetuning_AVA.model
  python setup_modal_weights.py --weights finetuning_AVA.model
"""

import argparse
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--weights",
        required=True,
        help="Local path to the LR-ASD weight file (finetuning_AVA.model or pretrain_AVA.model)",
    )
    parser.add_argument(
        "--filename",
        default="finetuning_AVA.model",
        help="Name to store as inside the Modal Volume (default: finetuning_AVA.model)",
    )
    args = parser.parse_args()

    weight_path = Path(args.weights)
    if not weight_path.exists():
        print(f"ERROR: File not found: {weight_path}")
        sys.exit(1)

    size_mb = weight_path.stat().st_size / 1e6
    print(f"Uploading {weight_path.name} ({size_mb:.1f} MB) to Modal Volume…")

    import modal
    from modal_app import upload_local_weights  # imports the Modal function

    with modal.enable_output():
        upload_local_weights.remote(
            weight_bytes=weight_path.read_bytes(),
            filename=args.filename,
        )

    print("Done. The weight is now available to every Modal container via the Volume.")


if __name__ == "__main__":
    main()
