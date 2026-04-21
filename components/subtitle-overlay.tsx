"use client";

import { useRef } from "react";
import type { SubtitleWord } from "@/lib/types";

export type { SubtitleWord };

export type SubtitleTemplate = "classic" | "neon" | "cinematic" | "minimal" | "beasty" | "karaoke";

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

// ── Template presets ──────────────────────────────────────────────────────────

export interface TemplatePreset {
  id: SubtitleTemplate;
  label: string;
  description: string;
  defaults: Omit<SubtitleSettings, "enabled" | "x" | "y" | "wordsPerLine">;
}

export const SUBTITLE_TEMPLATES: TemplatePreset[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Yellow pill highlight, drop shadow",
    defaults: {
      template: "classic",
      fontSize: 26,
      fontFamily: "Inter, sans-serif",
      textColor: "#ffffff",
      highlightColor: "#000000",
      highlightBg: "#facc15",
    },
  },
  {
    id: "neon",
    label: "Neon",
    description: "Glowing text on dark strip",
    defaults: {
      template: "neon",
      fontSize: 26,
      fontFamily: "Inter, sans-serif",
      textColor: "#22d3ee",
      highlightColor: "#ffffff",
      highlightBg: "#22d3ee", // used as glow colour
    },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Full-width dark bar, accent word",
    defaults: {
      template: "cinematic",
      fontSize: 26,
      fontFamily: "Inter, sans-serif",
      textColor: "#ffffff",
      highlightColor: "#facc15",
      highlightBg: "#000000", // bar colour (with alpha applied in renderer)
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean text, underline on active word",
    defaults: {
      template: "minimal",
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      textColor: "#ffffff",
      highlightColor: "#facc15",
      highlightBg: "#facc15", // underline colour
    },
  },
  {
    id: "beasty",
    label: "Beasty",
    description: "Heavy stroke and shadow, Opus style",
    defaults: {
      template: "beasty",
      fontSize: 32,
      fontFamily: "Impact, sans-serif",
      textColor: "#ffffff",
      highlightColor: "#4ade80",
      highlightBg: "#000000",
    },
  },
  {
    id: "karaoke",
    label: "Karaoke",
    description: "Green active word, clean shadow",
    defaults: {
      template: "karaoke",
      fontSize: 26,
      fontFamily: "Inter, sans-serif",
      textColor: "#ffffff",
      highlightColor: "#4ade80",
      highlightBg: "#000000",
    },
  },
];

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  x: 50,
  y: 78,
  fontSize: 22,
  fontFamily: "Inter, sans-serif",
  textColor: "#ffffff",
  highlightColor: "#000000",
  highlightBg: "#facc15",
  wordsPerLine: 3,
  template: "classic",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function groupWords(words: SubtitleWord[], size: number): SubtitleWord[][] {
  const groups: SubtitleWord[][] = [];
  for (let i = 0; i < words.length; i += size) {
    groups.push(words.slice(i, i + size));
  }
  return groups;
}

const LONG_PAUSE_MS = 800;

export function findCurrentGroup(groups: SubtitleWord[][], currentTimeMs: number): number {
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

// ── SubtitleOverlay ───────────────────────────────────────────────────────────

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
    </div>
  );
}

// ── Shared template props ─────────────────────────────────────────────────────

interface TemplateProps {
  settings: SubtitleSettings;
  displayGroups: SubtitleWord[][];
  activeWord: SubtitleWord | null;
}

// ── 1. Classic ────────────────────────────────────────────────────────────────

function ClassicTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
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
                className="px-1.5 py-0.5 rounded font-black leading-tight"
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
  );
}


// ── 3. Neon ───────────────────────────────────────────────────────────────────

function NeonTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  const glowColor = settings.highlightBg; // repurposed as glow colour
  return (
    <div
      className="flex flex-col items-center gap-y-1 select-none w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div
          key={gi}
          className="flex flex-wrap justify-center gap-x-2 gap-y-1 w-full text-center px-3 py-1 rounded-lg"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-black leading-tight transition-all duration-100"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  textShadow: isActive
                    ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}, 0 0 30px ${glowColor}`
                    : `0 0 6px ${settings.textColor}55`,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 4. Cinematic ──────────────────────────────────────────────────────────────

function CinematicTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-0 select-none w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div
          key={gi}
          className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 w-screen max-w-none text-center px-4 py-1.5"
          style={{ backgroundColor: "rgba(0,0,0,0.70)", width: "100vw", maxWidth: "400px" }}
        >
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-bold leading-tight"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  letterSpacing: "0.02em",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 5. Minimal ────────────────────────────────────────────────────────────────

function MinimalTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-1 select-none px-2 w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap justify-center gap-x-2 gap-y-1 w-full text-center">
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-semibold leading-tight"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  textShadow: [
                    "-1px -1px 0 rgba(0,0,0,0.85)",
                    " 1px -1px 0 rgba(0,0,0,0.85)",
                    "-1px  1px 0 rgba(0,0,0,0.85)",
                    " 1px  1px 0 rgba(0,0,0,0.85)",
                    "-1px  0   0 rgba(0,0,0,0.85)",
                    " 1px  0   0 rgba(0,0,0,0.85)",
                    " 0   -1px 0 rgba(0,0,0,0.85)",
                    " 0    1px 0 rgba(0,0,0,0.85)",
                    " 0 3px 10px rgba(0,0,0,1)"
                  ].join(", "),
                  borderBottom: isActive
                    ? `3px solid ${settings.highlightBg}`
                    : "3px solid transparent",
                  paddingBottom: "1px",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 6. Beasty ─────────────────────────────────────────────────────────────────

function BeastyTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-1 select-none px-2 w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap justify-center gap-x-2 gap-y-1 w-full text-center">
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-black leading-none uppercase"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  textShadow: [
                    "-2px -2px 0 #000",
                    " 2px -2px 0 #000",
                    "-2px  2px 0 #000",
                    " 2px  2px 0 #000",
                    "-2px  0   0 #000",
                    " 2px  0   0 #000",
                    " 0   -2px 0 #000",
                    " 0    2px 0 #000",
                    " 4px  4px 0 #000" // Hard 3D shadow
                  ].join(", "),
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 8. Karaoke ────────────────────────────────────────────────────────────────

function KaraokeTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-1 select-none px-2 w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 w-full text-center">
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-black leading-tight uppercase transition-all duration-75"
                style={{
                  fontSize: isActive ? `${settings.fontSize * 1.15}px` : `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  textShadow: [
                    "-1px -1px 0 rgba(0,0,0,0.85)",
                    " 1px -1px 0 rgba(0,0,0,0.85)",
                    "-1px  1px 0 rgba(0,0,0,0.85)",
                    " 1px  1px 0 rgba(0,0,0,0.85)",
                    "-1px  0   0 rgba(0,0,0,0.85)",
                    " 1px  0   0 rgba(0,0,0,0.85)",
                    " 0   -1px 0 rgba(0,0,0,0.85)",
                    " 0    1px 0 rgba(0,0,0,0.85)",
                    " 0 2px 8px rgba(0,0,0,1)"
                  ].join(", "),
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
