import { TemplateProps } from "@/lib/types";

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

export default ClassicTemplate;