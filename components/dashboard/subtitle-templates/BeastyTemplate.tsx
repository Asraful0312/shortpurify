import { TemplateProps } from "@/lib/types";

function BeastyTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
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
                className="font-black leading-none uppercase"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  textShadow: [
                    "-2px -2px 0 #000",
                    " 2px -2px 0 #000",
                    "-2px  2px 0 #000",
                    " 2px  2px 0 #000",
                    "-2px  0   0 #000",
                    " 2px  0   0 #000",
                    " 0   -2px 0 #000",
                    " 0    2px 0 #000",
                    " 4px  4px 0 #000" // Hard 3D shadow
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

export default BeastyTemplate;