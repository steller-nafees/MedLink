import { createFileRoute } from "@tanstack/react-router";
import { emergencyQueue, severityStyle } from "@/lib/medlink/data";
import { Filter, Siren, Check, X, BedDouble, Activity, PhoneCall, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/hospital/emergencies")({
  head: () => ({ meta: [{ title: "Emergencies · Hospital Dashboard" }, { name: "description", content: "Live emergency case queue." }] }),
  component: Emergencies,
});

function Emergencies() {
  const [selected, setSelected] = useState(emergencyQueue[0]);
  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight">Emergency queue</h1>
            <p className="text-[13px] text-muted-foreground">{emergencyQueue.length} active cases · AI-triaged</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold"><Filter className="size-3.5" /> Severity</button>
            <button className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold">Today</button>
          </div>
        </div>
        <div className="space-y-3">
          {emergencyQueue.map((e) => {
            const s = severityStyle(e.severity);
            const active = selected.id === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={cn(
                  "w-full rounded-3xl border bg-surface p-4 text-left shadow-card transition",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border/70 hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", s.bg, s.text)}>
                    <Siren className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-bold">{e.patient}, {e.age}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", s.bg, s.text)}>{e.severity}</span>
                      <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10.5px] text-foreground/70">#{e.id}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{e.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <Chip label={`ETA ${e.eta}`} />
                      <Chip label={e.ambulance} />
                      <Chip label={e.status.replace("_", " ")} tone="primary" />
                      <Chip label={e.createdAt} tone="muted" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="sticky top-24 h-fit rounded-3xl border border-border/70 bg-surface shadow-card">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Case detail</p>
            <span className="rounded-full bg-emergency/10 px-2 py-0.5 text-[10.5px] font-bold text-emergency">Live</span>
          </div>
          <h2 className="mt-2 text-[22px] font-bold">{selected.patient}, {selected.age}</h2>
          <p className="text-[12.5px] text-muted-foreground">#{selected.id} · reported {selected.createdAt}</p>
        </div>

        <div className="mx-5 mb-4 rounded-2xl border border-emergency/20 bg-emergency/5 p-4">
          <div className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-emergency" /><p className="text-[11px] font-bold uppercase tracking-widest text-emergency">AI summary</p></div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">{selected.summary}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {selected.symptoms.map((t) => (
              <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-foreground/80">{t}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5">
          <MiniStat label="ETA" value={selected.eta} icon={Activity} />
          <MiniStat label="Bed" value="Bay 3" icon={BedDouble} tone="primary" />
          <MiniStat label="ICU" value={selected.severity === "critical" ? "ICU-4" : "—"} icon={Activity} tone="emergency" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 px-5">
          <button className="flex items-center justify-center gap-1.5 rounded-full gradient-primary py-2.5 text-[13px] font-semibold text-primary-foreground shadow-float"><Check className="size-4" /> Accept case</button>
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-[13px] font-semibold"><X className="size-4" /> Redirect</button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 px-5">
          <button className="rounded-full border border-primary/30 py-2.5 text-[12.5px] font-semibold text-primary">Reserve bed</button>
          <button className="rounded-full border border-emergency/30 py-2.5 text-[12.5px] font-semibold text-emergency">Reserve ICU</button>
        </div>

        <div className="mx-5 mt-4 rounded-2xl border border-border/70 bg-surface-variant/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Dispatch</p>
          <div className="mt-2 flex items-center gap-2 text-[13px]">
            <span className="font-semibold">{selected.ambulance}</span>
            <span className="text-muted-foreground">· Dr. Priya Rao</span>
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2 text-[12px] font-semibold"><PhoneCall className="size-3.5" /> Contact driver</button>
        </div>
        <div className="p-5 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Prepare</p>
          <ul className="mt-2 space-y-1.5 text-[12.5px]">
            {["Cardiology team paged", "Cath lab on standby", "Blood O- confirmed available"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="size-3.5 text-success" /> {t}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone?: "primary" | "muted" }) {
  return (
    <span className={cn(
      "rounded-full px-2 py-0.5 font-semibold capitalize",
      tone === "primary" ? "bg-primary-container text-primary" : "bg-surface-variant text-foreground/70"
    )}>{label}</span>
  );
}

function MiniStat({ label, value, icon: Icon, tone }: any) {
  const toneCls = tone === "emergency" ? "bg-emergency/10 text-emergency" : tone === "primary" ? "bg-primary-container text-primary" : "bg-surface-variant text-foreground/70";
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-3 text-center">
      <div className={cn("mx-auto grid size-7 place-items-center rounded-full", toneCls)}><Icon className="size-3.5" /></div>
      <p className="mt-1.5 text-[14px] font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
