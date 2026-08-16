import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientShell } from "@/components/medlink/patient-shell";
import { patient, serviceRequests, requestKindLabel } from "@/lib/medlink/data";
import { StatusBadge, PaymentBadge, kindIcon } from "@/components/medlink/request-kit";
import { Bell, Bot, Siren, Building2, Truck, FileHeart, Contact, ChevronRight, ArrowUpRight, Settings, Lock, Stethoscope, CalendarCheck } from "lucide-react";
import { myDonation, eligibilityFrom, formatDate } from "@/lib/medlink/blood";
import { DonationSummary } from "@/components/medlink/blood/blood-kit";

export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "Home · MedLink Patient" },
      { name: "description", content: "AI assistance, emergency SOS, and all your healthcare requests in one calm place." },
    ],
  }),
  component: Home,
});

const quickAccess = [
  { label: "Hospitals", icon: Building2, to: "/patient/hospitals" },
  { label: "Ambulances", icon: Truck, to: "/patient/sos" },
  { label: "Contacts", icon: Contact, to: "/patient/profile/#contacts" },
] as const;

function Home() {
  const recent = serviceRequests.filter((r) => r.kind === "emergency").slice(0, 3);
  const active = serviceRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const due = serviceRequests.filter((r) => r.status === "completed" && r.payment !== "paid");

  return (
    <PatientShell label="Patient · Home">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full gradient-primary text-[14px] font-bold text-primary-foreground shadow-card">SR</div>
          <div>
            <p className="text-[12px] text-muted-foreground">Good morning</p>
            <p className="text-[15.5px] font-bold leading-tight">{patient.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/patient/notifications" className="relative grid size-10 place-items-center rounded-full border border-border/60 bg-surface shadow-card transition active:scale-95">
            <Bell className="size-4" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-emergency ring-2 ring-surface" />
          </Link>
          <Link
            to="/patient/settings"
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full border border-border/60 bg-surface text-muted-foreground shadow-card transition active:scale-95"
          >
            <Settings className="size-[17px]" />
          </Link>
        </div>
      </header>


      {/* Hero */}
      <section className="space-y-3 px-5 pt-6">
        <Link
          to="/patient/ai"
          className="group relative block overflow-hidden rounded-[28px] border border-border/60 bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-dialog"
        >
          <div className="absolute -right-10 -top-10 size-36 rounded-full bg-primary-container/70 blur-xl" />
          <div className="relative">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary-container text-primary"><Bot className="size-6" /></div>
            <h2 className="mt-4 text-[20px] font-bold leading-tight">AI Medical Assistant</h2>
            <p className="mt-1 max-w-[240px] text-[13px] leading-relaxed text-muted-foreground">
              Ask health questions, find specialists or tests, and understand your reports.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-card transition group-active:scale-95">
              Ask AI Assistant <ArrowUpRight className="size-4" />
            </span>
          </div>
        </Link>

        <Link
          to="/patient/sos"
          className="group relative block overflow-hidden rounded-[28px] gradient-emergency p-5 text-white shadow-float transition duration-300 hover:-translate-y-0.5"
        >
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Siren className="size-6" /></div>
            <h2 className="mt-4 text-[20px] font-bold leading-tight">Emergency SOS</h2>
            <p className="mt-1 max-w-[250px] text-[13px] leading-relaxed opacity-90">
              Request an ambulance, find hospitals, and reserve a bed or ICU instantly.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-emergency shadow-card transition group-active:scale-95">
              Activate SOS <ArrowUpRight className="size-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* Quick access */}
      <section className="px-5 pt-7">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Quick access</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {quickAccess.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.label} to={q.to} className="flex flex-col items-center gap-2 rounded-3xl border border-border/60 bg-surface px-1.5 py-3.5 shadow-card transition active:scale-95">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary-container text-primary"><Icon className="size-[18px]" /></span>
                <span className="text-[10.5px] font-semibold">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Future Services */}
      <section className="space-y-3 px-5 pt-7">
        <h3 className="mb-0.5 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Future Services</h3>

        {/* Live Medical Support */}
        <div className="group relative block overflow-hidden rounded-[28px] border border-border/60 bg-surface p-5 shadow-card">
          <div className="absolute -right-10 -top-10 size-36 rounded-full bg-primary-container/70 blur-xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary-container text-primary">
                <Stethoscope className="size-6" />
              </div>
              <span className="rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Coming Soon
              </span>
            </div>
            <h2 className="mt-4 text-[20px] font-bold leading-tight">Live Medical Support</h2>
            <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
              Speak with licensed healthcare professionals in real time for medical guidance, symptom clarification, and treatment advice.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-muted-foreground"
            >
              <Lock className="size-4" />
              Coming Soon
            </button>
          </div>
        </div>

        {/* Appointments & Tests */}
        <div className="group relative block overflow-hidden rounded-[28px] border border-border/60 bg-surface p-5 shadow-card">
          <div className="absolute -right-10 -top-10 size-36 rounded-full bg-primary-container/70 blur-xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary-container text-primary">
                <CalendarCheck className="size-6" />
              </div>
              <span className="rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Coming Soon
              </span>
            </div>
            <h2 className="mt-4 text-[20px] font-bold leading-tight">Appointments & Tests</h2>
            <p className="mt-1 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
              Book doctor consultations, specialist appointments, and diagnostic tests directly through MedLink.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2.5 text-[13px] font-semibold text-muted-foreground"
            >
              <Lock className="size-4" />
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* Blood donation */}
      <section className="px-5 pt-7">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Blood donation</h3>
        <DonationSummary
          group={myDonation.group}
          lastDonation={formatDate(myDonation.lastDonation)}
          eligibility={eligibilityFrom(myDonation.lastDonation)}
          available={myDonation.available}
          action={
            <Link to="/patient/profile" className="rounded-full bg-primary-container px-3.5 py-2 text-[12px] font-bold text-primary">
              Manage availability
            </Link>
          }
        />
      </section>

      {/* Recent activity */}
      <section className="px-5 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Recent activity</h3>
          <Link to="/patient/activity" className="text-[12.5px] font-semibold text-primary">View all</Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-card">
          {recent.map((r, i) => {
            const Icon = kindIcon[r.kind];
            return (
              <Link
                key={r.id}
                to="/patient/activity"
                className={`flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-surface-variant/60 ${i > 0 ? "border-t border-border/50" : ""}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${r.kind === "emergency" ? "bg-emergency/10 text-emergency" : "bg-primary-container text-primary"}`}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{r.title}</span>
                  <span className="block text-[11.5px] text-muted-foreground">{requestKindLabel[r.kind]} · {r.date}</span>
                </span>
                <StatusBadge status={r.status} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
          {!recent.length && (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No emergency activity yet.</p>
          )}
        </div>
      </section>

      {/* Requests summary */}
      <section className="px-5 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">My requests</h3>
          <Link to="/patient/activity" className="text-[12.5px] font-semibold text-primary">Manage</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Link to="/patient/activity" className="rounded-3xl border border-border/60 bg-surface p-4 shadow-card transition active:scale-[0.98]">
            <p className="text-[28px] font-bold leading-none">{active.length}</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">Active requests</p>
          </Link>
          <Link to="/patient/activity" className="rounded-3xl border border-border/60 bg-surface p-4 shadow-card transition active:scale-[0.98]">
            <p className="text-[28px] font-bold leading-none">{due.length}</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">Pending payment</p>
          </Link>
        </div>

        {due[0] && (
          <div className="mt-2.5 rounded-3xl border border-border/60 bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{due[0].title}</p>
                <p className="truncate text-[12px] text-muted-foreground">{due[0].hospital}</p>
                <div className="mt-2"><PaymentBadge payment={due[0].payment} /></div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="relative mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted px-4 py-3 text-[13.5px] font-semibold text-muted-foreground"
            >
              Pay in App
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary">
                Coming Soon
              </span>
            </button>
          </div>
        )}
      </section>
    </PatientShell>
  );
}