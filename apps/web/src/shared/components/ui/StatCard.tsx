import type { ComponentType } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "neutral" | "primary" | "success" | "warning" | "info";
}) {
  const toneCls =
    tone === "primary"
      ? "bg-primary-container text-primary"
      : tone === "success"
        ? "bg-success/10 text-success"
        : tone === "warning"
          ? "bg-warning/10 text-warning"
          : tone === "info"
            ? "bg-info/10 text-info"
            : "bg-surface-variant text-foreground/70";

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        <div className={`grid size-8 place-items-center rounded-xl ${toneCls}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-[26px] font-bold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-2 text-[11.5px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
