import { ClipRef, msToTimestamp, TranscriptWord } from "@/lib/utils";

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
export default TimestampBlock