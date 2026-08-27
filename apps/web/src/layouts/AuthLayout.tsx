import { useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Siren } from "lucide-react";
import { GuestSosModal } from "@/features/auth/components/GuestSosModal";
import { accountTypes } from "@/features/auth/types";

// Note: Instead of a bare "M" we can use a more properly styled Logo or text,
// but for now keeping it simple.
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-[10px] bg-primary text-[15px] font-bold text-white shadow-card">
        M
      </span>
      <span className="text-[17px] font-bold tracking-tight">MedLink</span>
    </div>
  );
}

export function AuthLayout({ children }: { children?: ReactNode }) {
  const [showSos, setShowSos] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setShowSos(true)}
          className="flex items-center gap-2 rounded-full gradient-emergency px-4 py-2.5 text-[13px] font-semibold text-white shadow-float transition hover:brightness-110"
        >
          <Siren className="size-4" /> Emergency SOS
        </button>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <section className="hidden lg:block">
          <h1 className="max-w-lg text-[44px] font-bold leading-[1.05] tracking-tight">
            One portal for <span className="text-primary">every</span> MedLink account.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Patients, ambulance drivers and hospitals sign in here. Your role loads the right dashboard automatically —
            no role picking, no extra steps.
          </p>
          <ul className="mt-8 space-y-3">
            {accountTypes.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-3xl border border-border/70 bg-surface/70 p-4 shadow-card backdrop-blur">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-variant text-[18px]">{t.emoji}</span>
                <div>
                  <p className="text-[14px] font-bold">{t.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{t.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-[460px] rounded-[32px] border border-border/70 bg-surface p-7 shadow-dialog sm:p-9">
          {children ?? <Outlet />}
        </section>
      </main>

      {showSos && <GuestSosModal onClose={() => setShowSos(false)} onSubmit={() => navigate("/patient/sos")} />}
    </div>
  );
}
