import { createFileRoute } from "@tanstack/react-router";
import { DriverShell } from "@/components/medlink/driver-shell";
import { StylizedMap } from "@/components/medlink/stylized-map";
import { BigButton, StatusBadge } from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { Link } from "@tanstack/react-router";
import { Phone, Building2, X, Navigation } from "lucide-react";

export const Route = createFileRoute("/ambulance/navigate")({
  head: () => ({
    meta: [
      { title: "Ambulance · Navigation" },
      { name: "description", content: "Minimal turn-by-turn navigation view with large emergency actions." },
    ],
  }),
  component: NavigatePage,
});

function NavigatePage() {
  const { t, lang } = useLang();
  return (
    <DriverShell label="Ambulance · Navigation" showLanguage={false} hideNav>
      <div className="relative flex min-h-full flex-col">
        <StylizedMap
          className="h-[430px] rounded-none"
          markers={[
            { x: 40, y: 62, kind: "ambulance", label: lang === "en" ? "You" : "আপনি" },
            { x: 52, y: 70, kind: "patient", label: t("pickup") },
            { x: 42, y: 38, kind: "hospital", label: lang === "en" ? "Mercy" : "মার্সি" },
          ]}
          route={{ from: { x: 40, y: 62 }, to: { x: 42, y: 38 } }}
        />

        <div className="absolute inset-x-4 top-3 flex items-center justify-between">
          <Link to="/ambulance/trip" className="grid size-12 place-items-center rounded-2xl bg-surface/95 shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
          <StatusBadge tone="emergency" className="bg-emergency text-white">{t("critical")}</StatusBadge>
        </div>

        {/* Turn banner */}
        <div className="absolute inset-x-4 top-20 flex items-center gap-3 rounded-3xl bg-foreground/95 px-4 py-4 text-background shadow-dialog">
          <Navigation className="size-8 shrink-0" strokeWidth={2.6} />
          <div>
            <p className="text-[22px] font-extrabold leading-tight">400 m</p>
            <p className="text-[14px] opacity-80">{lang === "en" ? "Turn right onto Elmwood Ave" : "ডানে মোড় নিন এলমউড অ্যাভিনিউতে"}</p>
          </div>
        </div>

        <div className="-mt-8 flex-1 rounded-t-[32px] bg-background px-5 pt-5">
          <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
            <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">{t("destination")}</p>
            <p className="mt-1 text-[20px] font-extrabold leading-tight">
              {lang === "en" ? "St. Mercy Medical Center" : "সেন্ট মার্সি মেডিকেল সেন্টার"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl bg-primary-container py-3">
                <p className="text-[22px] font-extrabold text-primary">4 {t("minutes")}</p>
                <p className="text-[11.5px] font-semibold text-muted-foreground">{t("eta")}</p>
              </div>
              <div className="rounded-2xl bg-surface-variant py-3">
                <p className="text-[22px] font-extrabold">1.1 km</p>
                <p className="text-[11.5px] font-semibold text-muted-foreground">{t("distance")}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 pb-6">
            <div className="grid grid-cols-2 gap-2">
              <BigButton icon={Phone} variant="outline" href="tel:+8801712334455" className="text-[15px]">{t("callPatient")}</BigButton>
              <BigButton icon={Building2} variant="outline" href="tel:+8809611556677" className="text-[15px]">{t("callHospital")}</BigButton>
            </div>
            <BigButton icon={X} variant="emergency" to="/ambulance/trip">{t("endNavigation")}</BigButton>
          </div>
        </div>
      </div>
    </DriverShell>
  );
}
