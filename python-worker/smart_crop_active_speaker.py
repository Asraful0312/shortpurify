#!/usr/bin/env python3
"""
smart_crop_active_speaker.py
─────────────────────────────────────────────────────────────────────────────
Replace Cloudinary video transformations with fully local FFmpeg + AI-based
active speaker detection for smart 9:16 vertical crop.

Pipeline
  1. Download or use a local source video.
  2. Extract the desired segment (start / duration) via FFmpeg.
  3. Detect faces every N frames with YOLOv8n-face (→ MediaPipe → Haar fallback).
  4. Track faces across frames with a greedy IoU tracker.
  5. Score each track with LR-ASD (active speaker detection).
     Falls back to largest-face heuristic when LR-ASD is unavailable.
  6. Compute a Gaussian-smoothed crop trajectory centered on the dominant speaker.
  7. Apply FFmpeg crop + scale → 1080×1920 MP4.
  8. Extract a JPEG thumbnail from the first frame of the output.
  9. Print a JSON result to stdout so the caller (Node.js) can parse it.

CLI
  python smart_crop_active_speaker.py \
      --input   /path/to/source.mp4   \
      --start   10.0                  \
      --duration 30.0                 \
      --output  /path/to/out.mp4      \
      --thumb   /path/to/thumb.jpg    \
      [--static-crop]                 \
      [--verbose]

JSON stdout on success:
  {"ok": true, "output": "/path/to/out.mp4", "thumb": "/path/to/thumb.jpg"}

JSON stdout on error:
  {"ok": false, "error": "...message..."}
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np

# ─── Optional imports (degrade gracefully) ────────────────────────────────────

try:
    from ultralytics import YOLO as _YOLO_CLASS
    _YOLO_AVAIL = True
except ImportError:
    _YOLO_AVAIL = False

try:
    import mediapipe as _mp_module
    _MP_AVAIL = True
except ImportError:
    _MP_AVAIL = False

try:
    import torch as _torch
    _TORCH_AVAIL = True
except ImportError:
    _TORCH_AVAIL = False

try:
    from scipy.ndimage import gaussian_filter1d as _gauss1d
    _SCIPY_AVAIL = True
except ImportError:
    _SCIPY_AVAIL = False

# LR-ASD repo must be cloned next to this script:
#   git clone https://github.com/Junhua-Liao/LR-ASD
_LR_ASD_DIR = Path(__file__).parent / "LR-ASD"
_LR_ASD_AVAIL = (_LR_ASD_DIR / "model.py").exists()

# ─── Output target ────────────────────────────────────────────────────────────
TARGET_W = 1080
TARGET_H = 1920

LOG = logging.getLogger("smart_crop")


# ══════════════════════════════════════════════════════════════════════════════
# Data model
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class BBox:
    """Axis-aligned bounding box in pixel coordinates (x1 y1 x2 y2)."""
    x1: float
    y1: float
    x2: float
    y2: float
    conf: float = 1.0
    track_id: int = -1

    @property
    def cx(self) -> float:
        return (self.x1 + self.x2) * 0.5

    @property
    def cy(self) -> float:
        return (self.y1 + self.y2) * 0.5

    @property
    def w(self) -> float:
        return max(0.0, self.x2 - self.x1)

    @property
    def h(self) -> float:
        return max(0.0, self.y2 - self.y1)

    def area(self) -> float:
        return self.w * self.h

    def iou(self, other: "BBox") -> float:
        ix1 = max(self.x1, other.x1)
        iy1 = max(self.y1, other.y1)
        ix2 = min(self.x2, other.x2)
        iy2 = min(self.y2, other.y2)
        inter = max(0.0, ix2 - ix1) * max(0.0, iy2 - iy1)
        union = self.area() + other.area() - inter
        return inter / union if union > 0 else 0.0


@dataclass
class FaceTrack:
    track_id: int
    # One slot per frame index; None = face not visible in that frame
    boxes: List[Optional[BBox]]
    # 0..1 speaking confidence from LR-ASD (or heuristic)
    speaking_score: float = 0.0


# ══════════════════════════════════════════════════════════════════════════════
# Step 1 — Face detection
# ══════════════════════════════════════════════════════════════════════════════

class FaceDetector:
    """
    Multi-backend face detector.

    Priority order (first available wins):
      1. YOLOv8n-face   — best accuracy, fast on CPU for short clips
      2. MediaPipe       — no extra download, slightly lower accuracy
      3. Haar cascade    — built into OpenCV, lowest accuracy, always available
    """

    def __init__(self) -> None:
        self._mode = "none"
        self._yolo = None
        self._mp_det = None
        self._haar = None

        if _YOLO_AVAIL:
            try:
                # Use YOLO_CONFIG_DIR/yolov8n-face.pt if set, otherwise default location
                _yolo_dir = os.environ.get("YOLO_CONFIG_DIR", ".")
                _model_path = os.path.join(_yolo_dir, "yolov8n-face.pt")
                if not os.path.exists(_model_path):
                    _model_path = "yolov8n-face.pt"  # fallback: let YOLO auto-download
                self._yolo = _YOLO_CLASS(_model_path, verbose=False)
                self._mode = "yolo"
                LOG.info("FaceDetector backend: YOLOv8n-face")
                return
            except Exception as exc:
                LOG.warning("YOLO init failed (%s), trying MediaPipe", exc)

        if _MP_AVAIL:
            try:
                self._mp_det = (
                    _mp_module.solutions.face_detection.FaceDetection(
                        model_selection=1, min_detection_confidence=0.6
                    )
                )
                self._mode = "mediapipe"
                LOG.info("FaceDetector backend: MediaPipe")
                return
            except Exception as exc:
                LOG.warning("MediaPipe init failed (%s), falling back to Haar", exc)

        # Always-available Haar fallback
        cascade = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._haar = cv2.CascadeClassifier(cascade)
        self._mode = "haar"
        LOG.warning("FaceDetector backend: Haar cascade (low accuracy)")

    def detect(self, frame_bgr: np.ndarray) -> List[BBox]:
        h, w = frame_bgr.shape[:2]

        if self._mode == "yolo":
            results = self._yolo.predict(frame_bgr, conf=0.35, verbose=False)
            return [
                BBox(
                    float(b.xyxy[0][0]), float(b.xyxy[0][1]),
                    float(b.xyxy[0][2]), float(b.xyxy[0][3]),
                    conf=float(b.conf[0]),
                )
                for r in results for b in r.boxes
            ]

        elif self._mode == "mediapipe":
            rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            res = self._mp_det.process(rgb)
            boxes: List[BBox] = []
            if res.detections:
                for det in res.detections:
                    rb = det.location_data.relative_bounding_box
                    x1 = max(0.0, rb.xmin) * w
                    y1 = max(0.0, rb.ymin) * h
                    x2 = min(float(w), x1 + rb.width * w)
                    y2 = min(float(h), y1 + rb.height * h)
                    score = float(det.score[0]) if det.score else 0.5
                    boxes.append(BBox(x1, y1, x2, y2, conf=score))
            return boxes

        else:  # Haar
            gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
            rects = self._haar.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40)
            )
            return [
                BBox(float(x), float(y), float(x + ww), float(y + hh))
                for (x, y, ww, hh) in (rects if len(rects) else [])
            ]


# ══════════════════════════════════════════════════════════════════════════════
# Step 2 — Face tracking (greedy IoU)
# ══════════════════════════════════════════════════════════════════════════════

_IOU_THRESHOLD = 0.30
_MAX_MISS = 10  # frames before a track is retired


class FaceTracker:
    """
    Simple greedy IoU multi-object tracker.
    Robust for stable talking-head footage; no deep feature embedding needed.
    """

    def __init__(self) -> None:
        self._next_id = 0
        self._active: Dict[int, BBox] = {}
        self._miss: Dict[int, int] = {}

    def update(self, detections: List[BBox]) -> List[Tuple[int, BBox]]:
        """
        Match current detections to active tracks via greedy IoU.
        Returns list of (track_id, bbox) for the current frame.
        """
        unmatched = list(range(len(detections)))
        new_active: Dict[int, BBox] = {}

        for tid, last_box in self._active.items():
            best_iou, best_di = 0.0, -1
            for di in unmatched:
                iou = last_box.iou(detections[di])
                if iou > best_iou:
                    best_iou, best_di = iou, di

            if best_iou >= _IOU_THRESHOLD and best_di >= 0:
                box = detections[best_di]
                box.track_id = tid
                new_active[tid] = box
                unmatched.remove(best_di)
                self._miss[tid] = 0
            else:
                self._miss[tid] = self._miss.get(tid, 0) + 1

        # Retire dead tracks
        for tid in [t for t, m in self._miss.items() if m > _MAX_MISS]:
            self._active.pop(tid, None)
            self._miss.pop(tid, None)

        # Spawn new tracks
        for di in unmatched:
            tid = self._next_id
            self._next_id += 1
            detections[di].track_id = tid
            new_active[tid] = detections[di]
            self._miss[tid] = 0

        self._active = new_active
        return list(self._active.items())


# ══════════════════════════════════════════════════════════════════════════════
# Step 3 — Active Speaker Detection (LR-ASD or heuristic)
# ══════════════════════════════════════════════════════════════════════════════

class ActiveSpeakerDetector:
    """
    Scores each FaceTrack with a speaking probability.

    Mode A — LR-ASD neural model (requires cloned repo + weights + torch).
    Mode B — Largest-face heuristic (assumes closest face = speaker; no audio).
    """

    def __init__(self) -> None:
        self._model = None

        if _LR_ASD_AVAIL and _TORCH_AVAIL:
            try:
                sys.path.insert(0, str(_LR_ASD_DIR))
                from model import LR_ASD  # noqa: PLC0415 (local import)

                self._model = LR_ASD()
                weights_candidates = [
                    _LR_ASD_DIR / "weight" / "finetuning_AVA.model",
                    _LR_ASD_DIR / "weight" / "pretrain_AVA.model",
                ]
                for wpath in weights_candidates:
                    if wpath.exists():
                        self._model.loadParameters(str(wpath))
                        self._model.eval()
                        LOG.info("LR-ASD loaded: %s", wpath.name)
                        break
                else:
                    LOG.warning(
                        "LR-ASD repo found but no weight file in %s/weight/. "
                        "Download from the repo README. Using fallback.",
                        _LR_ASD_DIR,
                    )
                    self._model = None
            except Exception as exc:
                LOG.warning("LR-ASD init error (%s); using largest-face fallback", exc)
                self._model = None
        else:
            why = []
            if not _LR_ASD_AVAIL:
                why.append(f"LR-ASD dir not found at {_LR_ASD_DIR}")
            if not _TORCH_AVAIL:
                why.append("torch not installed")
            LOG.info("ASD fallback mode (%s)", "; ".join(why))

    # ── Public API ─────────────────────────────────────────────────────────

    def score_tracks(
        self,
        video_path: str,
        tracks: List[FaceTrack],
        fps: float,
        n_frames: int,
    ) -> None:
        """Populate each track's .speaking_score in-place."""
        if not tracks:
            return
        if self._model is not None:
            self._score_lrasd(video_path, tracks, fps, n_frames)
        else:
            self._score_largest_face(tracks, n_frames)

    # ── LR-ASD path ────────────────────────────────────────────────────────

    def _score_lrasd(
        self,
        video_path: str,
        tracks: List[FaceTrack],
        fps: float,
        n_frames: int,
    ) -> None:
        """
        Run LR-ASD model.

        LR-ASD expects:
          videoFeature: FloatTensor [T, 1, 112, 112]  (grayscale face crops)
          audioFeature: FloatTensor [T, 1, 4, 13]     (MFCC windows)

        The model's forward_av() returns logits [T, 2]; class 1 = speaking.
        """
        import torch  # noqa: PLC0415
        import scipy.io.wavfile as wavfile  # noqa: PLC0415

        # Try python_speech_features; fall back to librosa if needed
        try:
            from python_speech_features import mfcc as compute_mfcc  # noqa: PLC0415
        except ImportError:
            LOG.warning(
                "python_speech_features not installed. "
                "Run: pip install python-speech-features\n"
                "Falling back to largest-face heuristic."
            )
            self._score_largest_face(tracks, n_frames)
            return

        # ── Extract audio ──────────────────────────────────────────────────
        tmp_wav = Path(video_path).with_suffix(".tmp_asd.wav")
        _ffmpeg_run([
            "ffmpeg", "-y", "-i", video_path,
            "-ar", "16000", "-ac", "1",
            "-loglevel", "error",
            str(tmp_wav),
        ])

        sr, audio_data = wavfile.read(str(tmp_wav))
        tmp_wav.unlink(missing_ok=True)

        # MFCC: 13 ceps, 25ms window, 10ms step → ~100 feat frames/s
        mfcc_all = compute_mfcc(
            audio_data.astype(np.float32),
            samplerate=sr,
            numcep=13,
            winlen=0.025,
            winstep=0.010,
        )  # shape: [M, 13]

        mfcc_fps = 100.0  # approx: 1 / 0.010
        mfcc_per_vid_frame = max(1, round(mfcc_fps / fps))

        # ── Score each track ───────────────────────────────────────────────
        cap = cv2.VideoCapture(video_path)

        for track in tracks:
            face_crops: List[np.ndarray] = []
            aud_feats: List[np.ndarray] = []

            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

            for fi in range(n_frames):
                ret, frame = cap.read()
                if not ret:
                    break

                # ── Face crop ──────────────────────────────────────────────
                box = track.boxes[fi] if fi < len(track.boxes) else None
                if box is None:
                    face_crops.append(np.zeros((112, 112), dtype=np.uint8))
                else:
                    x1, y1, x2, y2 = (
                        max(0, int(box.x1)), max(0, int(box.y1)),
                        int(box.x2), int(box.y2),
                    )
                    crop = frame[y1:y2, x1:x2]
                    if crop.size == 0:
                        face_crops.append(np.zeros((112, 112), dtype=np.uint8))
                    else:
                        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                        face_crops.append(cv2.resize(gray, (112, 112)))

                # ── MFCC window (4 frames) ─────────────────────────────────
                mfc_start = fi * mfcc_per_vid_frame
                mfc_end = mfc_start + 4
                if mfc_end <= len(mfcc_all):
                    aud_feats.append(mfcc_all[mfc_start:mfc_end])
                else:
                    aud_feats.append(np.zeros((4, 13), dtype=np.float32))

            if not face_crops:
                continue

            vid_tensor = torch.from_numpy(
                np.stack(face_crops)[:, np.newaxis].astype(np.float32) / 255.0
            )  # [T, 1, 112, 112]
            aud_tensor = torch.from_numpy(
                np.stack(aud_feats).astype(np.float32)
            ).unsqueeze(1)  # [T, 1, 4, 13]

            with torch.no_grad():
                # LR-ASD forward_av signature: (videoFeature, audioFeature)
                logits = self._model.forward_av(vid_tensor, aud_tensor)  # [T, 2]
                probs = torch.softmax(logits, dim=-1)[:, 1]  # speaking prob
                track.speaking_score = float(probs.mean().item())

            LOG.debug(
                "Track %d speaking_score=%.3f", track.track_id, track.speaking_score
            )

        cap.release()

    # ── Heuristic fallback ─────────────────────────────────────────────────

    def _score_largest_face(
        self, tracks: List[FaceTrack], n_frames: int
    ) -> None:
        """
        Score = (mean face area) × (visible frame fraction).
        Larger + more-consistently-visible face → higher score.
        Works well for single-presenter footage.
        """
        for track in tracks:
            visible = [b for b in track.boxes if b is not None]
            if not visible:
                continue
            mean_area = sum(b.area() for b in visible) / len(visible)
            visibility = len(visible) / max(n_frames, 1)
            track.speaking_score = mean_area * visibility

        LOG.debug(
            "Heuristic scores: %s",
            {t.track_id: round(t.speaking_score, 2) for t in tracks},
        )


