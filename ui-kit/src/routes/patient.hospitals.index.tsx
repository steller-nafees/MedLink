import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientShell, ScreenHeader } from "@/components/medlink/patient-shell";
import { hospitals } from "@/lib/medlink/data";
import { StylizedMap, hospitalMarkers } from "@/components/medlink/stylized-map";
import { Search, SlidersHorizontal, Stethoscope, ChevronRight, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/hospitals/")({
  head: () => ({ meta: [{ title: "Hospitals · MedLink Patient" }, { name: "description", content: "Find nearby hospitals with live availability." }] }),
  component: Hospitals,
});

const chips = ["All", "Emergency", "Cardiology", "Trauma", "Pediatrics", "ICU"];

function Hospitals() {
  const [active, setActive] = useState("All");
  return (
    <PatientShell label="Patient · Hospitals">
      <ScreenHeader title="Hospitals" subtitle="Live availability near you" />
      <div className="px-5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search hospitals or specialty" className="w-full rounded-full border border-border bg-surface py-3 pl-9 pr-4 text-[13px] outline-none placeholder:text-muted-foreground focus:border-primary" />
          </div>
          <button className="grid size-11 place-items-center rounded-full gradient-primary text-primary-foreground shadow-float">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition",
                active === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground/70"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 px-5">
        <StylizedMap className="h-40" markers={hospitalMarkers(hospitals).concat([{ x: 50, y: 55, kind: "patient", label: "You" }])} compact />
      </div>

      <div className="mt-4 space-y-3 px-5">
        <p className="text-[12px] font-semibold text-muted-foreground">{hospitals.length} hospitals · sorted by distance</p>
        {hospitals.map((h) => (
          <Link
            key={h.id}
            to="/patient/hospitals/$id"
            params={{ id: h.id }}
            className="block overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-card"
          >
            <div className="flex items-start gap-3 p-4">
              <div className="grid size-12 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                <Stethoscope className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-bold leading-tight">{h.name}</p>
                  <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10.5px] font-bold text-primary">{h.etaMin}m</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <MapPin className="size-3" /><span>{h.address}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[11.5px]">
                  <span className="flex items-center gap-1 text-warning"><Star className="size-3 fill-warning" /> {h.rating}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{h.distanceKm.toFixed(1)} km</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/70 bg-surface-variant/60">
              <MiniStat label="Beds" value={h.beds.available} total={h.beds.total} />
              <MiniStat label="ICU" value={h.icu.available} total={h.icu.total} tone="emergency" />
              <MiniStat label="ER" value={h.emergency ? "Open" : "—"} tone="success" />
            </div>
          </Link>
        ))}
      </div>
    </PatientShell>
  );
}

function MiniStat({ label, value, total, tone }: any) {
  const color = tone === "emergency" ? "text-emergency" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="flex flex-col items-center gap-0.5 py-2.5">
      <p className={`text-[14px] font-bold ${color}`}>{value}{total ? <span className="text-[10px] font-medium text-muted-foreground">/{total}</span> : ""}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
