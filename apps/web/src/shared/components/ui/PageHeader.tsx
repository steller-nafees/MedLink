import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="ui-page-header">
      <div>
        {eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-[31px] font-bold tracking-[-0.05em] text-foreground">{title}</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">{subtitle}</p>
      </div>
      {(actions || action) && (
        <div className="ui-page-actions">{actions ?? action}</div>
      )}
    </header>
  );
}
