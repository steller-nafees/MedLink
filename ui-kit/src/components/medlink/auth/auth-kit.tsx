import { useRef, useState, type ReactNode, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { PhoneFrame } from "../phone-frame";
import { cn } from "@/lib/utils";
import { Moon, Sun, Siren, ArrowRight, Loader2, WifiOff, TriangleAlert, ChevronLeft, Check } from "lucide-react";

/* ---------------------------------- Shell --------------------------------- */

export function AuthScreen({
  children,
  label,
  scheme,
}: {
  children: ReactNode;
  label: string;
  scheme?: "light" | "dark";
}) {
  const [dark, setDark] = useState(scheme === "dark");
  return (
    <div className={cn("relative", dark && "dark")}>
      <div className="mx-auto mb-3 flex w-full max-w-[420px] justify-center">
        <button
          type="button"
          onClick={() => setDark((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-card transition hover:text-foreground"
        >
          {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          {dark ? "Dark mode" : "Light mode"}
        </button>
      </div>
      <PhoneFrame label={label}>{children}</PhoneFrame>
    </div>
  );
}

export function AuthHeader({ back, right }: { back?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pt-3">
      {back ? (
        <Link
          to={back}
          className="grid size-9 place-items-center rounded-full border border-border/70 bg-surface text-foreground shadow-card transition active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className="size-9" />
      )}
      {right}
    </div>
  );
}

/* --------------------------------- Buttons -------------------------------- */

export function PrimaryButton({
  children,
  to,
  search,
  onClick,
  disabled,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  to?: string;
  search?: { guest?: string };
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "emergency" | "success";
  className?: string;
}) {
  const cls = cn(
    "flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-semibold shadow-float transition duration-300 active:scale-[0.98] disabled:opacity-40",
    tone === "emergency"
      ? "gradient-emergency text-white"
      : tone === "success"
        ? "bg-success text-white"
        : "gradient-primary text-primary-foreground",
    className
  );
  if (to && !disabled) return <Link to={to} search={search} className={cls}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  to,
  onClick,
  className,
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = cn(
    "flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-4 text-[15px] font-semibold text-foreground shadow-card transition duration-300 active:scale-[0.98]",
    className
  );
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

export function SocialButton({ brand, onClick }: { brand: "Google" | "Apple"; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface py-3.5 text-[14px] font-semibold text-foreground shadow-card transition active:scale-[0.98]"
    >
      {brand === "Google" ? (
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.4 3.6v3h3.87c2.26-2.09 3.56-5.17 3.56-8.84Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.89l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.28a12 12 0 0 0 0 10.78l3.99-3.09Z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.16 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden>
          <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.4 1.2-2.5 0 0-2.3-.9-2.3-3.5Zm-2.3-6.4c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.7-1.3Z" />
        </svg>
      )}
      Continue with {brand}
    </button>
  );
}

/* ---------------------------------- Fields -------------------------------- */

export function AuthField({
  icon: Icon,
  label,
  placeholder,
  type = "text",
  defaultValue,
  trailing,
}: {
  icon?: ComponentType<{ className?: string }>;
  label?: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  trailing?: ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>}
      <span className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition focus-within:border-primary/50">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full flex-1 bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {trailing}
      </span>
    </label>
  );
}

export function OtpInput({ length = 5, value = "" }: { length?: number; value?: string }) {
  const [code, setCode] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        value={code}
        inputMode="numeric"
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, length))}
        className="absolute inset-0 z-10 w-full opacity-0"
        aria-label="Verification code"
      />
      <div className="flex justify-between gap-2.5">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "grid h-[58px] flex-1 place-items-center rounded-2xl border bg-surface text-[22px] font-bold shadow-card transition",
              code.length === i ? "border-primary ring-4 ring-primary/15" : "border-border"
            )}
          >
            {code[i] ?? <span className="text-muted-foreground/40">·</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Indicators ------------------------------- */

export function ProgressIndicator({ total, current, className }: { total: number; current: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i === current ? "w-7 bg-primary" : i < current ? "w-1.5 bg-primary/50" : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}

export function StepBar({ total, current, labels }: { total: number; current: number; labels?: string[] }) {
  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1">
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all duration-500",
                i <= current ? "bg-primary" : "bg-border"
              )}
            />
            {labels?.[i] && (
              <span className={cn("mt-1.5 block text-[10.5px] font-semibold", i <= current ? "text-primary" : "text-muted-foreground")}>
                {labels[i]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Hero cards ------------------------------- */

export function AuthHeroCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] gradient-primary px-6 py-7 text-primary-foreground shadow-float">
      <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15" />
      <span className="pointer-events-none absolute -bottom-16 -left-8 size-36 rounded-full bg-white/10" />
      <div className="relative">
        <div className="grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h3l2-6 4 12 2-6h7" />
          </svg>
        </div>
        <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed opacity-90">{subtitle}</p>
      </div>
    </div>
  );
}

export function EmergencySosCard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-emergency/20 bg-emergency/[0.06] p-5 shadow-card">
      <div className="flex items-start gap-3.5">
        <span className="relative grid size-12 shrink-0 place-items-center">
          <span className="absolute inset-0 rounded-full bg-emergency/20 sos-ring" />
          <span className="relative grid size-12 place-items-center rounded-2xl gradient-emergency text-white shadow-float">
            <Siren className="size-5" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">Emergency SOS</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            Need urgent medical assistance? Get immediate access to emergency support — no account required.
          </p>
        </div>
      </div>
      <Link
        to="/patient/sos"
        className="mt-4 flex items-center justify-center gap-2 rounded-full gradient-emergency py-3.5 text-[14.5px] font-semibold text-white shadow-float transition active:scale-[0.98]"
      >
        <Siren className="size-4" /> Emergency SOS <ArrowRight className="size-4" />
      </Link>
      <p className="mt-2.5 text-center text-[11px] text-muted-foreground">Available 24/7 · Works without login</p>
    </div>
  );
}

/* ------------------------------- Feedback UI ------------------------------ */

export function StatePanel({
  icon: Icon,
  tone = "primary",
  title,
  description,
  action,
  spinning,
}: {
  icon: ComponentType<{ className?: string }>;
  tone?: "primary" | "emergency" | "muted";
  title: string;
  description: string;
  action?: ReactNode;
  spinning?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-border/70 bg-surface px-6 py-8 text-center shadow-card">
      <span
        className={cn(
          "grid size-14 place-items-center rounded-2xl",
          tone === "emergency" ? "bg-emergency/10 text-emergency" : tone === "muted" ? "bg-surface-variant text-muted-foreground" : "bg-primary-container text-primary"
        )}
      >
        <Icon className={cn("size-6", spinning && "animate-spin")} />
      </span>
      <p className="mt-4 text-[16px] font-bold">{title}</p>
      <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-5 w-full">{action}</div>}
    </div>
  );
}

export const stateIcons = { Loader2, WifiOff, TriangleAlert, Check };

/* --------------------------------- Select --------------------------------- */

export function AuthSelect({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon?: ComponentType<{ className?: string }>;
  label?: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>}
      <span className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition focus-within:border-primary/50">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full flex-1 bg-transparent text-[14.5px] text-foreground outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
