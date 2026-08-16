import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Droplet, Phone, Send, X, Check, MapPin, Heart, Building2 } from "lucide-react";
import type { BloodGroup, Eligibility, RankedDonor } from "@/lib/medlink/blood";

/* ── Small pieces ───────────────────────────────────────────── */

export function BloodDrop({ group, size = "md", tone = "emergency" }: { group: BloodGroup; size?: "sm" | "md"; tone?: "emergency" | "muted" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl font-extrabold",
        size === "sm" ? "size-9 text-[12px]" : "size-11 text-[13px]",
        tone === "emergency" ? "bg-emergency/10 text-emergency" : "bg-surface-variant text-foreground/70",
      )}
    >
      {group}
    </span>
  );
}

export function EligibilityPill({ eligibility, className }: { eligibility: Eligibility; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        eligibility.eligible ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", eligibility.eligible ? "bg-success" : "bg-warning")} />
      {eligibility.eligible ? "Eligible to donate" : `Available in ${eligibility.daysLeft} days`}
    </span>
  );
}

/* ── Donor card ─────────────────────────────────────────────── */

export function DonorCard({
  donor,
  onCall,
  onRequest,
  requested,
  compact,
}: {
  donor: RankedDonor;
  onCall?: () => void;
  onRequest?: () => void;
  requested?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-[24px] border border-border/60 bg-surface p-3.5 shadow-card", compact && "rounded-3xl")}>
      <div className="flex items-start gap-3">
        <BloodDrop group={donor.group} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-bold leading-tight">{donor.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <EligibilityPill eligibility={donor.eligibility} />
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", donor.status === "online" ? "bg-success/10 text-success" : "bg-surface-variant text-muted-foreground")}>
              <span className={cn("size-1.5 rounded-full", donor.status === "online" ? "bg-success" : "bg-muted-foreground")} />
              {donor.status === "online" ? "Online" : "Offline"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-variant px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
              <MapPin className="size-3" /> {donor.distanceKm} km from hospital
            </span>
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">{donor.donations} previous donations</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={`tel:${donor.phone}`}
          onClick={onCall}
          className="flex items-center justify-center gap-1.5 rounded-full border border-border/70 py-2.5 text-[12.5px] font-semibold"
        >
          <Phone className="size-3.5" /> Call
        </a>
        <button
          type="button"
          onClick={onRequest}
          disabled={requested}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[12.5px] font-semibold transition active:scale-[0.98]",
            requested ? "bg-success text-white" : "gradient-emergency text-white shadow-card",
          )}
        >
          {requested ? <><Check className="size-3.5" /> Request sent</> : <><Send className="size-3.5" /> {donor.status === "online" ? "Send request" : "Notify donor"}</>}
        </button>
      </div>
    </div>
  );
}

/* ── Confirmation modal ─────────────────────────────────────── */

