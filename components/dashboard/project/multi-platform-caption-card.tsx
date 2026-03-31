"use client"

import { secsToTimestamp } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

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


export default MultiPlatformCaptionCard