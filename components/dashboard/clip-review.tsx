"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  SkipForward,
  Sparkles,
  Timer,
  Wand2,
} from "lucide-react";

type PendingClip = {
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number;
  platform: string;
  reason?: string;
  captions: Record<string, string>;
};

type TranscriptWord = {
  text: string;
  start: number; // ms
  end: number;   // ms
  speaker?: string;
};

function formatSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function parseSecs(value: string): number | null {
  const parts = value.split(":").map(Number);
  if (parts.length === 2 && parts.every((p) => !isNaN(p))) {
    return parts[0] * 60 + parts[1];
  }
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", color)}>
      {score}
    </span>
  );
}

function ClipCard({
  clip,
  index,
  included,
  transcriptText,
  onToggleInclude,
  onUpdate,
}: {
  clip: PendingClip;
  index: number;
  included: boolean;
  transcriptText: string;
  onToggleInclude: () => void;
  onUpdate: (patch: Partial<PendingClip>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [startInput, setStartInput] = useState(formatSecs(clip.startTime));
  const [endInput, setEndInput] = useState(formatSecs(clip.endTime));

  function commitTime(field: "startTime" | "endTime", raw: string) {
    const v = parseSecs(raw);
    if (v !== null && v >= 0) {
      onUpdate({ [field]: v });
      if (field === "startTime") setStartInput(formatSecs(v));
      else setEndInput(formatSecs(v));
    } else {
      // Reset invalid input
      if (field === "startTime") setStartInput(formatSecs(clip.startTime));
      else setEndInput(formatSecs(clip.endTime));
    }
  }

  const duration = Math.round(clip.endTime - clip.startTime);

  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden transition-all w-full",
        included
          ? "border-border bg-white"
          : "border-border/40 bg-secondary opacity-70 ",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Include toggle */}
        <button
          type="button"
          onClick={onToggleInclude}
          title={included ? "Skip this clip" : "Include this clip"}
          className={cn(
            "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            included
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-transparent",
          )}
        >
          <CheckCircle2 size={13} />
        </button>

        {/* Clip number */}
        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
          {index + 1}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="w-full text-sm font-semibold bg-transparent border-b border-primary focus:outline-none"
              value={clip.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setEditingTitle(false);
              }}
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

        {/* Score + duration */}
        <div className="flex items-center gap-2 shrink-0">
          <ScorePill score={clip.viralScore} />
          <span className="text-xs text-muted-foreground font-medium hidden sm:block">
            {duration}s
          </span>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
          {/* Timing */}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTime("startTime", startInput);
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTime("endTime", endInput);
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                ({Math.round(clip.endTime - clip.startTime)}s)
              </span>
            </div>
          </div>

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
          {transcriptText ? (
            <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Transcript</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{transcriptText}</p>
            </div>
          ) : null}

          {/* Skip button */}
          <button
            type="button"
            onClick={onToggleInclude}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
              included
                ? "text-red-600 hover:bg-red-50"
                : "text-primary hover:bg-primary/10",
            )}
          >
            {included ? (
              <>
                <SkipForward size={12} /> Skip this clip
              </>
            ) : (
              <>
                <CheckCircle2 size={12} /> Include this clip
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function clipTranscript(words: TranscriptWord[], startSecs: number, endSecs: number): string {
  const startMs = startSecs * 1000;
  const endMs = endSecs * 1000;
  return words
    .filter((w) => w.start >= startMs && w.end <= endMs)
    .map((w) => w.text)
    .join(" ");
}

export function ClipReview({
  projectId,
  pendingClips,
  transcriptWords = [],
}: {
  projectId: Id<"projects">;
  pendingClips: PendingClip[];
  transcriptWords?: TranscriptWord[];
}) {
  const approveClips = useMutation(api.projects.approveClipsAndProcess);
  const [clips, setClips] = useState<PendingClip[]>(pendingClips);
  const [included, setIncluded] = useState<boolean[]>(() => pendingClips.map(() => true));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateClip(index: number, patch: Partial<PendingClip>) {
    setClips((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function toggleInclude(index: number) {
    setIncluded((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  const selectedClips = clips.filter((_, i) => included[i]);
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
    <div className="w-full ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-amber-600" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Review AI-Suggested Clips</h2>
          <p className="text-sm text-muted-foreground">
            {clips.length} clip{clips.length !== 1 ? "s" : ""} found — rename, adjust timing, or skip ones you don&apos;t want before encoding starts.
          </p>
        </div>
      </div>

      {/* Clip list */}
      <div className="space-y-2 mb-6 w-full">
        {clips.map((clip, i) => (
          <ClipCard
            key={i}
            clip={clip}
            index={i}
            included={included[i]}
            transcriptText={clipTranscript(transcriptWords, clip.startTime, clip.endTime)}
            onToggleInclude={() => toggleInclude(i)}
            onUpdate={(patch) => updateClip(i, patch)}
          />
        ))}
      </div>

      {/* Footer actions */}
      {error && (
        <p className="text-sm text-red-600 font-semibold mb-3">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting || selectedCount === 0}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-6 rounded-xl text-sm transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Process {selectedCount} clip{selectedCount !== 1 ? "s" : ""}
            </>
          )}
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
