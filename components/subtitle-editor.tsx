"use client";

import { SubtitleSettings, SubtitleTemplate,  } from "./subtitle-overlay";
import { X, Type, AlignCenter, Palette, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TemplateThumb } from "./subtitle-template-thumb";
import { ColorRow } from "./subtitle-color-row";
import { SUBTITLE_TEMPLATES } from "@/lib/subtitle";
import Image from "next/image";
const FONT_OPTIONS = [
  { label: "Bangers",       value: "var(--font-bangers), 'Bangers', sans-serif" },
  { label: "Comic Relief",  value: "var(--font-comic-relief), 'Comic Relief', sans-serif" },
  { label: "Inter",         value: "Inter, sans-serif" },
  { label: "Arial",         value: "Arial, sans-serif" },
  { label: "Impact",        value: "Impact, sans-serif" },
  { label: "Georgia",       value: "Georgia, serif" },
  { label: "Courier New",   value: "'Courier New', monospace" },
];

interface SubtitleEditorProps {
  settings: SubtitleSettings;
  onChange: (s: SubtitleSettings) => void;
  onClose: () => void;
  plan?: string;
}

export function SubtitleEditor({ settings, onChange, onClose, plan }: SubtitleEditorProps) {
  const [previewActiveIndex, setPreviewActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"template" | "style">("template");

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const set = <K extends keyof SubtitleSettings>(key: K, value: SubtitleSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const applyTemplate = (id: SubtitleTemplate) => {
    const preset = SUBTITLE_TEMPLATES.find((t) => t.id === id);
    if (!preset) return;
    onChange({
      ...settings,
      ...preset.defaults,
      // preserve position, size, wordsPerLine so user doesn't lose their layout
      x: settings.x,
      y: settings.y,
      wordsPerLine: settings.wordsPerLine,
    });
  };

  const template = settings.template ?? "classic";

  // Which colour labels make sense per template
  const isFreePlan = !plan || plan === "starter";

  const colorLabels: Record<SubtitleTemplate, { text: string; hl: string; bg: string }> = {
    classic:      { text: "Text",       hl: "Highlight Text", bg: "Highlight BG" },
    neon:         { text: "Text",       hl: "Active Word",    bg: "Glow Colour" },
    cinematic:    { text: "Text",       hl: "Active Word",    bg: "— (unused)" },
    minimal:      { text: "Text",       hl: "Active Word",    bg: "Underline" },
    beasty:       { text: "Text",       hl: "Active Word",    bg: "— (unused)" },
    karaoke:      { text: "Inactive",   hl: "Active Word",    bg: "— (unused)" },
    comic:        { text: "Dots",       hl: "3D Shadow",      bg: "Text Fill" },
    shadow:       { text: "Text",       hl: "Active Text",    bg: "Line Shadow" },
  };
  const labels = colorLabels[template];

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-3.5 w-72 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm tracking-wide">Subtitle Style</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <span className="text-xs font-semibold text-white/70">Show Subtitles</span>
        <button
          onClick={() => set("enabled", !settings.enabled)}
          className={`relative w-[38px] h-[20px] rounded-full transition-colors shrink-0 ${
            settings.enabled ? "bg-primary" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full transition-all duration-200 shadow ${
              settings.enabled ? "left-[20px]" : "left-[2px]"
            }`}
          />
        </button>
      </div>

      <div className={`space-y-4 ${!settings.enabled ? "opacity-40 pointer-events-none" : ""}`}>
        
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab("template")}
            className={cn(
              "flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors",
              activeTab === "template" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            Templates
          </button>
          <button 
            onClick={() => setActiveTab("style")}
            className={cn(
              "flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors",
              activeTab === "style" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            Settings
          </button>
        </div>

        {activeTab === "template" && (
          <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
            {SUBTITLE_TEMPLATES.map((t) => {
              const isPaidTemplate = Boolean(t.paidOnly) && isFreePlan;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t.id)}
                  title={isPaidTemplate ? `${t.label} — Pro & Agency plan` : t.description}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all min-h-[64px] justify-center",
                    template === t.id
                      ? "border-primary/50 bg-primary/20 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/90",
                  )}
                >
                  {isPaidTemplate && (
                    <div className="absolute top-0 right-2  rounded px-0.5 py-px leading-none size-6 flex items-center justify-center">
                         <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-400/80 text-primary border border-amber-400/40 px-1.5 py-0.5 rounded-full rotate-12">
        <Crown size={8} />
        Pro
      </span>
                     
                    </div>
                  )}
                  <TemplateThumb
                    id={t.id}
                    active={template === t.id}
                    settings={settings}
                    previewIndex={previewActiveIndex}
                  />
                  <span className={cn(
                    "text-[9px] font-bold leading-none transition-colors",
                    template === t.id ? "text-white" : "text-white/60"
                  )}>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "style" && (
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {/* Font family */}
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Type size={11} /> Font
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => set("fontFamily", e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/60"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-[#1a1a1a]">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Font Size</span>
                <span className="text-white/80 font-mono">{settings.fontSize}px</span>
              </label>
              <input
                type="range" min={14} max={48}
                value={settings.fontSize}
                onChange={(e) => set("fontSize", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Words per line */}
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><AlignCenter size={11} /> Words / Line</span>
                <span className="text-white/80 font-mono">{settings.wordsPerLine}</span>
              </label>
              <input
                type="range" min={1} max={6} step={1}
                value={settings.wordsPerLine}
                onChange={(e) => set("wordsPerLine", Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette size={11} /> Colors
              </label>
              <div className="space-y-2">
                {labels.text !== "— (unused)" && (
                  <ColorRow label={labels.text} value={settings.textColor} onChange={(v) => set("textColor", v)} />
                )}
                {labels.hl !== "— (unused)" && (
                  <ColorRow label={labels.hl} value={settings.highlightColor} onChange={(v) => set("highlightColor", v)} />
                )}
                {labels.bg !== "— (unused)" && (
                  <ColorRow label={labels.bg} value={settings.highlightBg} onChange={(v) => set("highlightBg", v)} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

