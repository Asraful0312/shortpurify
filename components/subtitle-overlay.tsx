"use client";

import { useRef } from "react";
import type { SubtitleWord, TemplateProps } from "@/lib/types";
import ClassicTemplate from "./dashboard/subtitle-templates/ClassicTemplate";
import NeonTemplate from "./dashboard/subtitle-templates/NeonTemplate";
import CinematicTemplate from "./dashboard/subtitle-templates/CinematicTemplate";
import MinimalTemplate from "./dashboard/subtitle-templates/MinimalTemplate";
import BeastyTemplate from "./dashboard/subtitle-templates/BeastyTemplate";
import KaraokeTemplate from "./dashboard/subtitle-templates/KaraokeTemplate";
import ComicTemplate from "./dashboard/subtitle-templates/ComicTemplate";

import { groupWords } from "@/lib/utils";
import ShadowTemplate from "./dashboard/subtitle-templates/ShadowTemplate";

export type { SubtitleWord };

export type SubtitleTemplate = "classic" | "neon" | "cinematic" | "minimal" | "beasty" | "karaoke" | "comic" | "shadow";

export interface SubtitleSettings {
  enabled: boolean;
  x: number;           // 0–100 % from left (center anchor)
  y: number;           // 0–100 % from top  (center anchor)
  fontSize: number;    // px
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  highlightBg: string;
  wordsPerLine: number;
  template: SubtitleTemplate;
}


export interface TemplatePreset {
  id: SubtitleTemplate;
  label: string;
  description: string;
  paidOnly?: boolean;
  defaults: Omit<SubtitleSettings, "enabled" | "x" | "y" | "wordsPerLine">;
}


const LONG_PAUSE_MS = 800;





interface SubtitleOverlayProps {
  words: SubtitleWord[];
  currentTimeMs: number;
  settings: SubtitleSettings;
  containerRef: React.RefObject<HTMLDivElement>;
  onSettingsChange: (s: SubtitleSettings) => void;
  editable?: boolean;
}

export function SubtitleOverlay({
  words,
  currentTimeMs,
  settings,
  containerRef,
  onSettingsChange,
  editable = false,
}: SubtitleOverlayProps) {
  const draggingRef = useRef(false);

  if (!settings.enabled || words.length === 0) return null;

  const spokenWords = words.filter((w) => w.startMs <= currentTimeMs);
  if (spokenWords.length === 0) return null;

  const lastSpoken = spokenWords[spokenWords.length - 1];
  const activeWord = words.find(
    (w) => currentTimeMs >= w.startMs && currentTimeMs <= w.endMs,
  ) ?? null;

  if (!activeWord && currentTimeMs - lastSpoken.endMs > LONG_PAUSE_MS) return null;

  const allGroups = groupWords(spokenWords, settings.wordsPerLine);
  const displayGroups = allGroups.slice(-2);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!editable) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !containerRef.current) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onSettingsChange({
      ...settings,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    });
  };

  const handlePointerUp = () => { draggingRef.current = false; };

  const template = settings.template ?? "classic";

  return (
    <div
      className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 w-max max-w-[90%] flex flex-col items-center ${
        editable ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{ left: `${settings.x}%`, top: `${settings.y}%` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {editable && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white/70 bg-black/60 px-2 py-0.5 rounded-full pointer-events-none select-none">
          drag to reposition
        </div>
      )}

      

      {template === "classic" && (
        <ClassicTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "neon" && (
        <NeonTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "cinematic" && (
        <CinematicTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "minimal" && (
        <MinimalTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "beasty" && (
        <BeastyTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "karaoke" && (
        <KaraokeTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "comic" && (
        <ComicTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
      {template === "shadow" && (
        <ShadowTemplate settings={settings} displayGroups={displayGroups} activeWord={activeWord} />
      )}
    </div>
  );
}

