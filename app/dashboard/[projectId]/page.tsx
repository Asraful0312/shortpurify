"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Clock,
  DownloadCloud,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";
import { DEFAULT_SUBTITLE_SETTINGS } from "@/components/subtitle-overlay";
import { downloadAllAsZip } from "@/lib/download";
import { OutputPreview } from "@/components/output-preview";
import { ProcessingStatus } from "@/components/dashboard/processing-status";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ── Pipeline steps ─────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  {
    key: "Transcribing audio…",
    label: "Transcription",
    description: "AssemblyAI speech-to-text with timestamps",
  },
  {
    key: "Generating clip ideas with Claude AI…",
    label: "AI Analysis",
    description: "Claude extracts viral moments & captions",
  },
  {
    key: "Processing clips (AI crop + FFmpeg)…",
    label: "Smart Clips",
    description: "AI face-tracking crop & FFmpeg encoding",
  },
];

function getProcessingSteps(processingStep?: string) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === processingStep);
  return PIPELINE_STEPS.map((s, i) => ({
    label: s.label,
    description: s.description,
    status: (
      i < currentIdx ? "complete" : i === currentIdx ? "in_progress" : "pending"
    ) as "complete" | "in_progress" | "pending",
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(startTime?: number, endTime?: number): string {
  if (startTime === undefined || endTime === undefined) return "-";
  const secs = Math.round(endTime - startTime);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format milliseconds → MM:SS */
function msToTimestamp(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format seconds → MM:SS */
function secsToTimestamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(createdAt: number): string {
  const diff = Math.floor((Date.now() - createdAt) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube Shorts",
  x: "X / Twitter",
  threads: "Threads",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  blog: "Blog",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState({ done: 0, total: 0 });

  const project = useQuery(api.projects.getProject, { projectId });
  const outputs = useQuery(api.outputs.listProjectOutputs, { projectId });
  const exportWithSubtitles = useAction(api.exportActions.exportWithSubtitles);

  // ── Loading ──
  if (project === undefined) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded-xl w-40" />
          <div className="h-12 bg-secondary rounded-xl w-2/3" />
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary rounded-3xl aspect-9/16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (project === null) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-muted-foreground" />
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/dashboard" className="text-primary font-bold hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isProcessing = project.status === "processing" || project.status === "uploading";
  const isFailed = project.status === "failed";
  const isComplete = project.status === "complete";

  const statusBadgeVariant =
    isComplete ? "default" : isFailed ? "destructive" : "secondary";

  const statusLabel =
    isComplete ? "Publish Ready" :
    isFailed ? "Failed" :
    project.processingStep ?? "Processing…";

  const hasTranscript = !!project.transcriptText;
  const tabCount = outputs?.length ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full flex flex-col pb-32">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors w-fit bg-white px-4 py-2 rounded-full border border-border shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b border-border/50">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Badge
              variant={statusBadgeVariant}
              className="uppercase tracking-widest text-[10px] font-extrabold px-3 py-1"
            >
              {statusLabel}
            </Badge>
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
              <Clock size={14} /> {timeAgo(project.createdAt)}
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs opacity-50">
            {project._id}
          </p>
        </div>
        {isComplete && outputs && outputs.length > 0 && (
          <button
            disabled={zipDownloading}
            onClick={async () => {
              setZipDownloading(true);
              setZipProgress({ done: 0, total: outputs.length });
              try {
                // Generate subtitle exported URLs concurrently for all clips
                const exportedClips = await Promise.all(
                  outputs.map(async (o) => {
                    const clipStartMs = (o.startTime ?? 0) * 1000;
                    const clipEndMs = (o.endTime ?? Infinity) * 1000;
                    const subtitleWords = (project.transcriptWords ?? [])
                      .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
                      .map((w) => ({
                        text: w.text,
                        startMs: w.start - clipStartMs,
                        endMs: w.end - clipStartMs,
                      }));

                    if (subtitleWords.length > 0 && o.clipKey) {
                      try {
                        const { downloadUrl } = await exportWithSubtitles({
                          outputId: o._id,
                          clipKey: o.clipKey,
                          clipTitle: o.title,
                          subtitleWords,
                          settings: project.subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS,
                        });
                        return { url: downloadUrl, title: o.title };
                      } catch (err) {
                        console.error(`Failed to burn subtitles for ${o.title}:`, err);
                      }
                    }
                    // Fallback to original clip
                    return { url: o.clipUrl, title: o.title };
                  })
                );

                await downloadAllAsZip(
                  exportedClips,
                  project.title,
                  (done, total) => setZipProgress({ done, total }),
                );
              } finally {
                setZipDownloading(false);
              }
            }}
            className="bg-foreground text-background font-bold px-6 py-3 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {zipDownloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {zipProgress.done}/{zipProgress.total} clips…
              </>
            ) : (
              <>
                <DownloadCloud size={20} /> Download All (.ZIP)
              </>
            )}
          </button>
        )}
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="mb-10 max-w-lg">
          <ProcessingStatus steps={getProcessingSteps(project.processingStep)} />
          <p className="text-sm text-muted-foreground mt-4 font-medium">
            This usually takes 1-3 minutes. You can close this tab - we will keep processing.
          </p>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="mb-8 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 max-w-lg">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Pipeline failed</p>
            <p className="text-sm text-red-600 mt-1">
              Something went wrong during processing. Please try uploading again.
            </p>
            <Link
              href="/dashboard/upload"
              className="text-sm font-bold text-red-700 underline mt-2 inline-block"
            >
              Try again
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      {(outputs && outputs.length > 0) || hasTranscript ? (
        <Tabs defaultValue="clips">
          <TabsList className="mb-6">
            <TabsTrigger value="clips">
              Clips
              {tabCount > 0 && (
                <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 rounded-full">
                  {tabCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="captions">Captions</TabsTrigger>
            {hasTranscript && (
              <TabsTrigger value="transcript">
                <FileText size={14} className="mr-1.5" />
                Transcript
              </TabsTrigger>
            )}
          </TabsList>

          {/* Clips */}
          <TabsContent value="clips">
            {outputs && outputs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {outputs.map((clip) => {
                  const clipStartMs = (clip.startTime ?? 0) * 1000;
                  const clipEndMs = (clip.endTime ?? Infinity) * 1000;
                  const subtitleWords = (project.transcriptWords ?? [])
                    .filter((w) => w.start >= clipStartMs && w.end <= clipEndMs)
                    .map((w) => ({
                      text: w.text,
                      startMs: w.start - clipStartMs,
                      endMs: w.end - clipStartMs,
                    }));
                  return (
                  <OutputPreview
                    key={clip._id}
                    projectId={projectId}
                    initialSubtitleSettings={project.subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS}
                    clip={{
                      id: clip._id,
                      title: clip.title,
                      videoUrl: clip.clipUrl,
                      viralScore: clip.viralScore ?? 0,
                      duration: formatDuration(clip.startTime, clip.endTime),
                      caption: clip.content,
                      platform: clip.platform,
                      startTime: clip.startTime,
                      endTime: clip.endTime,
                      clipKey: clip.clipKey,
                      subtitleWords: subtitleWords.length > 0 ? subtitleWords : undefined,
                    }}
                  />
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No clips generated yet.</p>
            )}
          </TabsContent>

          {/* Captions — all platforms per clip */}
          <TabsContent value="captions">
            <div className="flex flex-col gap-6 max-w-3xl">
              {outputs?.map((clip) => (
                <MultiPlatformCaptionCard
                  key={clip._id}
                  title={clip.title}
                  platform={clip.platform}
                  captions={clip.captions ?? { [clip.platform]: clip.content }}
                  viralScore={clip.viralScore ?? 0}
                  startTime={clip.startTime}
                  endTime={clip.endTime}
                />
              ))}
            </div>
          </TabsContent>

          {/* Transcript */}
          {hasTranscript && (
            <TabsContent value="transcript">
              <TranscriptViewer
                text={project.transcriptText ?? ""}
                words={project.transcriptWords ?? []}
                clips={
                  outputs?.map((o) => ({
                    title: o.title,
                    startTime: o.startTime ?? 0,
                    endTime: o.endTime ?? 0,
                    viralScore: o.viralScore ?? 0,
                  })) ?? []
                }
              />
            </TabsContent>
          )}
        </Tabs>
      ) : null}

      {/* Empty clips while complete */}
      {isComplete && outputs?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No clips were generated for this project.
        </p>
      )}
    </div>
  );
}

// ── Multi-platform Caption Card ───────────────────────────────────────────────

function MultiPlatformCaptionCard({
  title,
  platform,
  captions,
  viralScore,
  startTime,
  endTime,
}: {
  title: string;
  platform: string;
  captions: Record<string, string>;
  viralScore: number;
  startTime?: number;
  endTime?: number;
}) {
  const platformKeys = Object.keys(captions);
  const [activePlatform, setActivePlatform] = useState(
    captions[platform] ? platform : platformKeys[0],
  );
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(captions);

  const copy = () => {
    navigator.clipboard.writeText(values[activePlatform] ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm">{title}</p>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {viralScore}/100
          </span>
          {startTime !== undefined && endTime !== undefined && (
            <span className="text-xs font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
              {secsToTimestamp(startTime)} - {secsToTimestamp(endTime)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditing((e) => !e)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          >
            {editing ? "Done" : "Edit"}
          </button>
          <button
            onClick={copy}
            className="text-xs font-bold text-primary px-3 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 flex items-center gap-1"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {platformKeys.map((p) => (
          <button
            key={p}
            onClick={() => setActivePlatform(p)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
              activePlatform === p
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-foreground border-border hover:border-primary/40"
            }`}
          >
            {PLATFORM_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      {/* Caption text */}
      {editing ? (
        <textarea
          value={values[activePlatform] ?? ""}
          onChange={(e) =>
            setValues((v) => ({ ...v, [activePlatform]: e.target.value }))
          }
          rows={4}
          className="w-full text-sm border border-border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      ) : (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {values[activePlatform] ?? "No caption for this platform."}
        </p>
      )}
    </div>
  );
}

// ── Transcript Viewer ─────────────────────────────────────────────────────────

type TranscriptWord = { text: string; start: number; end: number; speaker?: string };
type ClipRef = { title: string; startTime: number; endTime: number; viralScore: number };

function TranscriptViewer({
  text,
  words,
  clips,
}: {
  text: string;
  words: TranscriptWord[];
  clips: ClipRef[];
}) {
  const [mode, setMode] = useState<"clean" | "timestamped">("clean");
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group words into ~10-second blocks for timestamped view
  const blocks = groupWordsIntoBlocks(words, 10);

  return (
    <div className="max-w-3xl">
      {/* Controls */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("clean")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              mode === "clean"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white border-border hover:bg-secondary"
            }`}
          >
            Clean Text
          </button>
          <button
            onClick={() => setMode("timestamped")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              mode === "timestamped"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white border-border hover:bg-secondary"
            }`}
          >
            With Timestamps
          </button>
        </div>
        <button
          onClick={copyAll}
          className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 flex items-center gap-1.5"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Full Transcript"}
        </button>
      </div>

      {/* Clip timestamps quick-reference */}
      {clips.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700 mb-3">
            AI Identified Viral Clips
          </p>
          <div className="flex flex-col gap-2">
            {clips.map((c, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200 font-bold shrink-0">
                  {secsToTimestamp(c.startTime)} - {secsToTimestamp(c.endTime)}
                </span>
                <span className="text-sm font-semibold text-foreground">{c.title}</span>
                <span className="text-xs text-amber-600 font-bold ml-auto">
                  {c.viralScore}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript content */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        {mode === "clean" ? (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {text}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {blocks.map((block, i) => (
              <TimestampBlock key={i} block={block} clips={clips} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimestampBlock({
  block,
  clips,
}: {
  block: { startMs: number; words: TranscriptWord[] };
  clips: ClipRef[];
}) {
  // Check if this block overlaps with any clip window
  const blockStartSec = block.startMs / 1000;
  const blockEndSec = block.words.length > 0
    ? (block.words[block.words.length - 1].end) / 1000
    : blockStartSec + 10;

  const overlappingClip = clips.find(
    (c) => c.startTime < blockEndSec && c.endTime > blockStartSec,
  );

  return (
    <div
      className={`flex gap-3 ${overlappingClip ? "bg-amber-50 -mx-2 px-2 py-1 rounded-xl border border-amber-200/60" : ""}`}
    >
      <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5 w-10 text-right">
        {msToTimestamp(block.startMs)}
      </span>
      <p className="text-sm leading-relaxed text-foreground flex-1">
        {block.words.map((w) => w.text).join(" ")}
        {overlappingClip && (
          <span className="ml-2 text-[10px] font-extrabold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200">
            Clip: {overlappingClip.title}
          </span>
        )}
      </p>
    </div>
  );
}

/** Group words array into ~blockSizeSecs second blocks */
function groupWordsIntoBlocks(
  words: TranscriptWord[],
  blockSizeSecs: number,
): { startMs: number; words: TranscriptWord[] }[] {
  if (words.length === 0) return [];
  const blocks: { startMs: number; words: TranscriptWord[] }[] = [];
  let current: TranscriptWord[] = [];
  let blockStart = words[0]?.start ?? 0;

  for (const word of words) {
    current.push(word);
    const elapsed = (word.end - blockStart) / 1000;
    if (elapsed >= blockSizeSecs) {
      blocks.push({ startMs: blockStart, words: current });
      current = [];
      blockStart = word.end;
    }
  }
  if (current.length > 0) {
    blocks.push({ startMs: blockStart, words: current });
  }
  return blocks;
}
