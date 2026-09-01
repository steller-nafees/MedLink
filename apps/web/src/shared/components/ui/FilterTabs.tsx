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
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-2 text-[12.5px] font-semibold capitalize transition ${
            value === o
              ? "border-transparent bg-foreground text-white"
              : "border-border bg-surface text-foreground hover:border-[#d7e4e5] hover:bg-surface-variant"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
} 