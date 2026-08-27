import { useState } from "react";
import { Upload } from "lucide-react";

export function AuthFileField({ label, hint }: { label: string; hint?: string }) {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-4 shadow-card transition hover:border-primary/50">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
          <Upload className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {files.length ? files.join(", ") : "Upload documents"}
          </span>
          {hint && <span className="block text-[12px] text-muted-foreground">{hint}</span>}
        </span>
      </span>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
    </label>
  );
}
