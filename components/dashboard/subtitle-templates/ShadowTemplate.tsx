import { TemplateProps } from "@/lib/types";
import { cn } from "@/lib/utils";

function ShadowTemplate({ settings, displayGroups, activeWord }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center gap-y-1 select-none px-2 w-full"
      style={{ fontFamily: settings.fontFamily }}
    >
      {displayGroups.map((group, gi) => (
        <div key={gi} className="flex flex-wrap justify-center gap-x-3 gap-y-2 w-full text-center">
          {group.map((word, wi) => {
            const isActive = word === activeWord;
            const shadowColor = settings.highlightBg;
            
            return (
              <span
                key={`${gi}-${wi}`}
                data-text={word.text}
                className={cn(
                  "relative z-0 inline-flex font-black leading-none uppercase transition-all duration-150",
                  isActive && [
                    "italic after:absolute after:top-[0.07em] after:left-[0.07em] after:content-[attr(data-text)]",
                    "after:-z-10 after:animate-line-shadow after:bg-clip-text after:text-transparent"
                  ]
                )}
                style={{
                  fontSize: isActive ? `${settings.fontSize * 1.15}px` : `${settings.fontSize}px`,
                  color: isActive ? settings.highlightColor : settings.textColor,
                }}
              >
                {isActive && (
                  <style>{`
                    .after\\:bg-clip-text::after {
                      background-image: linear-gradient(45deg, transparent 45%, ${shadowColor} 45%, ${shadowColor} 55%, transparent 0);
                      background-size: 0.05em 0.05em;
                      -webkit-background-clip: text;
                      background-clip: text;
                    }
                  `}</style>
                )}
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default ShadowTemplate;
