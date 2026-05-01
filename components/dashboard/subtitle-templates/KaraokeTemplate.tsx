import { TemplateProps } from "@/lib/types";

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

export default KaraokeTemplate