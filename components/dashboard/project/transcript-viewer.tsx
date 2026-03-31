"use client"

import { ClipRef, groupWordsIntoBlocks, secsToTimestamp, TranscriptWord } from "@/lib/utils";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import TimestampBlock from "./timestamp-block";

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
    <div className="w-full">
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


export default TranscriptViewer