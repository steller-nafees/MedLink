import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, PrimaryButton, ProgressIndicator } from "@/components/medlink/auth/auth-kit";
import { cn } from "@/lib/utils";
import { ArrowRight, Siren, Bot, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/patient/auth/onboarding")({
  head: () => ({
    meta: [
      { title: "How MedLink works · Onboarding" },
      { name: "description", content: "Emergency help, an AI medical assistant, and connected healthcare in one place." },
      { property: "og:title", content: "How MedLink works" },
      { property: "og:description", content: "Emergency help, AI assistance and connected healthcare." },
    ],
  }),
  component: Onboarding,
});

const slides = [
  {
    icon: Siren,
    title: "Emergency Help When Every Second Matters",
    desc: "Find hospitals, ambulances, and emergency care faster during critical situations.",
    art: EmergencyArt,
  },
  {
    icon: Bot,
    title: "Your AI Medical Assistant",
    desc: "Get help finding specialists, diagnostic tests, hospitals, and healthcare information through natural conversation.",
    art: AiArt,
  },
  {
    icon: LayoutGrid,
    title: "Healthcare Connected in One Place",
    desc: "Access hospitals, consultations, reservations, emergency support, and medical services from a single platform.",
    art: ConnectedArt,
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = slides[i];
  const Art = slide.art;
  const last = i === slides.length - 1;

  const go = (n: number) => {
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  return (
    <AuthScreen label="Auth · Onboarding">
      <div
        className="flex min-h-full flex-col px-6 pt-4 pb-8"
        onTouchStart={(e) => ((window as any).__ox = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - ((window as any).__ox ?? 0);
          if (dx < -40 && !last) go(i + 1);
          if (dx > 40 && i > 0) go(i - 1);
        }}
      >
        <div className="flex items-center justify-between">
          <ProgressIndicator total={slides.length} current={i} />
          <Link to="/patient/auth" className="text-[13px] font-semibold text-muted-foreground">
            Skip
          </Link>
        </div>

        <div key={i} className="soft-in mt-8 flex flex-1 flex-col" style={{ animationDuration: "320ms" }}>
          <div className="rounded-[34px] border border-border/70 bg-surface p-5 shadow-card">
            <Art />
          </div>

          <div className="mt-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
              <slide.icon className="size-3.5" /> Step {i + 1} of {slides.length}
            </span>
            <h1 className="mt-4 text-[30px] font-bold leading-[1.15] tracking-tight">{slide.title}</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{slide.desc}</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {last ? (
            <PrimaryButton to="/patient/auth">
              Get Started <ArrowRight className="size-4" />
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => go(i + 1)}>
              Next <ArrowRight className="size-4" />
            </PrimaryButton>
          )}
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, n) => (
              <button
                key={n}
                aria-label={`Go to slide ${n + 1}`}
                onClick={() => go(n)}
                className={cn("h-1.5 rounded-full transition-all duration-500", n === i ? "w-6 bg-primary" : "w-1.5 bg-border")}
              />
            ))}
          </div>
          <p className="text-center text-[11.5px] text-muted-foreground">
            Swipe to explore · dir {dir > 0 ? "→" : "←"}
          </p>
        </div>
      </div>
    </AuthScreen>
  );
}

/* ------------------------------ Illustrations ----------------------------- */

function EmergencyArt() {
  return (
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-[26px] bg-surface-variant">
      <span className="absolute -left-8 -top-8 size-32 rounded-full bg-emergency/10" />
      <span className="absolute -bottom-10 -right-6 size-36 rounded-full bg-primary/10" />
      <div className="relative flex items-end gap-4">
        <div className="grid size-14 place-items-center rounded-2xl bg-surface shadow-card">🏥</div>
        <div className="relative grid size-20 place-items-center rounded-full gradient-emergency text-white shadow-float float-y">
          <span className="absolute inset-0 rounded-full bg-emergency/25 sos-ring" />
          <Siren className="relative size-8" />
        </div>
        <div className="grid size-14 place-items-center rounded-2xl bg-surface shadow-card">🚑</div>
      </div>
      <svg className="absolute inset-x-6 bottom-8" height="24" viewBox="0 0 300 24" fill="none">
        <path d="M0 12h60l10-8 10 16 12-24 10 24 8-8h190" stroke="currentColor" className="text-emergency/50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AiArt() {
  return (
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-[26px] bg-surface-variant px-6">
      <span className="absolute -right-10 -top-10 size-36 rounded-full bg-primary/10" />
      <div className="relative w-full space-y-2.5">
        <div className="ml-auto w-3/4 rounded-[20px] rounded-br-md gradient-primary px-4 py-3 text-[12.5px] text-primary-foreground shadow-card">
          I need a cardiologist near me this week.
        </div>
        <div className="flex items-end gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
            <Bot className="size-4" />
          </span>
          <div className="w-3/4 rounded-[20px] rounded-bl-md bg-surface px-4 py-3 text-[12.5px] shadow-card">
            I found 3 cardiologists with openings — the closest is 2.4 km away.
          </div>
        </div>
        <div className="flex gap-1.5 pl-10">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${d * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectedArt() {
  const tiles = ["🏥", "🩺", "💊", "🧪", "📅", "🚑", "🩸", "📋", "❤️"];
  return (
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-[26px] bg-surface-variant">
      <span className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative grid grid-cols-3 gap-2.5">
        {tiles.map((t, n) => (
          <div
            key={n}
            className={cn(
              "grid size-14 place-items-center rounded-2xl text-[20px] shadow-card transition",
              n === 4 ? "gradient-primary text-primary-foreground" : "bg-surface"
            )}
          >
            {n === 4 ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h3l2-6 4 12 2-6h7" />
              </svg>
            ) : (
              t
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
