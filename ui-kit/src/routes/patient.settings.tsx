import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PatientShell } from "@/components/medlink/patient-shell";
import { useAppSettings, type Appearance, type Lang } from "@/lib/medlink/app-settings";
import {
  Card,
  SectionTitle,
  SettingsListItem,
  SegmentedControl,
  ToggleSwitch,
} from "@/components/medlink/profile/profile-kit";
import { Bell, ChevronLeft, Globe, HelpCircle, LogOut, Palette, ShieldCheck, Wifi } from "lucide-react";
import { useNetworkOverride, type NetworkOverride } from "@/lib/medlink/offline-sync";

export const Route = createFileRoute("/patient/settings")({
  head: () => ({
    meta: [
      { title: "Settings · MedLink Patient" },
      { name: "description", content: "Manage language, appearance, notifications, privacy and support settings for your MedLink account." },
      { property: "og:title", content: "Settings · MedLink Patient" },
      { property: "og:description", content: "Language, appearance, notifications, privacy and support for MedLink." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { t, lang, setLang, appearance, setAppearance } = useAppSettings();
  const [notifOn, setNotifOn] = useState(true);
  const [network, setNetwork] = useNetworkOverride();

  return (
    <PatientShell label="Patient · Settings">
      <header className="flex items-center gap-3 px-5 pb-3 pt-4">
        <Link to="/patient" className="grid size-9 shrink-0 place-items-center rounded-full border border-border/60 bg-surface shadow-card">
          <ChevronLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">{t("settings")}</h1>
        </div>
      </header>

      <div className="space-y-7 px-4 pb-6">
        <section>
          <SectionTitle title={t("settings")} />
          <Card className="p-0">
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-center gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
                  <Globe className="size-[17px]" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold leading-tight">{t("language")}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{t("languageHint")}</p>
                </div>
              </div>
              <SegmentedControl<Lang>
                value={lang}
                onChange={setLang}
                options={[
                  { value: "en", label: "English" },
                  { value: "bn", label: "বাংলা" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border/50 px-5 py-4">
              <div className="flex items-center gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
                  <Palette className="size-[17px]" strokeWidth={2.3} />
                </span>
                <p className="flex-1 text-[14px] font-bold">{t("appearance")}</p>
              </div>
              <SegmentedControl<Appearance>
                value={appearance}
                onChange={setAppearance}
                options={[
                  { value: "light", label: t("light") },
                  { value: "dark", label: t("dark") },
                  { value: "system", label: t("system") },
                ]}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border/50 px-5 py-4">
              <div className="flex items-center gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
                  <Wifi className="size-[17px]" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold leading-tight">Emergency connectivity</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Force offline emergency mode to use synced resources only
                  </p>
                </div>
              </div>
              <SegmentedControl<NetworkOverride>
                value={network}
                onChange={setNetwork}
                options={[
                  { value: "auto", label: "Auto" },
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                ]}
              />
            </div>

            <div className="border-t border-border/50">
              <SettingsListItem icon={Bell} label={t("notifications")} right={<ToggleSwitch checked={notifOn} onChange={setNotifOn} label={t("notifications")} />} />
            </div>
            <div className="border-t border-border/50">
              <SettingsListItem icon={ShieldCheck} label={t("privacyPolicy")} />
            </div>
            <div className="border-t border-border/50">
              <SettingsListItem icon={HelpCircle} label={t("helpSupport")} />
            </div>
            <div className="border-t border-border/50">
              <SettingsListItem icon={LogOut} tone="emergency" label={t("logout")} />
            </div>
          </Card>
        </section>

        <p className="pb-2 text-center text-[10.5px] text-muted-foreground">MedLink · v2.4.0</p>
      </div>
    </PatientShell>
  );
}
