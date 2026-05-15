"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Book,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Timer,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import VideoModal from "../VideoModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type CropKeyframe = {
  id?: string;
  time: number;  // seconds from clip start
  cropX: number; // 0–1 horizontal centre
};

type PendingClip = {
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  platform: string;
  reason?: string;
  captions: Record<string, string>;
  cropKeyframes?: CropKeyframe[];
};

type TranscriptWord = {
  text: string;
  start: number;
  end: number;
  speaker?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function parseSecs(value: string): number | null {
  const parts = value.split(":").map(Number);
  if (parts.length === 2 && parts.every((p) => !isNaN(p))) return parts[0] * 60 + parts[1];
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function mkId() {
  return `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function interpolateCropX(keyframes: CropKeyframe[], t: number): number {
  if (keyframes.length === 0) return 0.5;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  // Step function: use the most recent keyframe at or before t (instant cut, no panning)
  let current = sorted[0];
  for (const kf of sorted) {
    if (kf.time <= t) current = kf;
    else break;
  }
  return current.cropX;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700"
    : score >= 50 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";
  return <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", color)}>{score}</span>;
}

// CropPreview

function CropPreview({
  videoUrl,
  startTime,
  endTime,
  keyframes,
  onChange,
}: {
  videoUrl: string;
  startTime: number;
  endTime: number;
  keyframes: CropKeyframe[];
  onChange: (kfs: CropKeyframe[]) => void;
}) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const playPromiseRef  = useRef<Promise<void> | null>(null);

  // Refs for stable document event handlers
  const halfWRef      = useRef(0);
  const keyframesRef  = useRef(keyframes);
  const seekTimeRef   = useRef(0);
  const onChangeRef   = useRef(onChange);
  const dragActive    = useRef(false);
  const dragKfIdRef   = useRef<string | null>(null);
  const dragKfTimeRef = useRef(0);
  const dragCropXRef  = useRef<number | null>(null);

  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [seekTime,    setSeekTime]    = useState(0);  // 0..duration, relative to clip start
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [liveCropX,   setLiveCropX]   = useState<number | null>(null); // visual-only during drag

  const duration = endTime - startTime;

  // Keep refs current
  keyframesRef.current = keyframes;
  onChangeRef.current  = onChange;
  seekTimeRef.current  = seekTime;

  const cropWidthFraction = (9 / 16) / videoAspect;
  const halfW = cropWidthFraction / 2;
  halfWRef.current = halfW;

  const displayCropX = liveCropX !== null ? liveCropX : interpolateCropX(keyframes, seekTime);
  const clampedCx    = Math.max(halfW, Math.min(1 - halfW, displayCropX));
  const leftPct      = (clampedCx - halfW) * 100;
  const widthPct     = cropWidthFraction * 100;

  // ── Wire up video events ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function onMeta() {
      if (video!.videoWidth) setVideoAspect(video!.videoWidth / video!.videoHeight);
      video!.currentTime = startTime;
    }
    function onTimeUpdate() {
      const rel = Math.max(0, Math.min(duration, video!.currentTime - startTime));
      setSeekTime(rel);
      if (video!.currentTime >= endTime - 0.05) {
        video!.pause();
        video!.currentTime = startTime;
        setSeekTime(0);
      }
    }
    function onPlay()  { setIsPlaying(true); }
    function onPause() { setIsPlaying(false); }

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("timeupdate",     onTimeUpdate);
    video.addEventListener("play",           onPlay);
    video.addEventListener("pause",          onPause);
    if (video.readyState >= 1) onMeta();
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("timeupdate",     onTimeUpdate);
      video.removeEventListener("play",           onPlay);
      video.removeEventListener("pause",          onPause);
    };
  }, [startTime, endTime, duration]);

  // ── Document drag handlers (stable — registered once) ──
  useEffect(() => {
    function getCropX(clientX: number) {
      const el = containerRef.current;
      if (!el) return 0.5;
      const rect = el.getBoundingClientRect();
      return Math.max(halfWRef.current, Math.min(1 - halfWRef.current, (clientX - rect.left) / rect.width));
    }

    function onMove(e: MouseEvent) {
      if (!dragActive.current) return;
      const x = getCropX(e.clientX);
      dragCropXRef.current = x;
      setLiveCropX(x);
    }

    function onUp() {
      if (dragActive.current && dragCropXRef.current !== null) {
        const cropX  = dragCropXRef.current;
        const kfId   = dragKfIdRef.current;
        const kfTime = dragKfTimeRef.current;
        const kfs    = keyframesRef.current;
        const match  = kfs.find((k) => k.id === kfId);
        if (match) {
          onChangeRef.current(kfs.map((k) => k.id === kfId ? { ...k, cropX } : k));
        } else {
          onChangeRef.current([...kfs, { id: kfId ?? mkId(), time: kfTime, cropX }]);
        }
      }
      dragActive.current    = false;
      dragKfIdRef.current   = null;
      dragCropXRef.current  = null;
      setLiveCropX(null);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Controls ──
  function seek(t: number) {
    const v = videoRef.current;
    if (!v) return;
    setSeekTime(t);
    v.currentTime = startTime + t;
  }

  function safePlay(v: HTMLVideoElement) {
    const p = v.play();
    playPromiseRef.current = p ?? null;
    p?.catch(() => {}); // swallow AbortError if pause() interrupts it
  }

  function safePause(v: HTMLVideoElement) {
    if (playPromiseRef.current) {
      // Wait for play() to resolve before pausing — avoids AbortError
      playPromiseRef.current.then(() => { v.pause(); }).catch(() => {});
      playPromiseRef.current = null;
    } else {
      v.pause();
    }
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      safePause(v);
    } else {
      if (v.currentTime >= endTime - 0.05) v.currentTime = startTime;
      safePlay(v);
    }
  }

  function onCropMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    // Auto-pause so the user can see the exact frame they're cropping
    const v = videoRef.current;
    if (v) safePause(v);

    const el = containerRef.current;
    if (!el) return;
    const rect  = el.getBoundingClientRect();
    const cropX = Math.max(halfW, Math.min(1 - halfW, (e.clientX - rect.left) / rect.width));
    const t     = seekTimeRef.current;
    const kfs   = keyframesRef.current;
    const TOL   = 0.4;
    const match = kfs.find((k) => Math.abs(k.time - t) < TOL);

    dragKfIdRef.current   = match?.id ?? mkId();
    dragKfTimeRef.current = match ? match.time : t;
    dragCropXRef.current  = cropX;
    dragActive.current    = true;
    setLiveCropX(cropX);
  }

  function removeKeyframe(id: string | undefined) {
    onChange(keyframes.filter((k) => k.id !== id));
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  return (
    <div className="space-y-3">
      {/* ── Video with crop overlay ── */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden bg-black cursor-ew-resize select-none"
        style={{ aspectRatio: String(videoAspect) }}
        onMouseDown={onCropMouseDown}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-fill pointer-events-none"
          muted
          preload="metadata"
          playsInline
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth) setVideoAspect(v.videoWidth / v.videoHeight);
            v.currentTime = startTime;
          }}
        />

        {/* Dimmed areas outside the 9:16 window */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 left-0 bg-black/55" style={{ width: `${leftPct}%` }} />
          <div className="absolute top-0 bottom-0 right-0 bg-black/55" style={{ width: `${100 - leftPct - widthPct}%` }} />
          <div className="absolute top-0 bottom-0 border-2 border-white ring-1 ring-black/30"
               style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
        </div>

        {/* Play/pause — stop mousedown so it never triggers a crop save */}
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="absolute bottom-2 right-2 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors pointer-events-auto z-10"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        {/* First-use hint */}
        {keyframes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] text-white/90 bg-black/55 px-3 py-1.5 rounded-full font-medium">
              ← Drag left or right to set crop position →
            </span>
          </div>
        )}
      </div>

      {/* ── Seek slider ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>{formatSecs(seekTime)}</span>
          <span className="text-foreground/40 text-[9px]">scrub to any frame, then drag the video to set crop</span>
          <span>{formatSecs(duration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.05}
          value={seekTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      {/* ── Saved positions list ── */}
      {sorted.length > 0 ? (
        <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Crop positions ({sorted.length})
          </p>
          {sorted.map((kf) => (
            <div key={kf.id ?? kf.time} className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => seek(kf.time)}
                className="font-mono text-primary hover:underline shrink-0"
              >
                {formatSecs(kf.time)}
              </button>
              <span className="text-muted-foreground">—</span>
              <div className="flex-1 bg-border rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-primary/70 rounded-full" style={{ width: `${kf.cropX * 100}%` }} />
              </div>
              <span className="text-muted-foreground font-mono shrink-0">{Math.round(kf.cropX * 100)}%</span>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => removeKeyframe(kf.id)}
                className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onChange([])}
            className="text-[10px] text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors mt-1"
          >
            Reset to AI auto-crop
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground">
          No position set — AI will choose automatically. Drag the video above to override.
        </p>
      )}
    </div>
  );
}

// ClipCard

function ClipCard({
  clip,
  index,
  included,
  transcriptText,
  originalUrl,
  cropMode,
  onToggleInclude,
  onUpdate,
}: {
  clip: PendingClip;
  index: number;
  included: boolean;
  transcriptText: string;
  originalUrl?: string;
  cropMode?: string;
  onToggleInclude: () => void;
  onUpdate: (patch: Partial<PendingClip>) => void;
}) {
  const [expanded,     setExpanded]     = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [startInput,   setStartInput]   = useState(formatSecs(clip.startTime));
  const [endInput,     setEndInput]     = useState(formatSecs(clip.endTime));
  const [showVideo, setShowVideo] = useState(false);

  function commitTime(field: "startTime" | "endTime", raw: string) {
    const v = parseSecs(raw);
    if (v !== null && v >= 0) {
      onUpdate({ [field]: v });
      if (field === "startTime") setStartInput(formatSecs(v));
      else setEndInput(formatSecs(v));
    } else {
      if (field === "startTime") setStartInput(formatSecs(clip.startTime));
      else setEndInput(formatSecs(clip.endTime));
    }
  }

  const duration = Math.round(clip.endTime - clip.startTime);
  const showCrop = !!originalUrl && cropMode === "smart_crop";

  return (
    <div className={cn(
      "border rounded-2xl overflow-hidden transition-all w-full",
      included ? "border-border bg-white" : "border-border/40 bg-secondary opacity-70",
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggleInclude}
          title={included ? "Skip this clip" : "Include this clip"}
          className={cn(
            "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            included ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
          )}
        >
          <CheckCircle2 size={13} />
        </button>

        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{index + 1}</span>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="w-full text-sm font-semibold bg-transparent border-b border-primary focus:outline-none"
              value={clip.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false); }}
            />
          ) : (
            <button
              type="button"
              className="text-sm font-semibold text-left truncate w-full hover:text-primary transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to rename"
            >
              {clip.title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ScorePill score={clip.viralScore} />
          <span className="text-xs text-muted-foreground font-medium hidden sm:block">{duration}s</span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4">
          {/* Timing */}

          <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Timer size={13} className="text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-medium">Start</span>
                <input
                  className="w-16 text-center border border-border rounded-lg px-2 py-1 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  onBlur={(e) => commitTime("startTime", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitTime("startTime", startInput); }}
                />
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-medium">End</span>
                <input
                  className="w-16 text-center border border-border rounded-lg px-2 py-1 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  onBlur={(e) => commitTime("endTime", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitTime("endTime", endInput); }}
                />
              </div>
              <span className="text-xs text-muted-foreground">({Math.round(clip.endTime - clip.startTime)}s)</span>
            </div>
          </div>

   <Button
   variant="outline" 
            onClick={() => setShowVideo(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2"
          >
            <Book size={20} className="text-muted-foreground" />
          Manual Crop Tutorial
          </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Drag left or right to set crop position or leave it, AI will auto crop the clip.
        </p>

<VideoModal 
showVideo={showVideo}
setShowVideo={setShowVideo}
videoId="cSZx9WgE40U"
/>

          {/* Crop editor */}
          {showCrop && (
            <CropPreview
              videoUrl={originalUrl!}
              startTime={clip.startTime}
              endTime={clip.endTime}
              keyframes={clip.cropKeyframes ?? []}
              onChange={(kfs) => onUpdate({ cropKeyframes: kfs })}
            />
          )}

          {/* Platform */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Platform:</span>
            <span className="capitalize font-semibold text-foreground">{clip.platform}</span>
          </div>

          {/* AI reason */}
          {clip.reason && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <Wand2 size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">{clip.reason}</p>
            </div>
          )}

          {/* Transcript */}
          {transcriptText && (
            <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Transcript</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{transcriptText}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleInclude}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
              included ? "text-red-600 hover:bg-red-50" : "text-primary hover:bg-primary/10",
            )}
          >
            {included
              ? <><SkipForward size={12} /> Skip this clip</>
              : <><CheckCircle2 size={12} /> Include this clip</>}
          </button>
        </div>
      )}
    </div>
  );
}

// Helpers 

function clipTranscript(words: TranscriptWord[], startSecs: number, endSecs: number): string {
  const s = startSecs * 1000, e = endSecs * 1000;
  return words.filter((w) => w.start >= s && w.end <= e).map((w) => w.text).join(" ");
}

// ClipReview

export function ClipReview({
  projectId,
  pendingClips,
  transcriptWords = [],
  originalUrl,
  cropMode,
}: {
  projectId: Id<"projects">;
  pendingClips: PendingClip[];
  transcriptWords?: TranscriptWord[];
  originalUrl?: string;
  cropMode?: string;
}) {
  const approveClips = useMutation(api.projects.approveClipsAndProcess);
  const [clips,      setClips]      = useState<PendingClip[]>(() =>
    pendingClips.map((c) => ({
      ...c,
      cropKeyframes: c.cropKeyframes?.map((kf) => ({ ...kf, id: kf.id ?? mkId() })),
    })),
  );
  const [included,   setIncluded]   = useState<boolean[]>(() => pendingClips.map(() => true));
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  function updateClip(index: number, patch: Partial<PendingClip>) {
    setClips((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function toggleInclude(index: number) {
    setIncluded((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  const selectedClips = clips
    .filter((_, i) => included[i])
    .map((c) => ({
      ...c,
      cropKeyframes: c.cropKeyframes?.map(({ time, cropX }) => ({ time, cropX })),
    }));
  const selectedCount = selectedClips.length;

  async function handleApprove() {
    if (selectedCount === 0) return;
    setError("");
    setSubmitting(true);
    try {
      await approveClips({ projectId, clips: selectedClips });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-amber-600" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Review AI-Suggested Clips</h2>
          <p className="text-sm text-muted-foreground">
            {clips.length} clip{clips.length !== 1 ? "s" : ""} — rename, adjust timing, fix crop, or skip clips you don&apos;t want.
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-6 w-full">
        {clips.map((clip, i) => (
          <ClipCard
            key={i}
            clip={clip}
            index={i}
            included={included[i]}
            transcriptText={clipTranscript(transcriptWords, clip.startTime, clip.endTime)}
            originalUrl={originalUrl}
            cropMode={cropMode}
            onToggleInclude={() => toggleInclude(i)}
            onUpdate={(patch) => updateClip(i, patch)}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting || selectedCount === 0}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-6 rounded-xl text-sm transition-colors"
        >
          {submitting
            ? <><Loader2 size={15} className="animate-spin" /> Starting…</>
            : <><Sparkles size={15} /> Process {selectedCount} clip{selectedCount !== 1 ? "s" : ""}</>}
        </button>
        {selectedCount < clips.length && (
          <p className="text-xs text-muted-foreground font-medium">
            {clips.length - selectedCount} clip{clips.length - selectedCount !== 1 ? "s" : ""} will be skipped
          </p>
        )}
      </div>
    </div>
  );
}
