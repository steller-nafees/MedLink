import type { ReactNode } from "react";

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
