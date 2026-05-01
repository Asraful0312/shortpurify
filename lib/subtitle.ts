import { SubtitleSettings, TemplatePreset } from "@/components/subtitle-overlay";

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
  {
    id: "comic",
    label: "Comic",
    description: "Pop-art comic text with dots and 3D shadow",
    paidOnly: true,
    defaults: {
      template: "comic",
      fontSize: 38,
      fontFamily: "'Impact', 'Comic Sans MS', 'Impact', sans-serif",
      textColor: "#EF4444", // Dots Color
      highlightColor: "#EF4444", // Shadow Color
      highlightBg: "#FACC15",
    },
  },
];

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  enabled: true,
  x: 50,
  y: 78,
  fontSize: 28,
  fontFamily: "Inter, sans-serif",
  textColor: "#ffffff",
  highlightColor: "#000000",
  highlightBg: "#facc15",
  wordsPerLine: 3,
  template: "classic",
};