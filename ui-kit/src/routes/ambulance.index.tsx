import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DriverShell, DriverHeader } from "@/components/medlink/driver-shell";
import {
  BigButton,
  EmptyState,
  InfoRow,
  StatusBadge,
} from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { cn } from "@/lib/utils";
import {
  Ambulance,
  Bell,
  HeartPulse,
  MapPin,
  Building2,
  Phone,
  Power,
  Check,
  X,
  Inbox,
  WifiOff,
  Navigation,
  Clock3,
} from "lucide-react";

export const Route = createFileRoute("/ambulance/")({
  head: () => ({
    meta: [
      { title: "Ambulance · Dashboard" },
      {
        name: "description",
        content:
          "Driver dashboard with online toggle and incoming emergency requests.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useLang();

  const [online, setOnline] = useState(true);
  const [request, setRequest] = useState(true);

  // Temporary sample data.
  // Replace these values with live GPS data from the driver app later.
  const lastLocation = {
    address:
      lang === "en"
        ? "Bashundhara Residential Area, Dhaka"
        : "বসুন্ধরা আবাসিক এলাকা, ঢাকা",
    updated:
      lang === "en"
        ? "Updated 12 seconds ago"
        : "১২ সেকেন্ড আগে আপডেট হয়েছে",
  };

  const driverName = lang === "en" ? "Rahim Uddin" : "রহিম উদ্দিন";

  const shiftText =
    lang === "en"
      ? "Day shift · 07:00 – 19:00"
      : "দিনের শিফট · ০৭:০০ – ১৯:০০";

  return (
    <DriverShell label="Ambulance · Dashboard">
      <DriverHeader
        title={driverName}
        subtitle={`${t("ambulanceId")} · DHA-AMB-1247`}
        right={
          <Link
            to="/ambulance/notifications"
            className="relative grid size-12 place-items-center rounded-2xl border border-border/70 bg-surface shadow-card"
          >
            <Bell className="size-5" strokeWidth={2.3} />
            <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-emergency ring-2 ring-surface" />
          </Link>
        }
      />

      {/* Online / offline */}
      <section className="mx-5">
        <button
          type="button"
          onClick={() => setOnline((value) => !value)}
          className={cn(
            "flex w-full items-center gap-4 rounded-[28px] p-5 text-left transition active:scale-[0.99]",
            online
              ? "gradient-primary text-primary-foreground shadow-float"
              : "border-2 border-border bg-surface shadow-card"
          )}
        >
          <span
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-full",
              online ? "bg-white/20" : "bg-surface-variant text-muted-foreground"
            )}
          >
            <Power className="size-7" strokeWidth={2.6} />
          </span>

          <span className="flex-1">
            <span className="block text-[20px] font-extrabold leading-tight">
              {online ? t("youAreOnline") : t("youAreOffline")}
            </span>

            <span
              className={cn(
                "block text-[13.5px] font-medium",
                online ? "opacity-85" : "text-muted-foreground"
              )}
            >
              {online ? t("tapToGoOffline") : t("tapToGoOnline")}
            </span>
          </span>

          <span
            className={cn(
              "h-9 w-16 shrink-0 rounded-full p-1 transition",
              online ? "bg-white/30" : "bg-border"
            )}
          >
            <span
              className={cn(
                "block size-7 rounded-full bg-white shadow transition-transform",
                online && "translate-x-7"
              )}
            />
          </span>
        </button>

        {/* Shift status */}
        <div className="mt-3 flex items-center justify-between rounded-3xl border border-border/70 bg-surface px-4 py-3 shadow-card">
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("shift")}
            </p>
            <p className="text-[14.5px] font-bold">{shiftText}</p>
          </div>

          <StatusBadge tone={online ? "success" : "muted"}>
            {online ? t("available") : t("offline")}
          </StatusBadge>
        </div>

        {/* Last location */}
        <div
          className={cn(
            "mt-3 overflow-hidden rounded-3xl border bg-surface shadow-card transition",
            online ? "border-primary/25" : "border-border/70 opacity-70"
          )}
        >
          <div className="flex items-start gap-3 p-4">
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl",
                online ? "bg-primary/10 text-primary" : "bg-surface-variant text-muted-foreground"
              )}
            >
              <Navigation className="size-6" strokeWidth={2.4} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
                  {lang === "en" ? "Last Location" : "সর্বশেষ অবস্থান"}
                </p>

                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 text-[11px] font-bold",
                    online ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      online ? "animate-pulse bg-primary" : "bg-muted-foreground"
                    )}
                  />
                  {online
                    ? lang === "en"
                      ? "LIVE"
                      : "লাইভ"
                    : lang === "en"
                      ? "OFFLINE"
                      : "অফলাইন"}
                </span>
              </div>

              <p className="mt-1 truncate text-[15px] font-extrabold">
                {lastLocation.address}
              </p>




              <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground">
                <Clock3 className="size-3.5" />
                <span>
                  {online
                    ? lastLocation.updated
                    : lang === "en"
                      ? "Location sharing is paused"
                      : "লোকেশন শেয়ারিং বন্ধ আছে"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver statistics */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { v: "7", l: t("tripsToday") },
            { v: `6 ${t("minutes")}`, l: t("avgResponse") },
            { v: "4.9", l: t("rating") },
          ].map((stat) => (
            <div
              key={stat.l}
              className="rounded-3xl border border-border/70 bg-surface px-2 py-3 text-center shadow-card"
            >
              <p className="text-[20px] font-extrabold leading-none">{stat.v}</p>
              <p className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground">
                {stat.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency request */}
      <section className="mx-5 mt-5">
        {!online ? (
          <EmptyState
            icon={WifiOff}
            tone="muted"
            title={t("offlineTitle")}
            subtitle={t("offlineSub")}
            action={
              <BigButton icon={Power} onClick={() => setOnline(true)}>
                {t("online")}
              </BigButton>
            }
          />
        ) : request ? (
          <div className="overflow-hidden rounded-[28px] border-2 border-emergency/40 bg-surface shadow-float soft-in">
            <div className="flex items-center justify-between gradient-emergency px-5 py-3 text-white">
              <p className="flex items-center gap-2 text-[14px] font-extrabold">
                <span className="size-2.5 animate-pulse rounded-full bg-white" />
                {t("newRequest")}
              </p>

              <span className="rounded-full bg-white/25 px-2.5 py-1 text-[11.5px] font-extrabold uppercase">
                {t("critical")}
              </span>
            </div>

            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-emergency/10 text-emergency">
                  <HeartPulse className="size-7" strokeWidth={2.4} />
                </span>

                <div>
                  <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("emergencyType")}
                  </p>
                  <p className="text-[20px] font-extrabold leading-tight">
                    {lang === "en" ? "Cardiac Emergency" : "হৃদরোগ জরুরি"}
                  </p>
                </div>
              </div>

              <div className="mt-2 divide-y divide-border/70">
                <InfoRow
                  icon={Ambulance}
                  tone="info"
                  label={t("patient")}
                  value={lang === "en" ? "Eleanor Chen · 74" : "এলিনর চেন · ৭৪"}
                />

                <InfoRow
                  icon={MapPin}
                  tone="warning"
                  label={t("pickup")}
                  value={lang === "en" ? "412 Elmwood Ave" : "৪১২ এলমউড অ্যাভিনিউ"}
                />

                <InfoRow
                  icon={Building2}
                  tone="success"
                  label={t("destination")}
                  value={lang === "en" ? "St. Mercy Medical" : "সেন্ট মার্সি মেডিকেল"}
                />

                <InfoRow
                  icon={Phone}
                  tone="muted"
                  label={t("contact")}
                  value="+880 1712-334455"
                />
              </div>

              <div className="mt-4 space-y-2">
                <BigButton icon={Check} variant="emergency" to="/ambulance/trip">
                  {t("accept")}
                </BigButton>

                <BigButton
                  icon={X}
                  variant="outline"
                  onClick={() => setRequest(false)}
                >
                  {t("reject")}
                </BigButton>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={t("noRequests")}
            subtitle={t("noRequestsSub")}
            action={
              <BigButton variant="outline" onClick={() => setRequest(true)}>
                {t("newRequest")}
              </BigButton>
            }
          />
        )}
      </section>
    </DriverShell>
  );
}