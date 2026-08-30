const statusMap: Record<string, string> = {
  active: "bg-transparent text-foreground",
  verified: "bg-success/10 text-success",
  operational: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  degraded: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

export function Badge({ status }: { status: string }) {
  const statusCls = statusMap[status] ?? "bg-surface-variant text-foreground/70";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-0 py-0 text-[11px] font-bold uppercase tracking-[0.12em] ${statusCls}`}
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
