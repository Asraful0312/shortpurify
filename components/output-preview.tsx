"use client";

import { OutputClipProps } from "@/lib/types";
import { useState } from "react";
import FullscreenPlayer from "./dashboard/fullscreen-player";
import OutputPreviewCard from "./dashboard/output-preview-card";
import { Id } from "@/convex/_generated/dataModel";
import { SubtitleSettings } from "./subtitle-overlay";

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
          clip={clip}
          projectId={projectId}
          initialSubtitleSettings={initialSubtitleSettings}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}
