import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  CloudOff,
  Droplet,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  ShieldPlus,
  Truck,
  WifiOff,
} from "lucide-react";
import {
  emergencyHotlines,
  firstAidGuides,
  formatSyncTime,
  type EmergencyCache,
} from "@/lib/medlink/offline-sync";

/* ── Status banners ──────────────────────────────────────────── */

export function SyncStatusBanner({ syncedAt, justSynced }: { syncedAt?: string; justSynced?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-success/25 bg-success/8 px-3.5 py-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
        <RefreshCw className={cn("size-3.5", justSynced && "animate-spin")} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-success">
          {justSynced ? "Emergency resources updated" : "Emergency resources synced"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Last sync: {syncedAt ? formatSyncTime(syncedAt) : "Just now"}
        </p>
      </div>
    </div>
  );
}

export function OfflineBanner({ syncedAt }: { syncedAt?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-warning/30 bg-warning/10 px-3.5 py-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-warning/20 text-warning">
        <WifiOff className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-warning">Offline emergency mode</p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Using previously synchronized emergency resources
          {syncedAt ? ` · ${formatSyncTime(syncedAt)}` : ""}.
        </p>
      </div>
    </div>
  );
}

export function OfflineNotice({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-1.5 text-[11px] text-muted-foreground", className)}>
      <CloudOff className="size-3.5 shrink-0" /> Internet connection required for live emergency services.
    </p>
  );
}

export function UnverifiedNotice() {
  return (
    <p className="text-[11px] italic text-muted-foreground">Availability cannot be verified in real time.</p>
  );
}

/* ── Call button ─────────────────────────────────────────────── */

export function CallButton({ label, phone, tone = "primary" }: { label: string; phone: string; tone?: "primary" | "emergency" }) {
  return (
    <a
      href={`tel:${phone}`}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-semibold transition active:scale-[0.99]",
        tone === "emergency" ? "gradient-emergency text-white shadow-float" : "border border-primary/30 text-primary"
      )}
    >
      <PhoneCall className="size-4" /> {label}
    </a>
  );
}

/* ── Offline resources ───────────────────────────────────────── */

function Group({
  title,
  icon: Icon,
  count,
  children,
  defaultOpen,
}: {
  title: string;
  icon: any;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
          <Icon className="size-4" />
        </span>
        <span className="flex-1 text-[13.5px] font-bold">{title}</span>
        <span className="text-[11px] text-muted-foreground">{count}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 border-t border-border/60 px-4 py-3.5">{children}</div>}
    </div>
  );
}

export function OfflineResources({ cache, online }: { cache: EmergencyCache; online: boolean }) {
  return (
    <div className="space-y-3">
      <Group title="Nearby hospitals" icon={Building2} count={cache.hospitals.length} defaultOpen>
        {cache.hospitals.map((h) => (
          <div key={h.id} className="rounded-2xl bg-surface-variant p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13.5px] font-bold leading-tight">🏥 {h.name}</p>
              <span className="shrink-0 rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-bold text-primary">
                Tier {h.tier}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground">📍 {h.address}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{h.services.slice(0, 4).join(" · ")}</p>
            {!online && <div className="mt-1.5"><UnverifiedNotice /></div>}
            <div className="mt-2.5 space-y-2">
              <CallButton label={`Call hospital · ${h.phone}`} phone={h.phone} />
              <CallButton label="Call emergency department" phone={h.emergencyPhone} tone="emergency" />
            </div>
          </div>
        ))}
      </Group>

      <Group title="Ambulance providers" icon={Truck} count={cache.providers.length}>
        {cache.providers.map((p) => (
          <div key={p.id} className="rounded-2xl bg-surface-variant p-3.5">
            <p className="text-[13.5px] font-bold">{p.provider}</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{p.type} · {p.coverage}</p>
            <div className="mt-2.5">
              <CallButton label={`Call · ${p.phone}`} phone={p.phone} />
            </div>
          </div>
        ))}
      </Group>

      <Group title="Nearby blood donors" icon={Droplet} count={cache.donors.length}>
        {cache.donors.map((d) => (
          <div key={d.id} className="rounded-2xl bg-surface-variant p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13.5px] font-bold">🩸 {d.name}</p>
              <span className="rounded-full bg-emergency/10 px-2 py-0.5 text-[11px] font-bold text-emergency">{d.group}</span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {d.hospitalName} · last donation {d.lastDonation}
            </p>
            <div className="mt-2.5">
              {d.phone ? (
                <CallButton label={`Call · ${d.phone}`} phone={d.phone} />
              ) : (
                <p className="text-[11px] italic text-muted-foreground">Contact number not shared by this donor.</p>
              )}
            </div>
          </div>
        ))}
      </Group>

      <Group title="Emergency hotlines" icon={PhoneCall} count={emergencyHotlines.length}>
        {emergencyHotlines.map((h) => (
          <div key={h.number} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-variant px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">{h.label}</p>
              <p className="text-[11.5px] text-muted-foreground">{h.number}</p>
            </div>
            <a
              href={`tel:${h.number}`}
              className="grid size-10 shrink-0 place-items-center rounded-full gradient-emergency text-white shadow-float"
              aria-label={`Call ${h.label}`}
            >
              <PhoneCall className="size-4" />
            </a>
          </div>
        ))}
      </Group>

      <Group title="First-aid guidance" icon={ShieldPlus} count={firstAidGuides.length}>
        {firstAidGuides.map((g) => (
          <div key={g.title} className="rounded-2xl bg-surface-variant p-3.5">
            <p className="text-[13px] font-bold">{g.title}</p>
            <ol className="mt-2 space-y-1.5 text-[12.5px]">
              {g.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-container text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Group>
    </div>
  );
}

/* ── Coming soon (informational only) ────────────────────────── */

export function SmsComingSoonCard() {
  return (
    <div className="rounded-3xl border border-border/70 bg-surface-variant p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-2xl bg-info/10 text-info">
          <MessageSquare className="size-4" />
        </span>
        <p className="flex-1 text-[13.5px] font-bold">📨 SMS emergency assistance</p>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Coming soon
        </span>
      </div>
      <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
        If connectivity becomes unavailable during an emergency, MedLink will send an emergency SMS with your name,
        phone number, location and emergency summary to your emergency contacts and healthcare providers.
      </p>
    </div>
  );
}
