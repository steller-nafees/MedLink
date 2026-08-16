import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/medlink/logo";
import { Smartphone, Building2, Truck, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedLink Enterprise — Choose your platform" },
      { name: "description", content: "AI-assisted emergency coordination across patient, hospital, ambulance and admin platforms." },
      { property: "og:title", content: "MedLink Enterprise" },
      { property: "og:description", content: "AI-assisted emergency coordination for patients, hospitals, and ambulances." },
    ],
  }),
  component: Landing,
});

const roles = [
  { to: "/patient/auth/splash", label: "Patient", desc: "Request emergency care and manage your health.", icon: Smartphone, tag: "iOS · Android", tone: "gradient-primary" },
  { to: "/hospital", label: "Hospital", desc: "Coordinate beds, ICU and incoming cases.", icon: Building2, tag: "Web dashboard", tone: "bg-foreground" },
  { to: "/ambulance/splash", label: "Ambulance", desc: "Receive dispatches and update trip status.", icon: Truck, tag: "iOS · Android", tone: "bg-info" },
  { to: "/admin", label: "Super Admin", desc: "Oversee organizations and platform health.", icon: ShieldCheck, tag: "Web dashboard", tone: "gradient-primary" },
];

function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-[13px] font-medium text-muted-foreground md:flex">
          <a href="#platforms" className="hover:text-foreground">Platforms</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#about" className="hover:text-foreground">About</a>
          <Link to="/auth" className="rounded-full bg-foreground px-4 py-2 text-background hover:opacity-90">Sign in</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-[12px] font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          AI-assisted emergency coordination · v1.0
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-[44px] leading-[1.05] font-bold tracking-tight md:text-[64px]">
          Emergency healthcare, <span className="text-primary">calmly</span> coordinated.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          MedLink Enterprise connects patients, hospitals and ambulances into one intelligent ecosystem — so help arrives in the fewest possible taps.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/patient/sos" search={{ guest: "1" }} className="rounded-full gradient-emergency px-6 py-3 text-[14px] font-semibold text-white shadow-float transition hover:brightness-110">
            Try Emergency SOS
          </Link>
          <Link to="/hospital" className="rounded-full border border-border bg-surface px-6 py-3 text-[14px] font-semibold text-foreground transition hover:bg-surface-variant">
            Explore hospital dashboard
          </Link>
        </div>
      </section>

      <section id="platforms" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[24px] font-bold tracking-tight">Choose a platform</h2>
            <p className="text-[13.5px] text-muted-foreground">Four surfaces, one design language.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.to}
                to={r.to}
                className="group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-border/70 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-dialog"
              >
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl text-white ${r.tone}`}>
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-bold">{r.label}</h3>
                    <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{r.tag}</span>
                  </div>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">{r.desc}</p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2"><Logo showText={false} /><span>MedLink Enterprise · Prototype</span></div>
          <div>Not a real medical service · Demo data only</div>
        </div>
      </footer>
    </div>
  );
}
