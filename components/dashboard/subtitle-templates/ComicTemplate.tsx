import { TemplateProps } from "@/lib/types";

function ComicTemplate({ settings, displayGroups }: TemplateProps) {
  const dotColor = settings.textColor;
  const shadowColor = settings.highlightColor;
  const bgColor  = settings.highlightBg;
  const fs       = settings.fontSize;
  
  // Ensure smooth scaling without gaps or hiding colors behind strokes
  // Sync with Python backend math for pixel-perfect parity
  // Sync with Python backend math for pixel-perfect parity
  const strokePx = Math.max(1.2, fs * 0.035);
  const shRed = strokePx + Math.max(0.8, fs * 0.012);
  const shBlack = shRed + Math.max(1.0, fs * 0.02);

  return (
    <div className="flex flex-col items-center gap-y-1.5 select-none px-2 w-full">
      {displayGroups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap justify-center gap-x-2 gap-y-1 w-full text-center">
          {group.map((word, wi) => (
            <span
              key={`${gi}-${wi}`}
              className="leading-none uppercase"
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${fs}px`,
                fontWeight: "700",
                display: "inline-block",
                transform: "skewX(-4deg)",
                backgroundColor: bgColor,
                backgroundImage: `radial-gradient(circle at 1.2px 1.2px, ${dotColor} 0.8px, transparent 0)`,
                backgroundSize: "10px 10px",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: `${strokePx}px #000000`,
                filter: `drop-shadow(${shRed}px ${shRed}px 0px ${shadowColor}) drop-shadow(${shBlack - shRed}px ${shBlack - shRed}px 0px #000000)`,
              }}
            >
              {word.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default ComicTemplate