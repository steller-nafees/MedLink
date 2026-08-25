export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-border/70 bg-surface-variant/60 p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition ${
            value === o
              ? "bg-surface text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
