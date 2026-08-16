import { cn } from "@/lib/utils";
import { statusStyle, paymentStyle, type ServiceRequest } from "@/lib/medlink/data";
import { kindIcon } from "./request-kit";

export function PageHead({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13.5px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold", className)}>{children}</span>;
}

export function StatusPill({ status }: { status: ServiceRequest["status"] }) {
  const s = statusStyle(status);
  return <Pill className={s.cls}>{s.label}</Pill>;
}

export function PaymentPill({ payment }: { payment: ServiceRequest["payment"] }) {
  const p = paymentStyle(payment);
  return <Pill className={p.cls}>{p.label}</Pill>;
}

export function Action({ tone = "ghost", children, onClick }: { tone?: "primary" | "ghost" | "danger"; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition active:scale-95",
        tone === "primary" && "gradient-primary text-primary-foreground shadow-card",
        tone === "ghost" && "border border-border/70 bg-surface text-foreground hover:bg-surface-variant",
        tone === "danger" && "bg-emergency/10 text-emergency hover:bg-emergency/15"
      )}
    >
      {children}
    </button>
  );
}

export function RequestRow({
  req,
  actions,
  showPayment = true,
}: {
  req: ServiceRequest;
  actions?: React.ReactNode;
  showPayment?: boolean;
}) {
  const Icon = kindIcon[req.kind];
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border/50 px-5 py-4 last:border-0 transition hover:bg-surface-variant/40">
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", req.kind === "emergency" ? "bg-emergency/10 text-emergency" : "bg-primary-container text-primary")}>
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-[190px] flex-1">
        <p className="text-[14px] font-semibold">{req.patient}</p>
        <p className="text-[12.5px] text-muted-foreground">{req.title} · {req.department}</p>
      </div>
      <div className="min-w-[110px] text-[12.5px] text-muted-foreground">{req.date}<br />{req.time}</div>
      <div className="min-w-[150px] text-[12.5px]">
        <span className="text-muted-foreground">Charge </span>
        <span className="font-semibold">${req.charge}</span>
        <span className="text-muted-foreground"> · fee </span>
        <span className="font-semibold text-primary">${req.serviceFee}</span>
      </div>
      <div className="flex min-w-[170px] flex-wrap gap-1.5">
        <StatusPill status={req.status} />
        {showPayment && <PaymentPill payment={req.payment} />}
      </div>
      <div className="flex flex-wrap gap-1.5">{actions}</div>
    </div>
  );
}

export function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-card">
      <header className="flex items-end justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div>
          <h2 className="text-[15.5px] font-bold">{title}</h2>
          {subtitle && <p className="text-[12.5px] text-muted-foreground">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
