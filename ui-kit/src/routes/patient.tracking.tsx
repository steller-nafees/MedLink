import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientShell } from "@/components/medlink/patient-shell";
import { StylizedMap } from "@/components/medlink/stylized-map";
import { ambulances, hospitals } from "@/lib/medlink/data";
import { PhoneCall, MessageSquare, ArrowLeft, Check, Truck, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/tracking")({
  head: () => ({ meta: [{ title: "Live Tracking · MedLink Patient" }, { name: "description", content: "Live ambulance and case tracking." }] }),
  component: Tracking,
});

const steps = [
  { label: "Request accepted", time: "9:41 AM", done: true },
  { label: "Ambulance en route", time: "9:42 AM", done: true, current: true },
  { label: "On scene", time: "—", done: false },
  { label: "Patient picked up", time: "—", done: false },
  { label: "Arrived at hospital", time: "—", done: false },
];

function Tracking() {
  const a = ambulances[0];
  const h = hospitals[0];
  return (
    <PatientShell label="Patient · Live tracking" hideSos>
      <div className="relative">
        <StylizedMap
          className="h-64 rounded-none"
          markers={[
            { x: 50, y: 65, kind: "patient", label: "You" },
            { x: 40, y: 48, kind: "ambulance", label: a.callSign },
            { x: h.coord.x, y: h.coord.y, kind: "hospital", label: h.name.split(" ")[1] },
          ]}
          route={{ from: { x: 40, y: 48 }, to: { x: 50, y: 65 } }}
        />
        <Link to="/patient" className="absolute left-4 top-3 grid size-10 place-items-center rounded-full bg-surface/95 shadow-card"><ArrowLeft className="size-4" /></Link>
        <div className="absolute right-4 top-3 rounded-full bg-emergency px-3 py-1.5 text-[11px] font-bold text-white shadow-float">Live</div>
      </div>

      <div className="-mt-6 rounded-t-3xl bg-background px-5 pt-6">
        <div className="rounded-3xl gradient-primary p-4 text-primary-foreground shadow-float">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Arriving in</p>
              <p className="mt-0.5 text-[36px] font-bold leading-none">{a.etaMin} <span className="text-[16px] font-semibold">min</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] opacity-80">{a.callSign} · {a.type}</p>
              <p className="text-[13px] font-semibold">{a.crew}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <a href={`tel:${a.phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/20 py-2.5 text-[12.5px] font-semibold backdrop-blur"><PhoneCall className="size-4" /> Call driver</a>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/20 py-2.5 text-[12.5px] font-semibold backdrop-blur"><MessageSquare className="size-4" /> Message</button>
          </div>
        </div>

        <p className="mt-6 text-[13px] font-bold">Trip timeline</p>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={s.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn(
                  "grid size-6 place-items-center rounded-full text-[10px] font-bold",
                  s.done ? "bg-primary text-primary-foreground" : "bg-surface-variant text-muted-foreground",
                  s.current && "ring-4 ring-primary/20"
                )}>{s.done ? <Check className="size-3" /> : i + 1}</span>
                {i < steps.length - 1 && <span className={cn("h-8 w-0.5", s.done ? "bg-primary" : "bg-border")} />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <p className={cn("text-[13.5px] font-semibold", !s.done && "text-muted-foreground")}>{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.time}</p>
                </div>
                {s.current && <p className="text-[11.5px] text-primary">Currently 1.1 km away · Elm Street</p>}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary-container text-primary"><Building2 className="size-5" /></div>
            <div className="flex-1">
              <p className="text-[13.5px] font-bold">{h.name}</p>
              <p className="text-[11.5px] text-muted-foreground">Emergency Bay 3 · reserved</p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-1 text-[10.5px] font-bold text-success">Ready</span>
          </div>
        </div>
      </div>
    </PatientShell>
  );
}
