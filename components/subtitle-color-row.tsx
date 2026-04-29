export function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/70">{label}</span>
      <label className="flex items-center gap-2 cursor-pointer group">
        <span className="text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
          {value}
        </span>
        <span
          className="w-6 h-6 rounded-md border border-white/20 shadow-inner cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-0 h-0 opacity-0 absolute"
        />
      </label>
    </div>
  );
}
