import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang, type Lang } from "@/lib/medlink/driver-i18n";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight } from "lucide-react";

/* ---------------- Language toggle ---------------- */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  const opts: { id: Lang; flag: string; label: string }[] = [
    { id: "en", flag: "🇬🇧", label: "English" },
    { id: "bn", flag: "🇧🇩", label: "বাংলা" },
  ];
  return (
    <div className={cn("relative flex items-center rounded-full border border-border/70 bg-surface p-1 shadow-card", className)}>
      <span
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full gradient-primary transition-transform duration-300 ease-out"
        style={{ transform: lang === "en" ? "translateX(0)" : "translateX(calc(100% + 8px))" }}
      />
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={cn(
            "relative z-10 flex min-w-[86px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition",
            lang === o.id ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <span className="text-[14px]">{o.flag}</span> {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Status badge ---------------- */
export type Tone = "success" | "warning" | "emergency" | "info" | "muted";

const toneMap: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  emergency: "bg-emergency/10 text-emergency",
  info: "bg-info/10 text-info",
  muted: "bg-surface-variant text-muted-foreground",
};

export function StatusBadge({ tone = "muted", children, dot = true, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-bold", toneMap[tone], className)}>
      {dot && <span className={cn("size-2 rounded-full", tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "emergency" ? "bg-emergency animate-pulse" : "bg-current")} />}
      {children}
    </span>
  );
}

/* ---------------- Big button ---------------- */
export function BigButton({
  icon: Icon,
  children,
  variant = "primary",
  onClick,
  to,
  href,
  className,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  variant?: "primary" | "emergency" | "outline" | "success" | "dark";
  onClick?: () => void;
  to?: string;
  href?: string;
  className?: string;
}) {
  const base =
    "flex w-full min-h-[60px] items-center justify-center gap-3 rounded-3xl px-5 text-[17px] font-extrabold tracking-tight transition active:scale-[0.98]";
  const variants = {
    primary: "gradient-primary text-primary-foreground shadow-float",
    emergency: "gradient-emergency text-white shadow-float",
    outline: "border-2 border-border bg-surface text-foreground shadow-card",
    success: "bg-success text-white shadow-card",
    dark: "bg-foreground text-background shadow-card",
  } as const;
  const content = (
    <>
      {Icon && <Icon className="size-6 shrink-0" strokeWidth={2.4} />}
      <span>{children}</span>
    </>
  );
  const cls = cn(base, variants[variant], className);
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  if (href) return <a href={href} className={cls}>{content}</a>;
  return <button type="button" onClick={onClick} className={cls}>{content}</button>;
}

/* ---------------- Info row ---------------- */
export function InfoRow({ icon: Icon, label, value, tone = "muted" }: { icon: LucideIcon; label: string; value: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
        <Icon className="size-5" strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-[16px] font-bold">{value}</p>
      </div>
    </div>
  );
}

/* ---------------- Timeline ---------------- */
export function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="relative space-y-1">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold",
                  done ? "bg-primary text-primary-foreground" : active ? "bg-primary/15 text-primary ring-4 ring-primary/10" : "bg-surface-variant text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4.5" strokeWidth={3} /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className={cn("w-1 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />}
            </div>
            <div className={cn("mb-2 flex-1 rounded-2xl px-4 py-3", active ? "bg-primary/8 border-2 border-primary" : "bg-surface border border-border/70")}>
              <p className={cn("text-[15.5px]", done || active ? "font-bold" : "font-semibold text-muted-foreground")}>{s}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Notification card ---------------- */
export function NotificationCard({ icon: Icon, tone, title, body, time, unread }: { icon: LucideIcon; tone: Tone; title: string; body: string; time: string; unread?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-3xl border bg-surface p-4 shadow-card", unread ? "border-primary/40" : "border-border/70")}>
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
        <Icon className="size-5.5" strokeWidth={2.3} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-bold">{title}</p>
          {unread && <span className="size-2 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{body}</p>
        <p className="mt-1.5 text-[12px] font-semibold text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

/* ---------------- Hospital card ---------------- */
export function HospitalCard({ name, address, phone, department, onNavigate }: { name: string; address: string; phone: string; department: string; onNavigate?: string }) {
  const { t } = useLang();
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
      <p className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">{t("hospitalInfo")}</p>
      <p className="mt-1 text-[18px] font-extrabold leading-tight">{name}</p>
      <p className="mt-1 text-[13.5px] text-muted-foreground">{address}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge tone="info" dot={false}>{department}</StatusBadge>
        <StatusBadge tone="muted" dot={false}>{phone}</StatusBadge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <BigButton icon={undefined} variant="outline" href={`tel:${phone}`} className="text-[15px]">{t("callHospital")}</BigButton>
        <BigButton variant="primary" to={onNavigate} className="text-[15px]">{t("navigateBtn")}</BigButton>
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon: Icon, title, subtitle, action, tone = "muted" }: { icon: LucideIcon; title: string; subtitle?: string; action?: ReactNode; tone?: Tone }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <span className={cn("grid size-20 place-items-center rounded-full", toneMap[tone])}>
        <Icon className="size-9" strokeWidth={2} />
      </span>
      <p className="mt-4 text-[18px] font-extrabold">{title}</p>
      {subtitle && <p className="mt-1 max-w-[260px] text-[14px] leading-relaxed text-muted-foreground">{subtitle}</p>}
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}

/* ---------------- Settings row ---------------- */
export function SettingRow({ icon: Icon, label, value, right }: { icon: LucideIcon; label: string; value?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary-container text-primary"><Icon className="size-5" strokeWidth={2.3} /></span>
      <p className="flex-1 text-[15.5px] font-bold">{label}</p>
      {right ?? (
        <span className="flex items-center gap-1 text-[14px] font-semibold text-muted-foreground">
          {value}
          <ChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}
