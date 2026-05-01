import { TemplateProps } from "@/lib/types";

function CinematicTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-0 select-none w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div
          key={gi}
          className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 w-screen max-w-none text-center px-4 py-1.5"
          style={{ backgroundColor: "rgba(0,0,0,0.70)", width: "100vw", maxWidth: "400px" }}
        >
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            return (
              <span
                key={`${gi}-${wi}`}
                className="font-bold leading-tight"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                  letterSpacing: "0.02em",
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

export default CinematicTemplate;