# ══════════════════════════════════════════════════════════════════════════════
# Step 4 — Crop trajectory
# ══════════════════════════════════════════════════════════════════════════════

def compute_crop_params(
    tracks: List[FaceTrack],
    vid_w: int,
    vid_h: int,
    n_frames: int,
    fps: float,
    smooth_sigma_s: float = 1.5,
) -> Tuple[np.ndarray, int, int]:
    """
    Compute per-frame horizontal crop center for a 9:16 window.

    For landscape (16:9) source → crop window is vid_h tall, (vid_h * 9/16) wide.
    For already-vertical source → use full width.

    Returns:
        cx_per_frame  shape [n_frames]   float pixel x-center of crop window
        crop_w        int                width of crop window in source pixels
        crop_h        int                height of crop window (= vid_h)
    """
    # 9:16 crop window dimensions
    crop_h = vid_h
    crop_w = int(round(vid_h * TARGET_W / TARGET_H))  # e.g. 1080*9/16 ≈ 607

    if crop_w >= vid_w:
        # Source is already narrower than 9:16 — no horizontal cropping needed
        LOG.info("Source narrower than 9:16; using full width (no horizontal crop)")
        return np.full(n_frames, vid_w / 2.0), vid_w, vid_h

    cx_default = float(vid_w) / 2.0
    half_crop = float(crop_w) / 2.0

    if not tracks:
        LOG.info("No face tracks detected; applying center crop")
        return np.full(n_frames, cx_default), crop_w, crop_h

    # Pick the dominant (highest-scored) speaker
    best = max(tracks, key=lambda t: t.speaking_score)
    LOG.info(
        "Dominant speaker: track=%d  score=%.3f  visible_frames=%d/%d",
        best.track_id,
        best.speaking_score,
        sum(1 for b in best.boxes if b is not None),
        n_frames,
    )

    # Build per-frame cx array (NaN where track not visible)
    cx_raw = np.full(n_frames, np.nan)
    for fi, box in enumerate(best.boxes[:n_frames]):
        if box is not None:
            cx_raw[fi] = box.cx

    # Fill gaps so we never have NaN after this point
    _forward_fill(cx_raw, cx_default)
    _backward_fill(cx_raw, cx_default)

    if np.all(np.isnan(cx_raw)):
        return np.full(n_frames, cx_default), crop_w, crop_h

    # Smooth to eliminate jitter
    if _SCIPY_AVAIL:
        sigma = max(1.0, smooth_sigma_s * fps)
        cx_smooth = _gauss1d(cx_raw, sigma=sigma)
    else:
        # Simple rolling mean fallback (±15 frames)
        kernel = np.ones(31) / 31.0
        cx_smooth = np.convolve(cx_raw, kernel, mode="same")

    # Clamp to keep the window inside the frame
    cx_smooth = np.clip(cx_smooth, half_crop, vid_w - half_crop)
    return cx_smooth, crop_w, crop_h


