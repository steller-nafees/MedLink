import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { PhoneFrame } from "./phone-frame";
import { cn } from "@/lib/utils";
import { Home, Building2, ClipboardList, User, Bot, Siren, Plus, X } from "lucide-react";

const leftTabs = [
  { to: "/patient", label: "Home", icon: Home, match: (p: string) => p === "/patient" },
  { to: "/patient/activity", label: "Activity", icon: ClipboardList, match: (p: string) => p.startsWith("/patient/activity") },
] as const;

const rightTabs = [
  { to: "/patient/hospitals", label: "Hospitals", icon: Building2, match: (p: string) => p.startsWith("/patient/hospitals") },
  { to: "/patient/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/patient/profile") },
] as const;

export function PatientShell({ children, hideNav = false, label = "Patient · iOS" }: { children: ReactNode; hideNav?: boolean; hideSos?: boolean; label?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const Tab = ({ t }: { t: { to: string; label: string; icon: typeof Home; match: (p: string) => boolean } }) => {
    const active = t.match(path);
    const Icon = t.icon;
    return (
      <Link
        to={t.to}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1"
      >
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full transition-all duration-200",
            active && "bg-[#16A89C]"
          )}
        >
          <Icon
            className="size-[18px] transition-all duration-200"
            strokeWidth={active ? 2.1 : 2}
            color={active ? "#FFFFFF" : "#16A89C"}
            fill={active ? "#16A89C" : "none"}
          />
        </span>
        <span
          className={cn(
            "truncate text-[10px] leading-none transition-colors duration-200",
            active ? "font-bold text-[#16A89C]" : "font-medium text-[#16A89C]"
          )}
        >
          {t.label}
        </span>
      </Link>
    );
  };

  return (
    <PhoneFrame label={label}>
      <div className="relative flex min-h-full flex-col">
        <div className={cn("flex-1", hideNav ? "pb-4" : "pb-32")}>{children}</div>

        {!hideNav && (
          <div className="pointer-events-none sticky bottom-0 z-30 px-4 pb-5">
            {/* backdrop — tap outside to close */}
            {open && (
              <div
                onClick={() => setOpen(false)}
                className="pointer-events-auto fixed inset-0 z-0 bg-black/5"
                style={{ backdropFilter: "blur(1px)" }}
              />
            )}

            {/* radial fan — AI + SOS expand out from the center button, mirrored around dead center */}
            <div className="pointer-events-none relative z-20 mx-auto h-0 w-0">
              <Link
                to="/patient/ai"
                onClick={() => setOpen(false)}
                aria-label="AI Medical Assistant"
                className="pointer-events-auto absolute left-1/2 top-0 flex flex-col items-center gap-1 transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  transform: open
                    ? "translate(calc(-50% - 92px), -104px) scale(1)"
                    : "translate(-50%, -30px) scale(0.3)",
                  opacity: open ? 1 : 0,
                  transitionDuration: "320ms",
                  transitionDelay: open ? "40ms" : "0ms",
                  pointerEvents: open ? "auto" : "none",
                }}
              >
                <span className="grid size-14 place-items-center rounded-full bg-[#16A89C] shadow-[0_10px_22px_rgba(22,168,156,0.4)] ring-[5px] ring-white">
                  <Bot className="size-6" color="#FFFFFF" strokeWidth={2.2} />
                </span>
                <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-[#16A89C] shadow-card">
                  MedLInk AI
                </span>
              </Link>

              <Link
                to="/patient/sos"
                onClick={() => setOpen(false)}
                aria-label="Emergency SOS"
                className="pointer-events-auto absolute left-1/2 top-0 flex flex-col items-center gap-1 transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  transform: open
                    ? "translate(calc(-50% + 92px), -104px) scale(1)"
                    : "translate(-50%, -30px) scale(0.3)",
                  opacity: open ? 1 : 0,
                  transitionDuration: "320ms",
                  transitionDelay: open ? "90ms" : "0ms",
                  pointerEvents: open ? "auto" : "none",
                }}
>
                <span className="grid size-14 place-items-center rounded-full bg-[#D64545] shadow-[0_10px_22px_rgba(214,69,69,0.4)] ring-[5px] ring-white">
                  <Siren className="size-6" color="#FFFFFF" strokeWidth={2.2} />
                </span>
                <span className="whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10.5px] font-bold text-[#D64545] shadow-card">
                  Emergency SOS
                </span>
              </Link>
            </div>

            <nav
              className="pointer-events-auto relative z-10 flex items-end justify-between gap-0.5 overflow-visible rounded-[28px] border-2 border-[#16A89C]/60 px-2 pb-2 pt-3 shadow-[0_12px_28px_rgba(23,37,47,0.10)] backdrop-blur-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
            >
              {leftTabs.map((t) => <Tab key={t.to} t={t} />)}

              <div className="relative flex flex-1 flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Get help"
                  aria-expanded={open}
                  className={cn(
                    "grid size-[52px] -translate-y-6 place-items-center rounded-full shadow-[0_10px_22px_rgba(22,168,156,0.4)] ring-[5px] transition-all duration-300",
                    open ? "bg-white ring-[#16A89C] rotate-45" : "bg-[#16A89C] ring-white"
                  )}
                >
                  {open ? (
                    <X className="size-6 -rotate-45" color="#16A89C" strokeWidth={2.4} />
                  ) : (
                    <Plus className="size-7" color="#FFFFFF" strokeWidth={2.6} />
                  )}
                </button>
              </div>

              {rightTabs.map((t) => <Tab key={t.to} t={t} />)}
            </nav>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

export function ScreenHeader({ title, subtitle, right, back }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 pt-3 pb-4">
      <div className="flex items-center gap-3">
        {back && (
          <Link to="/patient" className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
        )}
        <div>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </header>
  );
}