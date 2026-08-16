import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PhoneFrame } from "./phone-frame";
import { LanguageToggle } from "./driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { cn } from "@/lib/utils";
import { Home, Truck, Bell, Clock, User } from "lucide-react";

// Trip sits in the middle slot on purpose — it's the primary action for a driver.
const tabs = [
  { to: "/ambulance", key: "home", icon: Home, match: (p: string) => p === "/ambulance", center: false },
  { to: "/ambulance/notifications", key: "alerts", icon: Bell, match: (p: string) => p.startsWith("/ambulance/notifications"), center: false },
  { to: "/ambulance/trip", key: "trip", icon: Truck, match: (p: string) => p.startsWith("/ambulance/trip") || p.startsWith("/ambulance/navigate"), center: true },
  { to: "/ambulance/history", key: "history", icon: Clock, match: (p: string) => p.startsWith("/ambulance/history"), center: false },
  { to: "/ambulance/profile", key: "profile", icon: User, match: (p: string) => p.startsWith("/ambulance/profile"), center: false },
] as const;

export function DriverShell({
  children,
  label = "Ambulance · Driver",
  showLanguage = true,
  hideNav = false,
}: {
  children: ReactNode;
  label?: string;
  showLanguage?: boolean;
  hideNav?: boolean;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLang();
  return (
    <PhoneFrame label={label}>
      <div className="relative flex min-h-full flex-col">
        {showLanguage && (
          <div className="sticky top-0 z-30 flex justify-center bg-background/85 px-4 pb-3 pt-2 backdrop-blur-xl">
            <LanguageToggle />
          </div>
        )}
        <div className="flex-1 pb-4">{children}</div>
        {!hideNav && (
          <nav
            className="sticky bottom-4 z-20 mx-4 mt-2 flex items-end justify-between gap-0.5 overflow-visible rounded-[28px] border-2 border-[#16A89C]/60 px-2 pb-2 pt-3 shadow-[0_12px_28px_rgba(23,37,47,0.10)] backdrop-blur-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
          >
            {tabs.map((tab) => {
              const active = tab.match(path);
              const Icon = tab.icon;

              if ("center" in tab && tab.center) {
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className="relative flex flex-1 flex-col items-center justify-center"
                  >
                    <span
                      className={cn(
                        "grid size-[52px] -translate-y-6 place-items-center rounded-full shadow-[0_10px_22px_rgba(22,168,156,0.4)] ring-[5px] transition-colors duration-200",
                        active ? "bg-white ring-[#16A89C]" : "bg-[#16A89C] ring-white"
                      )}
                    >
                      <Icon
                        className="size-[22px] transition-colors duration-200"
                        strokeWidth={2.3}
                        color={active ? "#16A89C" : "#FFFFFF"}
                      />
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={tab.to}
                  to={tab.to}
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
                    {t(tab.key)}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </PhoneFrame>
  );
}

export function DriverHeader({ title, subtitle, right, back }: { title: string; subtitle?: string; right?: ReactNode; back?: string }) {
  return (
    <header className="flex items-start gap-2.5 px-4 pb-2.5 pt-2">
      {back && (
        <Link to={back} className="grid size-9 shrink-0 place-items-center rounded-xl border border-border/70 bg-surface shadow-card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[19px] font-extrabold leading-tight tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 pt-0.5">{right}</div>}
    </header>
  );
}