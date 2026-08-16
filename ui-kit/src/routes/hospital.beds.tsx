import { createFileRoute } from "@tanstack/react-router";
import { hospitals } from "@/lib/medlink/data";
import { BedDouble, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospital/beds")({
  head: () => ({ meta: [{ title: "Beds & ICU · Hospital Dashboard" }, { name: "description", content: "Live bed and ICU availability." }] }),
  component: Beds,
});

const wards = [
  { name: "Emergency Bays", beds: makeBeds(8, 3), tone: "emergency" as const },
  { name: "General Ward A", beds: makeBeds(24, 18), tone: "primary" as const },
  { name: "General Ward B", beds: makeBeds(24, 15), tone: "primary" as const },
  { name: "ICU", beds: makeBeds(12, 8), tone: "emergency" as const },
  { name: "Pediatrics", beds: makeBeds(16, 6), tone: "info" as const },
];

function makeBeds(total: number, occupied: number) {
  return Array.from({ length: total }).map((_, i) => ({ id: i + 1, occupied: i < occupied }));
}

function Beds() {
  const h = hospitals[0];
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Beds & ICU</h1>
          <p className="text-[13px] text-muted-foreground">Live occupancy across wards</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-[12.5px] font-semibold">Print report</button>
          <button className="rounded-full gradient-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-float">Reserve bed</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Big label="Total beds" value={h.beds.total} sub={`${h.beds.available} available`} pct={((h.beds.total - h.beds.available) / h.beds.total) * 100} />
        <Big label="ICU beds" value={h.icu.total} sub={`${h.icu.available} available`} pct={((h.icu.total - h.icu.available) / h.icu.total) * 100} tone="emergency" />
        <Big label="Emergency bays" value={8} sub="3 in use" pct={38} tone="warning" />
      </div>

      <div className="space-y-4">
        {wards.map((w) => (
          <div key={w.name} className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold">{w.name}</h2>
                <p className="text-[12px] text-muted-foreground">{w.beds.filter((b) => b.occupied).length}/{w.beds.length} occupied</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className={cn("size-3 rounded-md", w.tone === "emergency" ? "bg-emergency" : w.tone === "info" ? "bg-info" : "bg-primary")} /> Occupied</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-md border border-border bg-surface-variant" /> Available</span>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-2 sm:grid-cols-12">
              {w.beds.map((b) => {
                const color = !b.occupied ? "bg-surface-variant border-border text-muted-foreground" :
                  w.tone === "emergency" ? "bg-emergency/15 border-emergency/30 text-emergency" :
                  w.tone === "info" ? "bg-info/10 border-info/30 text-info" :
                  "bg-primary-container border-primary/30 text-primary";
                return (
                  <div key={b.id} className={cn("group relative flex aspect-square items-center justify-center rounded-xl border text-[11px] font-bold transition", color)}>
                    <span>#{b.id}</span>
                    {b.occupied && <User className="absolute right-1 top-1 size-2.5 opacity-60" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Big({ label, value, sub, pct, tone }: any) {
  const toneCls = tone === "emergency" ? "text-emergency" : tone === "warning" ? "text-warning" : "text-primary";
  const bar = tone === "emergency" ? "bg-emergency" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
        {tone === "emergency" ? <Activity className="size-4" /> : <BedDouble className="size-4" />}
        {label}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-[36px] font-bold leading-none">{value}</p>
        <p className={cn("mb-1 text-[13px] font-semibold", toneCls)}>{sub}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-variant">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{Math.round(pct)}% capacity</p>
    </div>
  );
}
