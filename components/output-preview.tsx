"use client";

import { OutputClipProps } from "@/lib/types";
import { useState } from "react";
import FullscreenPlayer from "./dashboard/fullscreen-player";
import OutputPreviewCard from "./dashboard/output-preview-card";
import { Id } from "@/convex/_generated/dataModel";
import { SubtitleSettings } from "./subtitle-overlay";

/** Single-clip wrapper — kept for any one-off uses. */
export function OutputPreview({
  clip,
  projectId,
  initialSubtitleSettings,
}: {
  clip: OutputClipProps;
  projectId?: Id<"projects">;
  initialSubtitleSettings?: SubtitleSettings;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <OutputPreviewCard clip={clip} onOpen={() => setIsFullscreen(true)} />
      {isFullscreen && (
        <FullscreenPlayer
          clips={[clip]}
          currentIndex={0}
          onNavigate={() => {}}
          projectId={projectId}
          initialSubtitleSettings={initialSubtitleSettings}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}

/** Multi-clip gallery — renders the card grid and one shared fullscreen player with scroll navigation. */
export function ClipsGallery({
  clips,
  projectId,
  initialSubtitleSettings,
}: {
  clips: OutputClipProps[];
  projectId?: Id<"projects">;
  initialSubtitleSettings?: SubtitleSettings;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {clips.map((clip, i) => (
          <OutputPreviewCard key={clip.id} clip={clip} onOpen={() => setActiveIndex(i)} />
        ))}
      </div>

      {activeIndex !== null && (
        <FullscreenPlayer
          clips={clips}
          currentIndex={activeIndex}
          onNavigate={setActiveIndex}
          projectId={projectId}
          initialSubtitleSettings={initialSubtitleSettings}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
