import { SubtitleSettings, SubtitleTemplate } from "./subtitle-overlay";
import { cn } from "@/lib/utils";

export function TemplateThumb({
  id,
  active,
  settings,
  previewIndex,
}: {
  id: SubtitleTemplate;
  active: boolean;
  settings: SubtitleSettings;
  previewIndex: number;
}) {
  const hl = active ? settings.highlightColor : "#facc15";
  const bg = active ? settings.highlightBg : "#facc15";
  const col = active ? settings.textColor : "#ffffff";

  const base = "text-[7px] font-black leading-none transition-all duration-300";

  if (id === "classic") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span 
          className={cn(base, "px-0.5 rounded")} 
          style={{ 
            color: previewIndex === 0 ? "#000000" : col, 
            backgroundColor: previewIndex === 0 ? bg : "transparent",
            textShadow: previewIndex === 0 ? "none" : "0 1px 3px #000" 
          }}
        >HI</span>
        <span 
          className={cn(base, "px-0.5 rounded")} 
          style={{ 
            color: previewIndex === 1 ? "#000000" : col, 
            backgroundColor: previewIndex === 1 ? bg : "transparent",
            textShadow: previewIndex === 1 ? "none" : "0 1px 3px #000" 
          }}
        >THERE</span>
      </div>
    );
  }
  if (id === "neon") {
    const glowColor = active ? settings.highlightBg : "#22d3ee";
    return (
      <div className="flex gap-0.5 items-center h-4 px-1 rounded" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 0 ? "#22d3ee" : col, 
            textShadow: previewIndex === 0 ? `0 0 4px ${glowColor}, 0 0 8px ${glowColor}` : "none" 
          }}
        >HI</span>
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 1 ? "#22d3ee" : col, 
            textShadow: previewIndex === 1 ? `0 0 4px ${glowColor}, 0 0 8px ${glowColor}` : "none" 
          }}
        >THERE</span>
      </div>
    );
  }
  if (id === "cinematic") {
    return (
      <div className="flex gap-0.5 items-center h-4 px-1 w-full justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
        <span className={base} style={{ color: previewIndex === 0 ? hl : col }}>HI</span>
        <span className={base} style={{ color: previewIndex === 1 ? hl : col }}>THERE</span>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 0 ? hl : col,
            borderBottom: previewIndex === 0 ? `1px solid ${bg}` : "1px solid transparent",
            textShadow: "0 1px 3px #000"
          }}
        >HI</span>
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 1 ? hl : col, 
            borderBottom: previewIndex === 1 ? `1px solid ${bg}` : "1px solid transparent",
            textShadow: "0 1px 3px #000"
          }}
        >THERE</span>
      </div>
    );
  }
  if (id === "beasty") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 0 ? "#4ade80" : col, 
            textShadow: "-1px -1px 0 #000,1px 1px 0 #000, 2px 2px 0 #000" 
          }}
        >HI</span>
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 1 ? "#4ade80" : col, 
            textShadow: "-1px -1px 0 #000,1px 1px 0 #000, 2px 2px 0 #000" 
          }}
        >THERE</span>
      </div>
    );
  }
  if (id === "karaoke") {
    return (
      <div className="flex gap-0.5 items-center h-4">
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 0 ? "#4ade80" : col, 
            textShadow: "0 1px 1px #000",
            fontSize: previewIndex === 0 ? "8px" : "7px"
          }}
        >HI</span>
        <span 
          className={base} 
          style={{ 
            color: previewIndex === 1 ? "#4ade80" : col, 
            textShadow: "0 1px 1px #000", 
            fontSize: previewIndex === 1 ? "8px" : "7px" 
          }}
        >THERE</span>
      </div>
    );
  }
  return null;
}
