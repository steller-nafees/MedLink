import { Truck, Phone, Check, Clock, MapPin, X, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ambulance } from "@/lib/medlink/data";

const typeChip: Record<Ambulance["type"], string> = {
  ALS: "bg-info/10 text-info border-info/25",
  "Critical Care": "bg-emergency/10 text-emergency border-emergency/25",
  BLS: "bg-success/10 text-success border-success/25",
};

const typeLabel: Record<Ambulance["type"], string> = {
  ALS: "ALS Ambulance",
  "Critical Care": "Critical Care",
  BLS: "Basic Life Support",
};

const statusChip: Record<Ambulance["status"], { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-success/10 text-success" },
  en_route: { label: "En route", cls: "bg-warning/10 text-warning" },
  on_scene: { label: "On scene", cls: "bg-info/10 text-info" },
  returning: { label: "Returning", cls: "bg-surface-variant text-muted-foreground" },
};

/** Plate-style registration number — the most prominent identifier. */
function RegPlate({ reg, tone = "default" }: { reg: string; tone?: "default" | "live" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3 py-2",
        tone === "live" ? "border-success/35 bg-success/5" : "border-border bg-surface-variant/60"
      )}
    >
      <Truck className={cn("size-4 shrink-0", tone === "live" ? "text-success" : "text-foreground/70")} strokeWidth={2.3} />
      <p className="truncate text-[14.5px] font-extrabold uppercase leading-none tracking-[0.02em]">{reg}</p>
    </div>
  );
}

export function AmbulanceCard({
  ambulance,
  booked,
  onRequest,
  onCancel,
}: {
  ambulance: Ambulance;
  booked?: boolean;
  onRequest?: () => void;
  onCancel?: () => void;
}) {
  const a = ambulance;

  if (booked) {
    return (
      <article className="rounded-3xl border border-success/35 bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" /> On the way
          </span>
          <span className="flex items-center gap-1 text-[11.5px] font-bold text-emergency">
            <Clock className="size-3.5" /> ETA {a.etaMin} min
          </span>
        </div>

        <RegPlate reg={a.reg} tone="live" />

        <dl className="mt-2.5 divide-y divide-border/60 text-[12.5px]">
          <div className="flex items-center justify-between py-1.5">
            <dt className="font-medium text-muted-foreground">Driver / EMT</dt>
            <dd className="font-semibold">{a.driver}</dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="font-medium text-muted-foreground">Contact</dt>
            <dd className="font-semibold">{a.phone}</dd>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <dt className="font-medium text-muted-foreground">Vehicle</dt>
            <dd className="font-semibold">{typeLabel[a.type]}</dd>
          </div>
        </dl>

        <div className="mt-3 grid grid-cols-[1.3fr_1fr] gap-2">
          <a
            href={`tel:${a.phone}`}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-full gradient-primary text-[13px] font-semibold text-primary-foreground shadow-float transition active:scale-[0.98]"
          >
            <Phone className="size-4" strokeWidth={2.4} /> Call Driver
          </a>
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-emergency/30 bg-surface text-[12.5px] font-semibold text-emergency transition active:scale-[0.98]"
          >
            <X className="size-4" strokeWidth={2.5} /> Cancel
          </button>
        </div>
      </article>
    );
  }

  const status = statusChip[a.status];

  return (
    <article className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card transition">
      <RegPlate reg={a.reg} />

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={cn("inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", typeChip[a.type])}>
            {typeLabel[a.type]}
          </span>
          <p className="mt-1.5 truncate text-[13px] font-bold leading-tight">{a.provider}</p>
          <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">{a.crew}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-semibold", status.cls)}>{status.label}</span>
            <span className="flex items-center gap-1 rounded-full bg-surface-variant px-2 py-0.5 text-[10.5px] font-semibold text-foreground/70">
              <MapPin className="size-3" /> {a.distanceKm} km
            </span>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl bg-emergency/10 px-3 py-2 text-center">
          <Clock className="mx-auto size-3 text-emergency" />
          <p className="mt-0.5 text-[15px] font-extrabold leading-none text-emergency">{a.etaMin}</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-emergency/80">min ETA</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_1.5fr] gap-2">
        <a
          href={`tel:${a.phone}`}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border bg-surface text-[13px] font-semibold text-foreground transition active:scale-[0.98]"
        >
          <Phone className="size-4" strokeWidth={2.4} /> Call
        </a>
        <button
          type="button"
          onClick={onRequest}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-full gradient-emergency text-[13px] font-semibold text-white shadow-float transition active:scale-[0.98]"
        >
          <Navigation className="size-4" strokeWidth={2.4} /> Request Ambulance
        </button>
      </div>
    </article>
  );
}

export { RegPlate, typeLabel };
