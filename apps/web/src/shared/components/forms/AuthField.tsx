export function AuthField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[14.5px] text-foreground shadow-card outline-none transition placeholder:text-muted-foreground focus:border-primary/50"
      />
    </label>
  );
}
