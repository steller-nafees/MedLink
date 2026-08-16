import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DriverShell, DriverHeader } from "@/components/medlink/driver-shell";
import { BigButton, EmptyState, HospitalCard, InfoRow, StatusBadge, Timeline } from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { Phone, Navigation, MapPin, Flag, Ambulance, Building2, CheckCircle2, HeartPulse, Truck, StickyNote } from "lucide-react";

export const Route = createFileRoute("/ambulance/trip")({
  head: () => ({
    meta: [
      { title: "Ambulance · Active trip" },
      { name: "description", content: "Active emergency trip with large actions and a simple status timeline." },
    ],
  }),
  component: TripPage,
});

function TripPage() {
  const { t, lang } = useLang();
  const [step, setStep] = useState(1);
  const [active, setActive] = useState(true);

  const steps = [t("accepted"), t("navigating"), t("arrived"), t("patientPickedUp"), t("hospitalReached"), t("completed")];
  const nextLabels = [t("navigateBtn"), t("markArrived"), t("pickedUp"), t("atHospital"), t("complete"), t("complete")];
  const nextIcons = [Navigation, Flag, Ambulance, Building2, CheckCircle2, CheckCircle2];
  const NextIcon = nextIcons[Math.min(step, 5)];

  if (!active) {
    return (
      <DriverShell label="Ambulance · No trip">
        <DriverHeader title={t("trip")} />
        <div className="mx-4 mt-2">
          <EmptyState icon={Truck} title={t("noTrip")} subtitle={t("noTripSub")} action={<BigButton variant="outline" onClick={() => { setActive(true); setStep(1); }}>{t("accept")}</BigButton>} />
        </div>
      </DriverShell>
    );
  }

  return (
    <DriverShell label="Ambulance · Active trip">
      <DriverHeader
        title={lang === "en" ? "Emergency" : "জরুরি"}
        subtitle={lang === "en" ? "Trip #AM-2291" : "ট্রিপ #AM-2291"}
        right={<StatusBadge tone="emergency">{t("critical")}</StatusBadge>}
      />

      {/* Status card */}
      <section className="mx-4 rounded-2xl gradient-emergency px-4 py-3.5 text-white shadow-float">
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-85">{t("nextStep")}</p>
        <p className="mt-0.5 text-[16px] font-bold leading-snug">{steps[Math.min(step, steps.length - 1)]}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-white/20 py-2"><p className="text-[15px] font-bold">4 {t("minutes")}</p><p className="text-[10px] opacity-85">{t("eta")}</p></div>
          <div className="rounded-xl bg-white/20 py-2"><p className="text-[15px] font-bold">1.1 km</p><p className="text-[10px] opacity-85">{t("distance")}</p></div>
        </div>
      </section>

      {/* Patient / route info */}
      <section className="mx-4 mt-3 rounded-2xl border border-border/70 bg-surface px-3.5 shadow-card">
        <div className="divide-y divide-border/70">
          <InfoRow icon={HeartPulse} tone="emergency" label={t("patient")} value={lang === "en" ? "Eleanor Chen · 74" : "এলিনর চেন · ৭৪"} />
          <InfoRow icon={MapPin} tone="warning" label={t("pickup")} value={lang === "en" ? "412 Elmwood Ave" : "৪১২ এলমউড অ্যাভিনিউ"} />
          <InfoRow icon={Building2} tone="success" label={t("destination")} value={lang === "en" ? "St. Mercy Medical" : "সেন্ট মার্সি মেডিকেল"} />
          <InfoRow icon={Phone} tone="info" label={t("contact")} value="+880 1712-334455" />
        </div>
      </section>

      {/* Primary actions */}
      <section className="mx-4 mt-3 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <BigButton icon={Phone} variant="outline" href="tel:+8801712334455" className="min-h-[44px] text-[13px]">{t("callPatient")}</BigButton>
          <BigButton icon={Navigation} variant="primary" to="/ambulance/navigate" className="min-h-[44px] text-[13px]">{t("navigateBtn")}</BigButton>
        </div>
        <BigButton
          icon={NextIcon}
          variant={step >= steps.length - 1 ? "success" : "dark"}
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          className="min-h-[48px] text-[14px]"
        >
          {nextLabels[Math.min(step, nextLabels.length - 1)]}
        </BigButton>
      </section>

      {/* Emergency details */}
      <section className="mx-4 mt-4 rounded-2xl border border-border/70 bg-surface p-3.5 shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("emergencyDetails")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge tone="emergency" dot={false}>{lang === "en" ? "Cardiac Emergency" : "হৃদরোগ জরুরি"}</StatusBadge>
          <StatusBadge tone="warning" dot={false}>{t("severity")}: {t("critical")}</StatusBadge>
          <StatusBadge tone="info" dot={false}>{t("department")}: {lang === "en" ? "Cardiology" : "কার্ডিওলজি"}</StatusBadge>
        </div>
        <div className="mt-2.5 flex gap-2 rounded-xl bg-surface-variant p-2.5">
          <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[12px] leading-relaxed">
            {lang === "en"
              ? "Chest pain for 25 minutes. Aspirin given. Family present at pickup."
              : "২৫ মিনিট ধরে বুকে ব্যথা। অ্যাসপিরিন দেওয়া হয়েছে। পরিবার উপস্থিত।"}
          </p>
        </div>
      </section>

      {/* Hospital */}
      <section className="mx-4 mt-3">
        <HospitalCard
          name={lang === "en" ? "St. Mercy Medical Center" : "সেন্ট মার্সি মেডিকেল সেন্টার"}
          address={lang === "en" ? "412 Elmwood Ave · Downtown" : "৪১২ এলমউড অ্যাভিনিউ · ডাউনটাউন"}
          phone="+880 9611-556677"
          department={lang === "en" ? "Emergency · Cardiology" : "জরুরি · কার্ডিওলজি"}
          onNavigate="/ambulance/navigate"
        />
      </section>

      {/* Timeline */}
      <section className="mx-4 mt-4">
        <p className="mb-2 text-[13px] font-bold">{t("timeline")}</p>
        <Timeline steps={steps} current={step} />
      </section>
    </DriverShell>
  );
}