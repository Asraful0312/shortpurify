import { TemplateProps } from "@/lib/types";

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

export default MinimalTemplate;