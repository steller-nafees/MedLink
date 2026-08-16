import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Pencil, Plus, Phone, Trash2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[28px] border border-border/50 bg-surface p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3 px-1.5">
      <div className="min-w-0">
        <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground/80">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "h-[30px] w-[52px] shrink-0 rounded-full p-[3px] transition-colors duration-300",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span
        className={cn(
          "block size-6 rounded-full bg-surface shadow-card transition-transform duration-300",
          checked && "translate-x-[22px]"
        )}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="relative flex rounded-full bg-surface-variant p-1">
      <span
        className="absolute inset-y-1 rounded-full bg-surface shadow-card transition-all duration-300 ease-out"
        style={{ width: `calc((100% - 8px) / ${options.length})`, left: `calc(4px + ${index} * (100% - 8px) / ${options.length})` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-10 flex-1 rounded-full px-2 py-2 text-[12px] font-bold transition-colors",
            o.value === value ? "text-primary" : "text-muted-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-variant px-3 py-1.5 text-[12.5px] font-semibold text-foreground/85">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="text-muted-foreground transition hover:text-emergency">
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Profile header                                                      */
/* ------------------------------------------------------------------ */

export function ProfileHeader({
  name,
  email,
  phone,
  initials,
  editLabel,
  onEdit,
}: {
  name: string;
  email: string;
  phone: string;
  initials: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-7 text-center">
      <div className="grid size-[86px] place-items-center rounded-full bg-primary-container text-[26px] font-extrabold text-primary">
        {initials}
      </div>
      <div className="space-y-0.5">
        <p className="text-[21px] font-extrabold leading-tight tracking-tight">{name}</p>
        <p className="text-[13px] text-muted-foreground">{email}</p>
        <p className="text-[13px] text-muted-foreground">{phone}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-float transition active:scale-95"
      >
        <Pencil className="size-3.5" /> {editLabel}
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Information card (editable fields)                                  */
/* ------------------------------------------------------------------ */

export type InfoField = { key: string; label: string; value: string };

export function InformationCard({
  fields,
  onChange,
  editLabel,
  saveLabel,
  cancelLabel,
}: {
  fields: InfoField[];
  onChange: (key: string, value: string) => void;
  editLabel: string;
  saveLabel: string;
  cancelLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const start = () => {
    setDraft(Object.fromEntries(fields.map((f) => [f.key, f.value])));
    setEditing(true);
  };
  const save = () => {
    fields.forEach((f) => {
      if (draft[f.key] !== undefined && draft[f.key] !== f.value) onChange(f.key, draft[f.key]);
    });
    setEditing(false);
  };

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <span className="text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
          {editing ? editLabel : ""}
        </span>
        {editing ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="rounded-full px-3 py-1.5 text-[12px] font-bold text-muted-foreground">
              {cancelLabel}
            </button>
            <button type="button" onClick={save} className="rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-bold text-primary-foreground">
              {saveLabel}
            </button>
          </div>
        ) : (
          <button type="button" onClick={start} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-[12px] font-bold text-primary">
            <Pencil className="size-3" /> {editLabel}
          </button>
        )}
      </div>
      <div className="divide-y divide-border/50 px-5 pb-2">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-4 py-3.5">
            <p className="w-[38%] shrink-0 text-[12.5px] font-semibold text-muted-foreground">{f.label}</p>
            {editing ? (
              <input
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="min-w-0 flex-1 rounded-xl bg-surface-variant px-3 py-2 text-[13.5px] font-semibold outline-none ring-primary/40 focus:ring-2"
              />
            ) : (
              <p className="min-w-0 flex-1 text-right text-[13.5px] font-bold leading-snug">{f.value}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Medical information card                                            */
/* ------------------------------------------------------------------ */

export function MedicalInformationCard({
  icon: Icon,
  title,
  tone = "primary",
  items,
  emptyLabel,
  addLabel,
  onAdd,
  onRemove,
}: {
  icon: LucideIcon;
  title: string;
  tone?: "primary" | "emergency" | "warning" | "info";
  items: string[];
  emptyLabel: string;
  addLabel: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const toneMap = {
    primary: "bg-primary-container text-primary",
    emergency: "bg-emergency/10 text-emergency",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  } as const;

  const submit = () => {
    const v = text.trim();
    if (v) onAdd(v);
    setText("");
    setAdding(false);
  };

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneMap[tone])}>
          <Icon className="size-[18px]" strokeWidth={2.3} />
        </span>
        <p className="flex-1 text-[15px] font-extrabold">{title}</p>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          aria-label={addLabel}
          className="grid size-8 place-items-center rounded-full bg-surface-variant text-muted-foreground transition active:scale-90"
        >
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
        </button>
      </div>

      {adding && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={title}
            className="min-w-0 flex-1 rounded-xl bg-surface-variant px-3 py-2 text-[13px] font-semibold outline-none ring-primary/40 focus:ring-2"
          />
          <button type="button" onClick={submit} className="rounded-xl bg-primary px-3.5 text-[12.5px] font-bold text-primary-foreground">
            {addLabel}
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {items.length === 0 && <p className="text-[12.5px] text-muted-foreground">{emptyLabel}</p>}
        {items.map((i) => (
          <Chip key={i} label={i} onRemove={() => onRemove(i)} />
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Emergency contact card                                              */
/* ------------------------------------------------------------------ */

export type Contact = { id: string; name: string; relation: string; phone: string };

export function EmergencyContactCard({
  contact,
  onEdit,
  onRemove,
}: {
  contact: Contact;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const initials = contact.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <Card className="flex items-center gap-3.5 py-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-container text-[13px] font-extrabold text-primary">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-extrabold leading-tight">{contact.name}</p>
        <p className="text-[11.5px] font-semibold text-muted-foreground">{contact.relation}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-primary">
          <Phone className="size-3" /> {contact.phone}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <button type="button" onClick={onEdit} aria-label="Edit contact" className="grid size-8 place-items-center rounded-full bg-surface-variant text-muted-foreground transition active:scale-90">
          <Pencil className="size-3.5" />
        </button>
        <button type="button" onClick={onRemove} aria-label="Remove contact" className="grid size-8 place-items-center rounded-full bg-emergency/10 text-emergency transition active:scale-90">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </Card>
  );
}

export function ContactEditor({
  value,
  labels,
  onSave,
  onCancel,
}: {
  value: Contact;
  labels: { name: string; relation: string; phone: string; save: string; cancel: string };
  onSave: (c: Contact) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const field = (key: "name" | "relation" | "phone", label: string) => (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={draft[key]}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
        className="mt-1 w-full rounded-xl bg-surface-variant px-3 py-2.5 text-[13.5px] font-semibold outline-none ring-primary/40 focus:ring-2"
      />
    </label>
  );
  return (
    <Card className="space-y-3">
      {field("name", labels.name)}
      {field("relation", labels.relation)}
      {field("phone", labels.phone)}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 rounded-full bg-surface-variant py-2.5 text-[13px] font-bold text-muted-foreground">
          {labels.cancel}
        </button>
        <button type="button" onClick={() => onSave(draft)} className="flex-1 rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground">
          {labels.save}
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Hospital preference + favorites                                     */
/* ------------------------------------------------------------------ */

export type Tier = "A" | "B" | "C";

export function TierBadge({ tier }: { tier: Tier }) {
  // Fixed: previous /10-opacity fills had almost no visible boundary against
  // bg-surface cards, so the badge read as loose text instead of a capsule.
  // Bumped fill to /15, added a matching-hue border to define the pill edge,
  // and gave it a touch more horizontal padding + whitespace-nowrap so the
  // label never looks clipped.
  const map = {
    A: "border border-success/30 bg-success/15 text-success",
    B: "border border-info/30 bg-info/15 text-info",
    C: "border border-border bg-surface-variant text-foreground/80",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider",
        map[tier]
      )}
    >
      Tier {tier}
    </span>
  );
}

export function HospitalPreferenceCard({
  title,
  description,
  tiers,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  tiers: Tier[];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[24px] border p-4 text-left transition active:scale-[0.99]",
        selected ? "border-primary bg-primary-container/50 shadow-card" : "border-border/50 bg-surface"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[14px] font-extrabold">{title}</p>
          {tiers.map((t) => (
            <TierBadge key={t} tier={t} />
          ))}
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function FavoriteHospitalCard({
  name,
  tier,
  type,
  onRemove,
}: {
  name: string;
  tier: Tier;
  type: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-border/50 bg-surface p-4 shadow-card">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold leading-tight">{name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <TierBadge tier={tier} />
          <span className="text-[11.5px] font-semibold text-muted-foreground">{type}</span>
        </div>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-variant text-muted-foreground transition active:scale-90">
        <X className="size-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings list item                                                  */
/* ------------------------------------------------------------------ */

export function SettingsListItem({
  icon: Icon,
  label,
  hint,
  value,
  right,
  tone = "default",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  value?: string;
  right?: ReactNode;
  tone?: "default" | "emergency";
  onClick?: () => void;
}) {
  const interactive = !right;
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      className={cn("flex items-center gap-3.5 px-5 py-4", interactive && "cursor-pointer transition active:bg-surface-variant/60")}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-2xl",
          tone === "emergency" ? "bg-emergency/10 text-emergency" : "bg-primary-container text-primary"
        )}
      >
        <Icon className="size-[17px]" strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[14px] font-bold leading-tight", tone === "emergency" && "text-emergency")}>{label}</p>
        {hint && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{hint}</p>}
      </div>
      {value && <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">{value}</span>}
      {right ?? <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />}
    </div>
  );
}