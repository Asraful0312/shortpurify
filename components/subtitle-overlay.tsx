"use client";

import { useRef } from "react";
import type { SubtitleWord } from "@/lib/types";

export type { SubtitleWord };

export interface SubtitleSettings {
  enabled: boolean;
  x: number;           // 0–100 % from left (center anchor)
  y: number;           // 0–100 % from top  (center anchor)
  fontSize: number;    // px
  fontFamily: string;
  textColor: string;   // non-highlighted word color
  highlightColor: string; // highlighted word text color
  highlightBg: string;    // highlighted word background
  wordsPerLine: number;
}

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  x: 50,
  y: 78,
  fontSize: 26,
  fontFamily: "Inter, sans-serif",
  textColor: "#ffffff",
  highlightColor: "#000000",
  highlightBg: "#facc15",
  wordsPerLine: 3,
};


export function groupWords(words: SubtitleWord[], size: number): SubtitleWord[][] {
  const groups: SubtitleWord[][] = [];
  for (let i = 0; i < words.length; i += size) {
    groups.push(words.slice(i, i + size));
  }
  return groups;
}

const LONG_PAUSE_MS = 800;

/** Used by the server-side ASS burn — kept for compatibility. */
export function findCurrentGroup(
  groups: SubtitleWord[][],
  currentTimeMs: number,
): number {
  if (groups.length === 0) return -1;
  for (let i = 0; i < groups.length; i++) {
    const first = groups[i][0];
    const last = groups[i][groups[i].length - 1];
    if (currentTimeMs >= first.startMs && currentTimeMs <= last.endMs + 200) return i;
  }
  if (currentTimeMs < groups[0][0].startMs) return -1;
  const lastGroup = groups[groups.length - 1];
  if (currentTimeMs > lastGroup[lastGroup.length - 1].endMs + 200) return -1;
  for (let i = 0; i < groups.length - 1; i++) {
    const thisEnd = groups[i][groups[i].length - 1].endMs;
    const nextStart = groups[i + 1][0].startMs;
    if (currentTimeMs > thisEnd + 200 && currentTimeMs < nextStart) {
      return (nextStart - thisEnd) <= LONG_PAUSE_MS ? i : -1;
    }
  }
  return -1;
}

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

  // Only words whose start time has been reached (the speaker has said them)
  const spokenWords = words.filter((w) => w.startMs <= currentTimeMs);
  if (spokenWords.length === 0) return null;

  const lastSpoken = spokenWords[spokenWords.length - 1];

  // The word being spoken RIGHT NOW (if any)
  const activeWord = words.find(
    (w) => currentTimeMs >= w.startMs && currentTimeMs <= w.endMs,
  ) ?? null;

  // Hide during a long speech pause — nothing new has started, last word ended a while ago
  if (!activeWord && currentTimeMs - lastSpoken.endMs > LONG_PAUSE_MS) return null;

  // Group all spoken words and keep only the last 2 rows
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
      <div
        className="flex flex-col items-center gap-y-1 select-none px-2 w-full"
        style={{ fontFamily: settings.fontFamily }}
      >
        {displayGroups.map((group, gi) => (
          <div key={gi} className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 w-full text-center">
            {group.map((word, wi) => {
              const isActive = word === activeWord;
              return (
                <span
                  key={`${gi}-${wi}`}
                  className="px-1.5 py-0.5 rounded font-black leading-tight wrap-break-word max-w-full"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    color: isActive ? settings.highlightColor : settings.textColor,
                    backgroundColor: isActive ? settings.highlightBg : "transparent",
                    textShadow: isActive
                      ? "none"
                      : "0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)",
                  }}
                >
                  {word.text}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
