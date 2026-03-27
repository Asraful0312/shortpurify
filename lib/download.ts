import JSZip from "jszip";

/** Fetch a URL as a blob and trigger a browser download. */
export async function downloadVideo(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const blob = await res.blob();
  triggerBlobDownload(blob, filename.endsWith(".mp4") ? filename : `${filename}.mp4`);
}

export type ClipMeta = {
  index: number;
  title: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  viralScore?: number;
  caption?: string;
  captions?: Record<string, string>;
};

export type TranscriptWord = {
  text: string;
  start: number; // ms
  end: number;   // ms
  speaker?: string;
};

export type ZipExtras = {
  clipsMeta?: ClipMeta[];
  transcriptText?: string;
  transcriptWords?: TranscriptWord[];
  projectTitle?: string;
};

/** Fetch multiple clips, zip them with optional metadata/transcript files, and trigger download. */
export async function downloadAllAsZip(
  clips: { url: string; title: string }[],
  zipName: string,
  onProgress?: (done: number, total: number) => void,
  extras?: ZipExtras,
): Promise<void> {
  const zip = new JSZip();
  let done = 0;

  // ── Video files ──────────────────────────────────────────────────────────────
  await Promise.all(
    clips.map(async (clip, i) => {
      const res = await fetch(clip.url);
      if (!res.ok) throw new Error(`Failed to fetch clip "${clip.title}": HTTP ${res.status}`);
      const blob = await res.blob();
      const safeName = clip.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      zip.file(`clips/${String(i + 1).padStart(2, "0")}_${safeName}.mp4`, blob);
      done++;
      onProgress?.(done, clips.length);
    }),
  );

  // ── metadata.json ────────────────────────────────────────────────────────────
  if (extras?.clipsMeta && extras.clipsMeta.length > 0) {
    const metaPayload = {
      project: extras.projectTitle ?? zipName,
      exportedAt: new Date().toISOString(),
      clipsCount: extras.clipsMeta.length,
      clips: extras.clipsMeta.map((c) => ({
        index: c.index,
        title: c.title,
        startTime: c.startTime != null ? formatSecs(c.startTime) : undefined,
        endTime: c.endTime != null ? formatSecs(c.endTime) : undefined,
        durationSeconds: c.duration != null ? Math.round(c.duration) : undefined,
        viralScore: c.viralScore,
        caption: c.caption,
        captions: c.captions,
      })),
    };
    zip.file("metadata.json", JSON.stringify(metaPayload, null, 2));
  }

  // ── transcript.txt ───────────────────────────────────────────────────────────
  if (extras?.transcriptText) {
    zip.file("transcript.txt", extras.transcriptText);
  }

  // ── transcript_timestamps.txt ────────────────────────────────────────────────
  if (extras?.transcriptWords && extras.transcriptWords.length > 0) {
    zip.file("transcript_timestamps.txt", buildTimestampedTranscript(extras.transcriptWords));
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, `${zipName}.zip`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Seconds → M:SS or H:MM:SS */
function formatSecs(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Milliseconds → M:SS */
function msToTimestamp(ms: number): string {
  return formatSecs(ms / 1000);
}

/**
 * Build a human-readable transcript with timestamps.
 *
 * Format:
 *   [0:00] First sentence or natural break here...
 *   [0:08] Next chunk of words continues here...
 *
 * Words are grouped by natural pauses (gap > 0.8 s) or every ~12 words max.
 */
function buildTimestampedTranscript(words: TranscriptWord[]): string {
  if (words.length === 0) return "";

  const lines: string[] = [];
  const MAX_WORDS_PER_LINE = 12;
  const PAUSE_THRESHOLD_MS = 800; // gap that triggers a new line

  let lineStart = words[0].start;
  let lineWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const nextW = words[i + 1];

    lineWords.push(w.text);

    const isLongPause = nextW && nextW.start - w.end > PAUSE_THRESHOLD_MS;
    const isMaxLength = lineWords.length >= MAX_WORDS_PER_LINE;
    const isLast = i === words.length - 1;

    if (isLast || isLongPause || isMaxLength) {
      lines.push(`[${msToTimestamp(lineStart)}] ${lineWords.join(" ")}`);
      if (nextW) lineStart = nextW.start;
      lineWords = [];
    }
  }

  // ── YouTube chapters hint ──────────────────────────────────────────────────
  const header = [
    `# Transcript with Timestamps`,
    `# Generated by ShortPurify`,
    `# Tip: Use the [M:SS] markers to create YouTube chapters`,
    ``,
    ``,
  ].join("\n");

  return header + lines.join("\n");
}
