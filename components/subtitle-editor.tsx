"use client";

import { SubtitleSettings } from "./subtitle-overlay";
import { X, Type, AlignCenter, Palette } from "lucide-react";

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
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

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-3.5 w-64 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm tracking-wide">Subtitle Style</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

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

      <div className={`space-y-3.5 ${!settings.enabled ? "opacity-40 pointer-events-none" : ""}`}>
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
            type="range"
            min={14}
            max={48}
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
            type="range"
            min={1}
            max={6}
            step={1}
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
            <ColorRow
              label="Text"
              value={settings.textColor}
              onChange={(v) => set("textColor", v)}
            />
            <ColorRow
              label="Highlight Text"
              value={settings.highlightColor}
              onChange={(v) => set("highlightColor", v)}
            />
            <ColorRow
              label="Highlight BG"
              value={settings.highlightBg}
              onChange={(v) => set("highlightBg", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
