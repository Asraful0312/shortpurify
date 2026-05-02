"use client";

import { useRef, useState } from "react";
import { SubtitleOverlay, SubtitleSettings } from "@/components/subtitle-overlay";
import { DEFAULT_SUBTITLE_SETTINGS } from "@/lib/subtitle";

interface SubtitleWord {
  text: string;
  startMs: number;
  endMs: number;
}

export default function ClipPlayer({
  videoUrl,
  posterUrl,
  subtitleWords,
  subtitleSettings,
}: {
  videoUrl: string;
  posterUrl?: string;
  subtitleWords: SubtitleWord[];
  subtitleSettings: SubtitleSettings | null;
}) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);

  const mergedSettings = subtitleSettings ?? DEFAULT_SUBTITLE_SETTINGS;
  const hasSubtitles = mergedSettings.enabled && subtitleWords.length > 0;

  return (
    <div ref={containerRef} className="relative w-full aspect-9/16 bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        muted
        loop
        playsInline
        poster={posterUrl}
        className="w-full h-full object-cover"
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTimeMs(videoRef.current.currentTime * 1000);
        }}
      />
      {hasSubtitles && (
        <SubtitleOverlay
          words={subtitleWords}
          currentTimeMs={currentTimeMs}
          settings={mergedSettings}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          onSettingsChange={() => {}}
        />
      )}
    </div>
  );
}
