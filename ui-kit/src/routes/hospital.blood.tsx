import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { hospitals } from "@/lib/medlink/data";
import {
  bloodGroups,
  bloodRequests,
  bloodStatusStyle,
  matchDonors,
  type BloodGroup,
  type BloodRequest,
  type BloodRequestStatus,
} from "@/lib/medlink/blood";
import { DonorCard, ConfirmDonationRequest } from "@/components/medlink/blood/blood-kit";
import { Droplet, Plus, MapPin, Phone, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospital/blood")({
  head: () => ({
    meta: [
      { title: "Blood Requests · Hospital Dashboard" },
      { name: "description", content: "Create blood requests and reach the nearest eligible donors instantly." },
      { property: "og:title", content: "Blood Requests · MedLink Hospital" },
      { property: "og:description", content: "Coordinate emergency blood donations with matched nearby donors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BloodDesk,
});

function BloodDesk() {
  const hospital = hospitals[0];
  const [form, setForm] = useState({
    patient: "Eleanor Chen",
    group: "O+" as BloodGroup,
    units: 2,
    priority: "High" as BloodRequest["priority"],
    department: "Emergency",
  });
  const [requests, setRequests] = useState<BloodRequest[]>(bloodRequests);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [pendingDonor, setPendingDonor] = useState<{ id: string; name: string } | null>(null);

  const matches = useMemo(() => matchDonors(form.group, hospital.id, { limit: 5 }), [form.group, hospital.id]);

  const createRequest = () => {
    setRequests((r) => [
      {
        id: `b-${Math.floor(Math.random() * 9000 + 1000)}`,
        patient: form.patient || "Unnamed patient",
        group: form.group,
        units: form.units,
        priority: form.priority,
        department: form.department,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        createdAt: "just now",
        donorRequests: [],
      },
      ...r,
    ]);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Blood requests</h1>
          <p className="text-[13px] text-muted-foreground">Create a request and reach the nearest eligible donors to {hospital.name}.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emergency/10 px-3 py-1.5 text-[12px] font-bold text-emergency">
          <Droplet className="size-3.5" /> {requests.length} open requests
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Create request */}
        <section className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
          <h2 className="text-[15px] font-bold">New blood request</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Patient name">
              <input
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
                className="w-full rounded-2xl border border-border/70 bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </Field>
            <Field label="Blood group">
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value as BloodGroup })}
                className="w-full rounded-2xl border border-border/70 bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              >
                {bloodGroups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Units required">
              <input
                type="number"
                min={1}
                value={form.units}
                onChange={(e) => setForm({ ...form, units: Math.max(1, Number(e.target.value) || 1) })}
                className="w-full rounded-2xl border border-border/70 bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as BloodRequest["priority"] })}
                className="w-full rounded-2xl border border-border/70 bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              >
                {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Department" wide>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-2xl border border-border/70 bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus:border-primary"
              />
            </Field>
          </div>
          <button
            onClick={createRequest}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-3 text-[13.5px] font-semibold text-white shadow-float"
          >
            <Plus className="size-4" /> Create blood request
          </button>
        </section>

        {/* Matching donors */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-[15px] font-bold">Matching donors</h2>
              <p className="text-[12px] text-muted-foreground">Ranked by compatibility, eligibility, availability and distance from hospital.</p>
            </div>
            <span className="rounded-full bg-surface-variant px-2.5 py-1 text-[11.5px] font-bold">{matches.length} matches</span>
          </div>
          <div className="space-y-2.5">
            {matches.length === 0 && (
              <p className="rounded-3xl border border-border/70 bg-surface p-5 text-[13px] text-muted-foreground shadow-card">
                No eligible donors available for {form.group} right now.
              </p>
            )}
            {matches.map((d) => (
              <DonorCard key={d.id} donor={d} requested={sentTo.includes(d.id)} onRequest={() => setPendingDonor({ id: d.id, name: d.name })} />
            ))}
          </div>
        </section>
      </div>

      {/* Request management */}
      <section>
        <h2 className="mb-3 text-[15px] font-bold">Request management</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emergency/10 text-[13px] font-extrabold text-emergency">{r.group}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold leading-tight">{r.patient}</p>
                  <p className="text-[11.5px] text-muted-foreground">{r.department} · {r.units} bags · {r.createdAt}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-bold", r.priority === "High" ? "bg-emergency/10 text-emergency" : "bg-warning/10 text-warning")}>
                  {r.priority} priority
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {r.donorRequests.length === 0 && <p className="text-[12px] text-muted-foreground">No donor requests sent yet.</p>}
                {r.donorRequests.map((dr) => {
                  const s = bloodStatusStyle(dr.status as BloodRequestStatus);
                  return (
                    <div key={dr.id} className="flex items-center gap-2.5 rounded-2xl bg-surface-variant/60 px-3 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{dr.donorName}</span>
                      <span className="text-[11.5px] text-muted-foreground">{dr.group}</span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-bold", s.cls)}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDonationRequest
        open={!!pendingDonor}
        donorName={pendingDonor?.name ?? ""}
        group={form.group}
        hospitalName={hospital.name}
        onCancel={() => setPendingDonor(null)}
        onConfirm={() => {
          if (pendingDonor) {
            setSentTo((s) => [...s, pendingDonor.id]);
            setRequests((list) =>
              list.map((r, i) =>
                i === 0
                  ? { ...r, donorRequests: [...r.donorRequests, { id: `dr-${pendingDonor.id}-${r.id}`, donorId: pendingDonor.id, donorName: pendingDonor.name, group: form.group, status: "sent" as BloodRequestStatus, sentAt: "just now" }] }
                  : r,
              ),
            );
          }
          setPendingDonor(null);
        }}
      />
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={cn("block", wide && "sm:col-span-2")}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
