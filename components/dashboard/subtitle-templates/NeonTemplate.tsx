import { TemplateProps } from "@/lib/types";

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

export default NeonTemplate;