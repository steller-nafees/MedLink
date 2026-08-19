import { createFileRoute } from "@tanstack/react-router";
import { DriverShell, DriverHeader } from "@/components/medlink/driver-shell";
import { NotificationCard } from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { Siren, Building2, UserX, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/ambulance/notifications")({
  head: () => ({
    meta: [
      { title: "Ambulance · Notifications" },
      { name: "description", content: "Driver notification center for requests, hospital changes and completed trips." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t, lang } = useLang();
  const en = lang === "en";
  const items = [
    { icon: Siren, tone: "emergency" as const, title: t("newRequest"), body: en ? "Cardiac emergency · 1.1 km away" : "হৃদরোগ জরুরি · ১.১ কিমি দূরে", time: en ? "Just now" : "এইমাত্র", unread: true },
    { icon: Building2, tone: "info" as const, title: t("nHospitalUpdated"), body: en ? "Destination changed to St. Mercy Medical" : "গন্তব্য পরিবর্তন: সেন্ট মার্সি মেডিকেল", time: en ? "12 min ago" : "১২ মিনিট আগে", unread: true },
    { icon: UserX, tone: "warning" as const, title: t("nCancelled"), body: en ? "Trip #AM-2288 cancelled by patient" : "ট্রিপ #AM-2288 রোগী বাতিল করেছে", time: en ? "1 hour ago" : "১ ঘণ্টা আগে" },
    { icon: CheckCircle2, tone: "success" as const, title: t("nCompleted"), body: en ? "Trip #AM-2287 · 14 min" : "ট্রিপ #AM-2287 · ১৪ মিনিট", time: en ? "3 hours ago" : "৩ ঘণ্টা আগে" },
  ];
  return (
    <DriverShell label="Ambulance · Notifications">
      <DriverHeader title={t("notifications")} subtitle={en ? "2 unread" : "২টি অপঠিত"} />
      <div className="space-y-3 px-5">
        {items.map((n) => (
          <NotificationCard key={n.title + n.time} {...n} />
        ))}
      </div>
    </DriverShell>
  );
}