def _forward_fill(arr: np.ndarray, default: float) -> None:
    last = default
    for i in range(len(arr)):
        if not np.isnan(arr[i]):
            last = arr[i]
        else:
            arr[i] = last


def _backward_fill(arr: np.ndarray, default: float) -> None:
    last = default
    for i in range(len(arr) - 1, -1, -1):
        if not np.isnan(arr[i]):
            last = arr[i]
        else:
            arr[i] = last


# ══════════════════════════════════════════════════════════════════════════════
# Step 5 — FFmpeg helpers
# ══════════════════════════════════════════════════════════════════════════════

def _ffmpeg_run(cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run an FFmpeg command, raising RuntimeError on failure."""
    LOG.debug("$ %s", " ".join(str(c) for c in cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if check and result.returncode != 0:
        LOG.error("FFmpeg error (exit %d):\n%s", result.returncode, result.stderr[-3000:])
        raise RuntimeError(f"FFmpeg exited with code {result.returncode}")
    return result


def extract_segment(src: str, start: float, duration: float, dst: str) -> None:
    """
    Cut [start, start+duration] from src into dst with a fast re-encode.
    We do a full re-encode (not stream-copy) to ensure accurate seeking and
    clean audio/video sync on the output.
    """
    LOG.info("Extracting %.1fs from t=%.1fs", duration, start)
    _ffmpeg_run([
        "ffmpeg", "-y",
        "-ss", str(start),         # input seek (fast, keyframe-accurate)
        "-i", src,
        "-t", str(duration),
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18",
        "-c:a", "aac", "-b:a", "128k",
        "-avoid_negative_ts", "make_zero",
        "-loglevel", "error",
        dst,
    ])


def apply_static_crop_encode(
    src: str,
    cx: float,
    crop_w: int,
    crop_h: int,
    dst: str,
    thumb_path: Optional[str] = None,
) -> None:
    """Single static crop window → 1080×1920 MP4."""
    x = max(0, int(cx - crop_w / 2))
    LOG.info("Static crop: x=%d w=%d h=%d → %dx%d", x, crop_w, crop_h, TARGET_W, TARGET_H)
    vf = (
        f"crop={crop_w}:{crop_h}:{x}:0,"
        f"scale={TARGET_W}:{TARGET_H}:flags=lanczos"
    )
    _ffmpeg_run([
        "ffmpeg", "-y",
        "-i", src,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        "-loglevel", "error",
        dst,
    ])
    if thumb_path:
        _extract_thumbnail(dst, thumb_path)


def apply_dynamic_crop_encode(
    src: str,
    cx_per_frame: np.ndarray,
    crop_w: int,
    crop_h: int,
    fps: float,
    vid_w: int,
    dst: str,
    thumb_path: Optional[str] = None,
    segment_s: float = 0.5,  # noqa: ARG001 — kept for call-site compat
) -> None:
    """
    Per-frame dynamic crop via FFmpeg sendcmd.

    Writes one crop-x command per frame into a temp sendcmd file, then runs a
    single FFmpeg pass.  The crop x changes every frame following the smoothed
    trajectory, so movement is perfectly fluid.  Audio is taken directly from
    the source in the same pass — no segments, no gaps, no sync issues.
    """
    total_frames = len(cx_per_frame)
    half_crop = crop_w / 2.0

    LOG.info("Dynamic crop (sendcmd): %d frames", total_frames)

    # Build sendcmd file: one line per frame
    #   <timestamp_seconds> crop x <pixel_value>;
    import tempfile as _tmp
    cmd_fd, cmd_path = _tmp.mkstemp(suffix=".txt", prefix="sp_sendcmd_")
    try:
        with os.fdopen(cmd_fd, "w") as f:
            for fi, cx in enumerate(cx_per_frame):
                x = int(np.clip(cx - half_crop, 0, vid_w - crop_w))
                t = fi / fps
                f.write(f"{t:.6f} crop x {x};\n")

        # The crop filter starts with x=0; sendcmd updates it each frame.
        # scale after crop to target resolution.
        vf = (
            f"sendcmd=f={cmd_path},"
            f"crop={crop_w}:{crop_h}:0:0,"
            f"scale={TARGET_W}:{TARGET_H}:flags=lanczos"
        )

        LOG.info("Encoding with per-frame crop trajectory…")
        _ffmpeg_run([
            "ffmpeg", "-y",
            "-i", src,
            "-vf", vf,
            "-map", "0:v",
            "-map", "0:a",
            "-c:v", "libx264", "-preset", "medium", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            "-loglevel", "error",
            dst,
        ])
    finally:
        try:
            os.unlink(cmd_path)
        except OSError:
            pass

    if thumb_path:
        _extract_thumbnail(dst, thumb_path)


def _extract_thumbnail(video_path: str, thumb_path: str, at_s: float = 0.3) -> None:
    _ffmpeg_run([
        "ffmpeg", "-y",
        "-ss", str(at_s),
        "-i", video_path,
        "-vframes", "1",
        "-q:v", "3",           # JPEG quality: 1=best, 31=worst; 3 ≈ ~90%
        "-loglevel", "error",
        thumb_path,
    ])
    LOG.info("Thumbnail: %s", thumb_path)


def _get_video_info(path: str) -> Tuple[int, int, float, int]:
    """Returns (width, height, fps, total_frames)."""
    cap = cv2.VideoCapture(path)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    return w, h, fps, n


# ══════════════════════════════════════════════════════════════════════════════
# Video analysis pass — detect, track, score
# ══════════════════════════════════════════════════════════════════════════════

def analyse_video(
    video_path: str,
    detector: FaceDetector,
    tracker: FaceTracker,
    asd: ActiveSpeakerDetector,
    sample_every_n: int = 2,
) -> Tuple[List[FaceTrack], float, int, int, int]:
    """
    Run detection + tracking on every Nth frame, then call ASD scorer.

    Returns:
        (tracks, fps, vid_w, vid_h, total_frames)
    """
    vid_w, vid_h, fps, total_frames = _get_video_info(video_path)
    LOG.info(
        "Analysing %s: %dx%d @ %.2ffps, %d frames",
        Path(video_path).name, vid_w, vid_h, fps, total_frames,
    )

    # track_id → list of Optional[BBox] indexed by frame number
    track_boxes: Dict[int, List[Optional[BBox]]] = {}

    cap = cv2.VideoCapture(video_path)
    fi = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if fi % sample_every_n == 0:
            dets = detector.detect(frame)
            assigned = tracker.update(dets)
            for tid, box in assigned:
                if tid not in track_boxes:
                    track_boxes[tid] = [None] * total_frames
                if fi < total_frames:
                    track_boxes[tid][fi] = box
        fi += 1
    cap.release()

    tracks = [
        FaceTrack(track_id=tid, boxes=boxes)
        for tid, boxes in track_boxes.items()
    ]
    LOG.info("Face tracks found: %d", len(tracks))

    asd.score_tracks(video_path, tracks, fps, total_frames)
    return tracks, fps, vid_w, vid_h, total_frames


# ══════════════════════════════════════════════════════════════════════════════
# Main pipeline
# ══════════════════════════════════════════════════════════════════════════════

def process_video(
    input_path: str,
    output_path: str,
    start_s: float = 0.0,
    duration_s: Optional[float] = None,
    thumb_path: Optional[str] = None,
    dynamic_crop: bool = True,
) -> None:
    """
    Full end-to-end pipeline.  Raises on any failure.
    """
    if not Path(input_path).exists():
        raise FileNotFoundError(f"Input not found: {input_path}")

    detector = FaceDetector()
    tracker = FaceTracker()
    asd = ActiveSpeakerDetector()

    with tempfile.TemporaryDirectory(prefix="sp_pipe_") as tmpdir:
        # ── Segment extraction ────────────────────────────────────────────
        needs_cut = start_s > 0.001 or duration_s is not None
        if needs_cut:
            seg_path = str(Path(tmpdir) / "segment.mp4")
            dur = duration_s if duration_s is not None else 3600.0
            extract_segment(input_path, start_s, dur, seg_path)
        else:
            seg_path = input_path

        # ── Face detection + ASD ──────────────────────────────────────────
        tracks, fps, vid_w, vid_h, n_frames = analyse_video(
            seg_path, detector, tracker, asd,
            sample_every_n=1,
        )

        # ── Crop trajectory ───────────────────────────────────────────────
        cx_per_frame, crop_w, crop_h = compute_crop_params(
            tracks, vid_w, vid_h, n_frames, fps, smooth_sigma_s=2.5,
        )

        # ── Encode ────────────────────────────────────────────────────────
        # Use dynamic crop when speaker movement is detected (cx variance > 5px)
        cx_std = float(np.std(cx_per_frame))
        use_dynamic = dynamic_crop and _SCIPY_AVAIL and cx_std > 5.0

        if use_dynamic:
            LOG.info("Crop mode: dynamic (cx_std=%.1fpx)", cx_std)
            apply_dynamic_crop_encode(
                seg_path, cx_per_frame, crop_w, crop_h, fps, vid_w,
                output_path, thumb_path,
            )
        else:
            LOG.info("Crop mode: static (cx_std=%.1fpx)", cx_std)
            cx_mean = float(np.nanmean(cx_per_frame))
            apply_static_crop_encode(
                seg_path, cx_mean, crop_w, crop_h, output_path, thumb_path,
            )

    LOG.info("Output: %s", output_path)


# ══════════════════════════════════════════════════════════════════════════════
# CLI entry point — prints JSON so callers can parse it
# ══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Smart 9:16 active-speaker crop — local FFmpeg + AI replacement for Cloudinary"
    )
    parser.add_argument("--input",    required=True,  help="Source video path")
    parser.add_argument("--start",    type=float, default=0.0,  help="Start time (seconds)")
    parser.add_argument("--duration", type=float, default=None, help="Duration (seconds)")
    parser.add_argument("--output",   required=True,  help="Output MP4 path (1080×1920)")
    parser.add_argument("--thumb",    default=None,   help="Output JPEG thumbnail path")
    parser.add_argument(
        "--static-crop", action="store_true",
        help="Skip dynamic panning — use a single averaged crop center (faster)",
    )
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    if args.verbose:
        LOG.setLevel(logging.DEBUG)
    else:
        LOG.setLevel(logging.INFO)

    logging.basicConfig(
        stream=sys.stderr,           # keep stderr for logs, stdout clean for JSON
        level=LOG.level,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
    )

    try:
        process_video(
            input_path=args.input,
            output_path=args.output,
            start_s=args.start,
            duration_s=args.duration,
            thumb_path=args.thumb,
            dynamic_crop=not args.static_crop,
        )
        # Print JSON result to stdout for the caller to parse
        print(json.dumps({
            "ok": True,
            "output": args.output,
            "thumb": args.thumb,
        }))
    except Exception as exc:
        LOG.exception("Pipeline failed")
        print(json.dumps({"ok": False, "error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
