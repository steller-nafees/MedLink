import type { ComponentType } from "react";

const toneMap = {
  primary: {
    badge: "bg-primary-container text-primary",
    glow: "bg-[#16a89c] text-white",
  },
  info: {
    badge: "bg-info/10 text-info",
    glow: "bg-[#16a89c] text-white",
  },
  success: {
    badge: "bg-success/10 text-success",
    glow: "bg-[#16a89c] text-white",
  },
  warning: {
    badge: "bg-warning/10 text-warning",
    glow: "bg-[#16a89c] text-white",
  },
  emergency: {
    badge: "bg-destructive/10 text-destructive",
    glow: "bg-[#16a89c] text-white",
  },
  neutral: {
    badge: "bg-surface-variant text-foreground",
    glow: "bg-[#16a89c] text-white",
  },
} as const;

type StatCardProps = {
  label: string;
  value: number | string;
  sub?: string;
  available?: number;
  percentage?: number;
  icon: ComponentType<{ className?: string }>;
  tone?: keyof typeof toneMap;
};

export function StatCard({
  label,
  value,
  sub,
  available,
  percentage,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  const colors = toneMap[tone] ?? toneMap.primary;
  const helperText = sub ?? (available !== undefined && percentage !== undefined ? `${available} available · ${Math.round(percentage)}% capacity` : "");

  return (
    <section className="ui-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-[-0.05em] text-foreground">{value}</p>
        </div>
        <span className={`grid size-11 place-items-center rounded-2xl ${colors.badge}`}>
          <Icon className="size-5" />
        </span>
      </div>
      {helperText && (
        <div className={`mt-auto min-h-8 self-start inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${colors.glow}`}>
          {helperText}
        </div>
      )}
    </section>
  );
}
