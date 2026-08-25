import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
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
      className={`overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-card ${className}`}
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
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
