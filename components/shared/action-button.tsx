"use client"

import { cn } from "@/lib/utils";

function ActionButton({
  icon,
  label,
  primary,
  small,
  onClick,
}: {
  icon: React.ReactNode;
  label?: string;
  primary?: boolean;
  small?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const size = small ? "w-10 h-10 sm:w-11 sm:h-11" : "w-12 h-12 sm:w-14 sm:h-14";
  return (
    <button className="flex flex-col items-center gap-1.5 pointer-events-auto" onClick={onClick}>
      <div
        className={cn(
          size,
          "rounded-full flex items-center justify-center text-white transition-colors",
          primary
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-white/10 border border-white/10 hover:bg-white/20",
        )}
      >
        {icon}
      </div>
      {label && <span className="text-[11px] font-black text-white uppercase tracking-widest">{label}</span>}
    </button>
  );
}

export default ActionButton