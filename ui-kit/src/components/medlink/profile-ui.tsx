import type { ComponentType, ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Check, Pencil, Trash2, GripVertical, Star } from "lucide-react";

/* ---------------- Section ---------------- */
export function Section({
  title,
  hint,
  action,
  children,
  flush = false,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="mt-7">
      {(title || action) && (
        <div className="mb-2.5 flex items-end justify-between gap-3 px-5">
          <div>
            {title && <p className="text-[13px] font-extrabold tracking-tight">{title}</p>}
            {hint && <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {flush ? (
        children
      ) : (
        <div className="mx-5 divide-y divide-border/60 overflow-hidden rounded-[26px] border border-border/60 bg-surface shadow-card">
          {children}
        </div>
      )}
    </section>
  );
}

type Tone = "default" | "primary" | "emergency" | "info" | "success" | "warning";

const toneCls: Record<Tone, string> = {
  default: "bg-surface-variant text-foreground/70",
  primary: "bg-primary-container text-primary",
  emergency: "bg-emergency/10 text-emergency",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

/* ---------------- Info / medical row ---------------- */
export function InfoRow({
  icon: Icon,
  label,
  value,
  tone = "default",
  editable = true,
  chips,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  tone?: Tone;
  editable?: boolean;
  chips?: string[];
}) {
  return (
    <div className="group flex items-start gap-3 p-4">
      <div className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl", toneCls[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        {value && <p className="mt-0.5 text-[13.5px] font-semibold leading-snug">{value}</p>}
        {chips && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-bold", toneCls[tone])}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
      {editable && (
        <button className="mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-surface-variant hover:text-foreground active:scale-90">
          <Pencil className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/* ---------------- Settings list item ---------------- */
export function SettingsItem({
  icon: Icon,
  label,
  hint,
  badge,
  tone = "default",
  to,
  onClick,
  right,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  badge?: string;
  tone?: Tone;
  to?: string;
  onClick?: () => void;
  right?: ReactNode;
}) {
  const inner = (
    <>
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneCls[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13.5px] font-semibold", tone === "emergency" && "text-emergency")}>{label}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {badge && (
        <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10.5px] font-bold text-primary">{badge}</span>
      )}
      {right ?? <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 p-4 text-left transition active:bg-surface-variant";
  if (to)
    return (
      <a href={to} className={cls}>
        {inner}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-6 rounded-full bg-surface shadow-card transition-all duration-300",
          checked ? "left-[25px]" : "left-[3px]"
        )}
      />
    </button>
  );
}

export function ToggleRow({
  icon: Icon,
  label,
  hint,
  tone = "default",
  defaultChecked = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  tone?: Tone;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center gap-3 p-4">
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneCls[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold">{label}</p>
        {hint && <p className="text-[11px] leading-tight text-muted-foreground">{hint}</p>}
      </div>
      <Toggle checked={on} onChange={setOn} />
    </div>
  );
}

/* ---------------- Emergency contact card ---------------- */
export function EmergencyContactCard({
  name,
  relation,
  phone,
  initials,
  accent = "primary",
  primaryContact = false,
}: {
  name: string;
  relation: string;
  phone: string;
  initials: string;
  accent?: Tone;
  primaryContact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-border/60 bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3.5">
        <div className={cn("grid size-14 shrink-0 place-items-center rounded-full text-[16px] font-extrabold", toneCls[accent])}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14.5px] font-bold">{name}</p>
            {primaryContact && (
              <span className="flex items-center gap-1 rounded-full bg-primary-container px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary">
                <Star className="size-2.5 fill-current" /> Primary
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-muted-foreground">{relation}</p>
          <p className="mt-0.5 text-[12.5px] font-semibold tabular-nums">{phone}</p>
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-surface-variant py-2.5 text-[12px] font-bold transition active:scale-95">
          <Pencil className="size-3.5" /> Edit
        </button>
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-emergency/10 py-2.5 text-[12px] font-bold text-emergency transition active:scale-95">
          <Trash2 className="size-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}

/* ---------------- Tier badge ---------------- */
export type Tier = "A" | "B" | "C";

export function TierBadge({ tier }: { tier: Tier }) {
  const map = {
    A: "bg-success/10 text-success",
    B: "bg-info/10 text-info",
    C: "bg-surface-variant text-muted-foreground",
  } as const;
  const dot = { A: "bg-success", B: "bg-info", C: "bg-muted-foreground" } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold", map[tier])}>
      <span className={cn("size-1.5 rounded-full", dot[tier])} /> Tier {tier}
    </span>
  );
}

/* ---------------- Selection card ---------------- */
export function SelectCard({
  title,
  description,
  meta,
  selected,
  onSelect,
  leading,
}: {
  title: string;
  description: string;
  meta?: string;
  selected: boolean;
  onSelect: () => void;
  leading?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-[24px] border p-4 text-left transition duration-200 active:scale-[0.99]",
        selected
          ? "border-primary/50 bg-primary-container/60 shadow-float"
          : "border-border/60 bg-surface shadow-card hover:border-primary/30"
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold leading-tight">{title}</p>
        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{description}</p>
        {meta && <p className="mt-1.5 text-[10.5px] font-semibold text-primary">{meta}</p>}
      </div>
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

/* ---------------- Chip ---------------- */
export function Chip({
  label,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-bold transition active:scale-95",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-float"
          : "border-border/70 bg-surface text-foreground/70"
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {label}
    </button>
  );
}

/* ---------------- Favorite hospital card ---------------- */
export function FavoriteHospitalCard({
  name,
  tier,
  type,
  index,
  onUp,
  onDown,
  onRemove,
}: {
  name: string;
  tier: Tier;
  type: string;
  index: number;
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-border/60 bg-surface p-3.5 shadow-card">
      <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
        <button onClick={onUp} aria-label="Move up" className="transition active:scale-90 disabled:opacity-30" disabled={!onUp}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 15l6-6 6 6" /></svg>
        </button>
        <GripVertical className="size-3.5 opacity-50" />
        <button onClick={onDown} aria-label="Move down" className="transition active:scale-90 disabled:opacity-30" disabled={!onDown}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl gradient-primary text-[14px] font-extrabold text-primary-foreground">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-surface-variant text-[9px] font-bold text-muted-foreground">{index + 1}</span>
          <p className="truncate text-[13.5px] font-bold">{name}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <TierBadge tier={tier} />
          <span className="text-[10.5px] text-muted-foreground">{type}</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove favorite"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-emergency/10 text-emergency transition active:scale-90"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
