"use client";

import { SubtitleSettings, SubtitleTemplate, SUBTITLE_TEMPLATES } from "./subtitle-overlay";
import { X, Type, AlignCenter, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
  { label: "Inter",       value: "Inter, sans-serif" },
  { label: "Arial",       value: "Arial, sans-serif" },
  { label: "Impact",      value: "Impact, sans-serif" },
  { label: "Georgia",     value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

interface SubtitleEditorProps {
  settings: SubtitleSettings;
  onChange: (s: SubtitleSettings) => void;
  onClose: () => void;
}

export function SubtitleEditor({ settings, onChange, onClose }: SubtitleEditorProps) {
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
  const colorLabels: Record<SubtitleTemplate, { text: string; hl: string; bg: string }> = {
    classic:      { text: "Text",       hl: "Highlight Text", bg: "Highlight BG" },
    neon:         { text: "Text",       hl: "Active Word",    bg: "Glow Colour" },
    cinematic:    { text: "Text",       hl: "Active Word",    bg: "— (unused)" },
    minimal:      { text: "Text",       hl: "Active Word",    bg: "Underline" },
    beasty:       { text: "Text",       hl: "Active Word",    bg: "— (unused)" },
    karaoke:      { text: "Inactive",   hl: "Active Word",    bg: "— (unused)" },
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

        {/* ── Template picker ── */}
        <div>
          <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 block">
            Template
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SUBTITLE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                title={t.description}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all",
                  template === t.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/90",
                )}
              >
                <TemplateThumb id={t.id} active={template === t.id} settings={settings} />
                <span className="text-[9px] font-bold leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3.5">
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
              <ColorRow label={labels.text} value={settings.textColor}      onChange={(v) => set("textColor", v)} />
              <ColorRow label={labels.hl}   value={settings.highlightColor} onChange={(v) => set("highlightColor", v)} />
              {/* Hide bg colour row for templates that don't use it */}
              {template !== "beasty" && template !== "cinematic" && template !== "karaoke" && (
                <ColorRow label={labels.bg} value={settings.highlightBg} onChange={(v) => set("highlightBg", v)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tiny template thumbnail ───────────────────────────────────────────────────

function TemplateThumb({
  id,
  active,
  settings,
}: {
  id: SubtitleTemplate;
  active: boolean;
  settings: SubtitleSettings;
}) {
  const hl = active ? settings.highlightColor : "#facc15";
  const bg = active ? settings.highlightBg : "#facc15";
  const col = active ? settings.textColor : "#ffffff";

  const base = "text-[7px] font-black leading-none";

  if (id === "classic") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span className={base} style={{ color: col, textShadow: "0 1px 3px #000" }}>HI</span>
        <span className={`${base} px-0.5 rounded`} style={{ color: "#000", backgroundColor: bg }}>THERE</span>
      </div>
    );
  }
  if (id === "neon") {
    return (
      <div className="flex gap-0.5 items-center h-4 px-0.5 rounded" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <span className={base} style={{ color: "#22d3ee", textShadow: "0 0 4px #22d3ee" }}>HI</span>
        <span className={base} style={{ color: "#fff", textShadow: "0 0 4px #22d3ee" }}>THERE</span>
      </div>
    );
  }
  if (id === "cinematic") {
    return (
      <div className="flex gap-0.5 items-center h-4 px-1 w-full justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
        <span className={base} style={{ color: col }}>HI</span>
        <span className={base} style={{ color: hl }}>THERE</span>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span className={base} style={{ color: col, textShadow: "0 1px 3px #000" }}>HI</span>
        <span className={base} style={{ color: hl, borderBottom: `1px solid ${bg}`, textShadow: "0 1px 3px #000" }}>THERE</span>
      </div>
    );
  }
  if (id === "beasty") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span className={base} style={{ color: col, textShadow: "-1px -1px 0 #000,1px 1px 0 #000" }}>HI</span>
        <span className={base} style={{ color: hl, textShadow: "-1px -1px 0 #000,1px 1px 0 #000" }}>THERE</span>
      </div>
    );
  }
  if (id === "karaoke") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span className={base} style={{ color: col, textShadow: "0 1px 1px #000" }}>HI</span>
        <span className={base} style={{ color: hl, textShadow: "0 1px 1px #000", fontSize: "8px" }}>THERE</span>
      </div>
    );
  }
  return null;
}

// ── Color row ─────────────────────────────────────────────────────────────────

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/70">{label}</span>
      <label className="flex items-center gap-2 cursor-pointer group">
        <span className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
          {value}
        </span>
        <span
          className="w-6 h-6 rounded-md border border-white/20 shadow-inner cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-0 h-0 opacity-0 absolute"
        />
      </label>
    </div>
  );
}
