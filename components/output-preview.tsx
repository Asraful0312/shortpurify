"use client";

import { OutputClipProps } from "@/lib/types";
import { useState } from "react";
import FullscreenPlayer from "./dashboard/fullscreen-player";
import OutputPreviewCard from "./dashboard/output-preview-card";


export function OutputPreview({ clip }: { clip: OutputClipProps }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <OutputPreviewCard clip={clip} onOpen={() => setIsFullscreen(true)} />
      {isFullscreen && (
        <FullscreenPlayer clip={clip} onClose={() => setIsFullscreen(false)} />
      )}
    </>
  );
}
