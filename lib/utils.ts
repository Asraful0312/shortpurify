import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SubtitleWord } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips the raw Convex error envelope and returns just the user-facing message.
 *
 * Convex errors arrive as strings like:
 *   "[CONVEX A(fn:name)] [Request ID: abc] Server Error\nUncaught ConvexError: Your message\nat handler ..."
 *
 * This extracts "Your message" (or falls back to a generic string).
 */
export function friendlyError(err: unknown, fallback = "Something went wrong"): string {
  const raw = err instanceof Error ? err.message : String(err ?? fallback);
  // Extract the text after "Uncaught ConvexError:" or "Uncaught Error:"
  const match = raw.match(/Uncaught (?:Convex)?Error:\s*([\s\S]+?)(?:\n\s*at |\n\s*Called by|$)/);
  if (match) return match[1].trim();
  // If there's no envelope prefix at all, return the raw message
  return raw.trim() || fallback;
}

export const PIPELINE_STEPS = [
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
    // Matches any "Processing clips…" variant — includes progress/batch suffixes
    key: "Processing clips",
    label: "Smart Clips",
    description: "AI face-tracking crop & FFmpeg encoding",
  },
];

export function getProcessingSteps(processingStep?: string) {
  // Use startsWith so dynamic suffixes like "… 3/15 done — batch 2/5" still match
  const currentIdx = PIPELINE_STEPS.findIndex((s) =>
    processingStep?.startsWith(s.key)
  );
  return PIPELINE_STEPS.map((s, i) => {
    // For the active step show the live progress text as description
    const description =
      i === currentIdx && processingStep
        ? processingStep
        : s.description;
    return {
      label: s.label,
      description,
      status: (
        i < currentIdx ? "complete" : i === currentIdx ? "in_progress" : "pending"
      ) as "complete" | "in_progress" | "pending",
    };
  });
}


export function formatDuration(startTime?: number, endTime?: number): string {
  if (startTime === undefined || endTime === undefined) return "-";
  const secs = Math.round(endTime - startTime);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format milliseconds → MM:SS */
export function msToTimestamp(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Format seconds → MM:SS */
export function secsToTimestamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(createdAt: number): string {
  const diff = Math.floor((Date.now() - createdAt) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}



export type TranscriptWord = { text: string; start: number; end: number; speaker?: string };
export type ClipRef = { title: string; startTime: number; endTime: number; viralScore: number };


/** Group words array into ~blockSizeSecs second blocks */
export function groupWordsIntoBlocks(
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


export function groupWords(words: SubtitleWord[], size: number): SubtitleWord[][] {
  const groups: SubtitleWord[][] = [];
  for (let i = 0; i < words.length; i += size) {
    groups.push(words.slice(i, i + size));
  }
  return groups;
}