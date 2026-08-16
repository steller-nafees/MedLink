import { createFileRoute } from "@tanstack/react-router";
import { DriverShell, DriverHeader } from "@/components/medlink/driver-shell";
import { BigButton, StatusBadge } from "@/components/medlink/driver-ui";
import { useLang } from "@/lib/medlink/driver-i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Ambulance, Phone, Pencil, User, Check, X, ShieldCheck, LogOut } from "lucide-react";

export const Route = createFileRoute("/ambulance/profile")({
  head: () => ({
    meta: [
      { title: "Ambulance · Driver profile" },
      { name: "description", content: "Ambulance driver profile and vehicle information." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang } = useLang();
  const en = lang === "en";

  const [driverName, setDriverName] = useState(en ? "Abdul Karim" : "আবদুল করিম");
  const [driverPhone, setDriverPhone] = useState("01712-334455");
  const [editingDriver, setEditingDriver] = useState(false);

  const ambulance = {
    reg: "Dhaka Metro Cha 11-1111",
    type: en ? "ALS" : "এএলএস",
    typeLabel: en ? "Advanced Life Support" : "অ্যাডভান্সড লাইফ সাপোর্ট",
    provider: en ? "MedLink Ambulance Services" : "মেডলিংক অ্যাম্বুলেন্স সার্ভিস",
    status: "active" as const,
  };

  return (
    <DriverShell label="Ambulance · Profile" showLanguage={false}>
      <DriverHeader title={t("profile")} />

      {/* Profile header */}
      <section className="mx-5 rounded-[28px] border border-border/70 bg-surface p-6 text-center shadow-card">
        <div className="relative mx-auto inline-block">
          <div className="mx-auto grid size-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-glow text-[28px] font-extrabold text-primary-foreground shadow-float ring-4 ring-primary/10">
            <User className="size-10" strokeWidth={2.2} />
          </div>
          <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-success text-success-foreground shadow">
            <ShieldCheck className="size-4" strokeWidth={2.5} />
          </span>
        </div>

        <p className="mt-4 text-[22px] font-extrabold leading-tight">{driverName}</p>
        <a
          href={`tel:${driverPhone}`}
          className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary"
        >
          <Phone className="size-4" strokeWidth={2.3} />
          {driverPhone}
        </a>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setEditingDriver(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary-container px-5 text-[13.5px] font-bold text-primary transition active:scale-[0.98]"
          >
            <Pencil className="size-4" strokeWidth={2.4} />
            {t("editProfile")}
          </button>
        </div>
      </section>

      {/* Driver information */}
      <section className="mx-5 mt-5">
        <SectionTitle>{t("driverInfo")}</SectionTitle>
        <div className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-card">
          {editingDriver ? (
            <div className="space-y-4">
              <Field
                label={t("fullName")}
                value={driverName}
                onChange={setDriverName}
                placeholder={t("fullName")}
              />
              <Field
                label={t("phone")}
                value={driverPhone}
                onChange={setDriverPhone}
                placeholder={t("phone")}
                type="tel"
              />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingDriver(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-[14px] font-bold text-foreground transition active:scale-[0.98]"
                >
                  <X className="size-4" strokeWidth={2.4} /> {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDriver(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl gradient-primary text-[14px] font-bold text-primary-foreground shadow-float transition active:scale-[0.98]"
                >
                  <Check className="size-4" strokeWidth={2.4} /> {t("save")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <ReadOnlyRow label={t("fullName")} value={driverName} />
              <div className="my-3 h-px bg-border/60" />
              <ReadOnlyRow label={t("phone")} value={driverPhone} />
              <button
                type="button"
                onClick={() => setEditingDriver(true)}
                className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border/70 bg-surface text-[14px] font-bold text-foreground transition active:scale-[0.98]"
              >
                <Pencil className="size-4" strokeWidth={2.4} /> {t("editInformation")}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Ambulance information */}
      <section className="mx-5 mt-5 pb-5">
        <SectionTitle>{t("ambulanceInfo")}</SectionTitle>
        <div className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-card">
          {/* Registration plate */}
          <div className="mb-4 rounded-2xl border border-success/35 bg-success/5 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Ambulance className="size-6 shrink-0 text-success" strokeWidth={2.2} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-success/80">{t("vehicleRegistration")}</p>
                <p className="text-[17px] font-extrabold uppercase tracking-wide text-foreground">{ambulance.reg}</p>
              </div>
            </div>
          </div>

          <ReadOnlyRow label={t("ambulanceType")} value={`${ambulance.type} · ${ambulance.typeLabel}`} />
          <div className="my-3 h-px bg-border/60" />
          <ReadOnlyRow label={t("provider")} value={ambulance.provider} />
          <div className="my-3 h-px bg-border/60" />

          <div className="flex items-center justify-between py-1">
            <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{t("vehicleStatus")}</span>
            <StatusBadge tone="success" dot>
              {t("active")}
            </StatusBadge>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="mx-5 mt-2 pb-6">
        <BigButton icon={LogOut} variant="outline" to="/">
          {t("logout")}
        </BigButton>
      </section>
    </DriverShell>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2.5 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-[15.5px] font-bold leading-snug text-foreground">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-h-[52px] rounded-2xl border bg-surface px-4 text-[15.5px] font-bold text-foreground outline-none transition",
          "border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
        )}
      />
    </div>
  );
}