export function ConfirmDonationRequest({
  open,
  donorName,
  group,
  hospitalName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  donorName: string;
  group: BloodGroup;
  hospitalName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="soft-in w-full rounded-[28px] bg-surface p-5 shadow-dialog">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emergency/10 text-emergency">
          <Droplet className="size-6" />
        </div>
        <h3 className="mt-3 text-center text-[18px] font-extrabold leading-tight">Request blood donation?</h3>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
          A donation request will be sent to <span className="font-semibold text-foreground">{donorName}</span>.
          <br />Patient requires <span className="font-semibold text-emergency">{group}</span> blood.
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-surface-variant px-3 py-2.5 text-[12.5px] font-semibold">
          <Building2 className="size-3.5 text-primary" /> {hospitalName}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={onCancel} className="rounded-full border border-border/70 py-3 text-[13.5px] font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-full gradient-emergency py-3 text-[13.5px] font-semibold text-white shadow-float">
            Send request
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Blood support card (SOS) ───────────────────────────────── */

export function BloodSupportHeader({
  group,
  hospitalName,
  units,
  children,
}: {
  group: BloodGroup;
  hospitalName: string;
  units: number;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-emergency/20 bg-emergency/5 p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-emergency text-white"><Droplet className="size-4" /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emergency">Blood support available</p>
          <p className="text-[13px] font-bold leading-tight">Blood likely required</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Tile label="Blood group" value={group} tone="emergency" />
        <Tile label="Units" value={`${units} bags`} />
        <Tile label="Hospital" value={hospitalName.split(" ")[0]} />
      </div>
      <p className="mt-2 text-center text-[11.5px] text-muted-foreground">{hospitalName}</p>
      {children}
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "emergency" }) {
  return (
    <div className="rounded-2xl bg-surface px-2 py-2.5">
      <p className={cn("text-[14px] font-extrabold leading-none", tone === "emergency" && "text-emergency")}>{value}</p>
      <p className="mt-1 text-[9.5px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

/* ── Donation status card (profile / home) ──────────────────── */

export function DonationSummary({
  group,
  lastDonation,
  eligibility,
  available,
  action,
}: {
  group: BloodGroup;
  lastDonation: string;
  eligibility: Eligibility;
  available: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-border/50 bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-emergency/10 text-[14px] font-extrabold text-emergency">{group}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold leading-tight">Blood donation</p>
          <p className="text-[11.5px] text-muted-foreground">Last donated · {lastDonation}</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[10.5px] font-bold", available ? "bg-primary-container text-primary" : "bg-surface-variant text-muted-foreground")}>
          {available ? "Available" : "Paused"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <EligibilityPill eligibility={available ? eligibility : { eligible: false, daysLeft: 0, label: "Unavailable" }} />
        {action}
      </div>
    </div>
  );
}

/* ── Donor inbox card ───────────────────────────────────────── */

export function DonorRequestCard({
  hospitalName,
  group,
  urgency,
  units,
  phone,
}: {
  hospitalName: string;
  group: BloodGroup;
  urgency: string;
  units: number;
  phone: string;
}) {
  const [state, setState] = useState<"pending" | "accepted" | "declined">("pending");
  return (
    <div className="rounded-[28px] border border-emergency/25 bg-surface p-4 shadow-card ring-1 ring-emergency/10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl gradient-emergency text-white"><Heart className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-extrabold leading-tight">Emergency blood request</p>
          <p className="truncate text-[12px] text-muted-foreground">{hospitalName}</p>
        </div>
        <span className="rounded-full bg-emergency/10 px-2.5 py-1 text-[10.5px] font-bold text-emergency">{urgency} urgency</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-surface-variant px-3 py-2.5">
          <p className="text-[14px] font-extrabold text-emergency">{group}</p>
          <p className="text-[9.5px] uppercase tracking-widest text-muted-foreground">Required group</p>
        </div>
        <div className="rounded-2xl bg-surface-variant px-3 py-2.5">
          <p className="text-[14px] font-extrabold">{units} bags</p>
          <p className="text-[9.5px] uppercase tracking-widest text-muted-foreground">Units needed</p>
        </div>
      </div>
      {state === "pending" ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setState("accepted")} className="flex items-center justify-center gap-1.5 rounded-full bg-success py-2.5 text-[13px] font-semibold text-white shadow-card">
              <Check className="size-4" /> Accept
            </button>
            <button onClick={() => setState("declined")} className="flex items-center justify-center gap-1.5 rounded-full border border-border/70 py-2.5 text-[13px] font-semibold">
              <X className="size-4" /> Decline
            </button>
          </div>
          <a href={`tel:${phone}`} className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-primary/30 py-2.5 text-[12.5px] font-semibold text-primary">
            <Phone className="size-3.5" /> Call requester
          </a>
        </>
      ) : (
        <div className={cn("mt-3 rounded-2xl px-3 py-3 text-center text-[13px] font-semibold", state === "accepted" ? "bg-success/10 text-success" : "bg-surface-variant text-muted-foreground")}>
          {state === "accepted" ? "You accepted — the hospital has been notified." : "Request declined."}
        </div>
      )}
    </div>
  );
}
