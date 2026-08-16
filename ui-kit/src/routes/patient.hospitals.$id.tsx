import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PatientShell } from "@/components/medlink/patient-shell";
import { hospitals } from "@/lib/medlink/data";
import { PhoneCall, Navigation, BedDouble, Droplet, Star, Clock, ArrowLeft, Share2, Heart } from "lucide-react";

export const Route = createFileRoute("/patient/hospitals/$id")({
  head: () => ({ meta: [{ title: "Hospital · MedLink" }, { name: "description", content: "Hospital details and reservations." }] }),
  loader: ({ params }) => {
    const h = hospitals.find((x) => x.id === params.id);
    if (!h) throw notFound();
    return h;
  },
  component: Detail,
  notFoundComponent: () => (
    <PatientShell label="Not found"><div className="p-8 text-center text-muted-foreground">Hospital not found.</div></PatientShell>
  ),
});

function Detail() {
  const h = Route.useLoaderData();
  return (
    <PatientShell label="Patient · Hospital">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4">
        <Link to="/patient/hospitals" className="grid size-10 place-items-center rounded-full border border-border/70 bg-surface shadow-card">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex gap-2">
          <button className="grid size-10 place-items-center rounded-full border border-border/70 bg-surface shadow-card">
            <Share2 className="size-4" />
          </button>
          <button className="grid size-10 place-items-center rounded-full border border-border/70 bg-surface shadow-card">
            <Heart className="size-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* Badges row — always visible, wraps instead of clipping */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-primary">
            Level 1 Trauma
          </span>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-bold text-success">
            Accepting
          </span>
        </div>

        <h1 className="mt-2 text-[24px] font-bold leading-tight tracking-tight">{h.name}</h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{h.address}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat icon={Clock} label="ETA" value={`${h.etaMin} min`} />
          <Stat icon={Star} label="Rating" value={h.rating.toString()} tone="warning" />
          <Stat icon={Navigation} label="Distance" value={`${h.distanceKm} km`} />
        </div>

        <SectionTitle title="Live availability" />
        <div className="grid grid-cols-3 gap-2">
          <Avail label="Beds" value={h.beds.available} total={h.beds.total} />
          <Avail label="ICU" value={h.icu.available} total={h.icu.total} tone="emergency" />
          <Avail label="ER Bays" value={4} total={8} tone="success" />
        </div>

        <SectionTitle title="Departments" />
        <div className="flex flex-wrap gap-1.5">
          {h.departments.map((d: string) => (
            <span key={d} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-foreground/80">{d}</span>
          ))}
        </div>

        <SectionTitle title="Blood bank" />
        <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-card">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Droplet className="size-3.5 text-emergency" /> Available types
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {h.bloodBank.map((b: string) => (
              <span key={b} className="rounded-full bg-emergency/10 px-2.5 py-1 text-[11.5px] font-bold text-emergency">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA bar */}
      <div className="sticky bottom-4 mx-5 mt-6 flex gap-2 rounded-full border border-border/70 bg-surface p-2 shadow-float">
        <a href={`tel:${h.phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-[13px] font-semibold">
          <PhoneCall className="size-4" /> Call
        </a>
        <Link to="/patient/sos" className="flex flex-1 items-center justify-center gap-1.5 rounded-full gradient-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
          <BedDouble className="size-4" /> Reserve bed
        </Link>
      </div>
    </PatientShell>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-3 text-center shadow-card">
      <Icon className={`mx-auto size-4 ${tone === "warning" ? "text-warning" : "text-muted-foreground"}`} />
      <p className="mt-1 text-[15px] font-bold">{value}</p>
      <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function Avail({ label, value, total, tone }: any) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const color = tone === "emergency" ? "bg-emergency" : tone === "success" ? "bg-success" : "bg-primary";
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-3 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-[18px] font-bold">{value}{total ? <span className="text-[11px] font-medium text-muted-foreground">/{total}</span> : ""}</p>
      </div>
      <p className="text-[10.5px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-variant">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <p className="mb-2 mt-5 text-[13px] font-bold">{title}</p>;
}