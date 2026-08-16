import { createFileRoute } from "@tanstack/react-router";
import { DriverShell, DriverHeader } from "@/components/medlink/driver-shell";
import { StatusBadge } from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { HeartPulse, Wind, Bandage, Clock, Building2 } from "lucide-react";

export const Route = createFileRoute("/ambulance/history")({
  head: () => ({
    meta: [
      { title: "Ambulance · Trip history" },
      { name: "description", content: "Simple trip history cards with date, type, hospital, duration and status." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, lang } = useLang();
  const en = lang === "en";
  const trips = [
    { icon: HeartPulse, tone: "emergency" as const, date: en ? "Today · 10:14 AM" : "আজ · সকাল ১০:১৪", type: en ? "Cardiac Emergency" : "হৃদরোগ জরুরি", hospital: en ? "St. Mercy Medical" : "সেন্ট মার্সি মেডিকেল", dur: en ? "12 min" : "১২ মিনিট" },
    { icon: Wind, tone: "warning" as const, date: en ? "Today · 08:22 AM" : "আজ · সকাল ০৮:২২", type: en ? "Respiratory" : "শ্বাসকষ্ট", hospital: en ? "Northshore Regional" : "নর্থশোর রিজিওনাল", dur: en ? "9 min" : "৯ মিনিট" },
    { icon: Bandage, tone: "info" as const, date: en ? "Yesterday · 07:12 PM" : "গতকাল · সন্ধ্যা ০৭:১২", type: en ? "Laceration" : "কাটা ক্ষত", hospital: en ? "City General" : "সিটি জেনারেল", dur: en ? "18 min" : "১৮ মিনিট" },
  ];
  return (
    <DriverShell label="Ambulance · History">
      <DriverHeader title={t("tripHistory")} subtitle={en ? "32 trips this week" : "এই সপ্তাহে ৩২টি ট্রিপ"} />
      <div className="space-y-3 px-5">
        {trips.map((tr) => {
          const Icon = tr.icon;
          return (
            <div key={tr.date} className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tr.tone === "emergency" ? "bg-emergency/10 text-emergency" : tr.tone === "warning" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"}`}>
                  <Icon className="size-6" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-extrabold leading-tight">{tr.type}</p>
                  <p className="text-[13px] font-medium text-muted-foreground">{tr.date}</p>
                </div>
                <StatusBadge tone="success" dot={false}>{t("completed")}</StatusBadge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-surface-variant px-3 py-2.5">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <p className="truncate text-[13.5px] font-bold">{tr.hospital}</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-surface-variant px-3 py-2.5">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <p className="text-[13.5px] font-bold">{tr.dur}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DriverShell>
  );
}
