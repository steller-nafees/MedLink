import { cn } from "@/lib/utils";
import {
  statusStyle,
  paymentStyle,
  requestKindLabel,
  type ServiceRequest,
} from "@/lib/medlink/data";
import { Stethoscope, FlaskConical, BedDouble, HeartPulse, Siren, ChevronRight } from "lucide-react";

export const kindIcon = {
  consultation: Stethoscope,
  diagnostic: FlaskConical,
  bed: BedDouble,
  icu: HeartPulse,
  emergency: Siren,
} as const;

const SERVICE_FEE = 1000;

const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-wide", className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ServiceRequest["status"] }) {
  const s = statusStyle(status);
  return <Badge className={s.cls}>{s.label}</Badge>;
}

export function PaymentBadge({ payment }: { payment: ServiceRequest["payment"] }) {
  const p = paymentStyle(payment);
  return <Badge className={p.cls}>{p.label}</Badge>;
}

export function RequestCard({ req, onPay }: { req: ServiceRequest; onPay?: (r: ServiceRequest) => void }) {
  const Icon = kindIcon[req.kind];
  const payable = req.status === "completed" && req.payment !== "paid";
  return (
    <div className="rounded-3xl border border-border/60 bg-surface p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-dialog">
      <div className="flex items-start gap-3.5">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", req.kind === "emergency" ? "bg-emergency/10 text-emergency" : "bg-primary-container text-primary")}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">{requestKindLabel[req.kind]}</p>
          <p className="truncate text-[15px] font-bold">{req.title}</p>
          <p className="truncate text-[12.5px] text-muted-foreground">{req.hospital}</p>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={req.status} />
        <PaymentBadge payment={req.payment} />
        <span className="ml-auto text-[11.5px] text-muted-foreground">{req.date} · {req.time}</span>
      </div>

      {req.charge > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface-variant/70 px-3.5 py-2.5">
          <div>
            <p className="text-[11px] text-muted-foreground">MedLink service charge</p>
            <p className="text-[15px] font-bold">{bdtFormatter.format(SERVICE_FEE)}</p>
          </div>
          {payable && (
            <button
              type="button"
              onClick={() => onPay?.(req)}
              className="rounded-full gradient-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-card transition active:scale-95"
            >
              Pay Now
            </button>
          )}
          {req.payment === "paid" && <span className="text-[12px] font-semibold text-success">Settled</span>}
        </div>
      )}
    </div>
  );
}