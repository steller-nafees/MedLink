import type { ComponentType, ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-[26px] font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Kpi({
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
        <div className={cn("grid size-8 place-items-center rounded-xl", toneCls)}>
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

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-card",
        className
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-bold">{title}</h2>}
            {subtitle && (
              <p className="text-[12px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-[220px] rounded-full border border-border bg-surface py-2 pl-9 pr-4 text-[13px] outline-none transition focus:border-primary"
      />
    </div>
  );
}

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
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[12px] font-semibold capitalize transition",
            value === o
              ? "bg-surface text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const statusMap: Record<string, string> = {
  active: "bg-success/10 text-success",
  verified: "bg-success/10 text-success",
  operational: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  degraded: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-widest",
        statusMap[status] ?? "bg-surface-variant text-foreground/70"
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function TypeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-lg bg-surface-variant px-2 py-1 text-[11px] font-semibold text-foreground/70">
      {label}
    </span>
  );
}

export function DataTable({
  head,
  children,
}: {
  head: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border/70 bg-surface-variant/50 text-[10.5px] uppercase tracking-widest text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-5 py-3.5 align-middle", className)}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border/50 transition last:border-0 hover:bg-surface-variant/40">
      {children}
    </tr>
  );
}

export function GhostButton({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneCls =
    tone === "success"
      ? "border-success/30 text-success hover:bg-success/10"
      : tone === "danger"
        ? "border-destructive/30 text-destructive hover:bg-destructive/10"
        : "border-border text-foreground/75 hover:bg-surface-variant";
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition",
        toneCls
      )}
    >
      {children}
    </button>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[13px] text-muted-foreground"
      >
        {label}
      </td>
    </tr>
  );
}

export const chartAxis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
} as const;

export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(23,37,47,0.08)",
} as const;
