"use client"

import { Play, Star } from "lucide-react";
import { memo } from "react";

export interface OutputClipProps {
  id: string;
  title: string;
  videoUrl: string;
  viralScore: number;
  duration: string;
  caption?: string;
  platform?: string;
  startTime?: number;
  endTime?: number;
}

const OutputPreviewCard = memo(function OutputPreviewCard({
  clip,
  onOpen,
}: {
  clip: OutputClipProps;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="relative aspect-9/16 bg-neutral-900 rounded-2xl border border-border overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors"
    >
      {/* Lightweight video thumbnail — only downloads first frame */}
      <video
        src={clip.videoUrl + "#t=0.5"}
        className="w-full h-full object-cover"
        preload="metadata"
        muted
        playsInline
      />

      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
          <Play size={28} className="text-white fill-white ml-1" />
        </div>
      </div>

      {/* Score badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-black/60 px-2.5 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1.5 text-white">
          <Star size={12} className="text-accent fill-accent" />
          {clip.viralScore}/100
        </div>
      </div>

      {/* Bottom gradient + text */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 text-[10px] font-bold text-white mb-2">
          {clip.duration || "0:00"}
        </div>
        <h4 className="font-bold text-sm text-white leading-snug line-clamp-2">
          {clip.title}
        </h4>
      </div>
    </div>
  );
});

export default OutputPreviewCard