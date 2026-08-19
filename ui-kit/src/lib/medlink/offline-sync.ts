// MedLink — Smart Emergency Sync
// Lightweight, temporary cache of emergency resources so the SOS Center stays
// useful without connectivity. Only the newest snapshot is kept.

import { useEffect, useState, useSyncExternalStore } from "react";
import { hospitals, ambulances } from "@/lib/medlink/data";
import { donors, formatDate } from "@/lib/medlink/blood";

const CACHE_KEY = "medlink.emergency.cache";
const OVERRIDE_KEY = "medlink.network.override"; // "online" | "offline" | null

/* ── Connectivity (real + manual override from Settings) ─────── */

export type NetworkOverride = "auto" | "online" | "offline";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);
  window.addEventListener("storage", emit);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("online", emit);
    window.removeEventListener("offline", emit);
    window.removeEventListener("storage", emit);
  };
}

export function getNetworkOverride(): NetworkOverride {
  if (typeof localStorage === "undefined") return "auto";
  const v = localStorage.getItem(OVERRIDE_KEY);
  return v === "online" || v === "offline" ? v : "auto";
}

export function setNetworkOverride(v: NetworkOverride) {
  if (v === "auto") localStorage.removeItem(OVERRIDE_KEY);
  else localStorage.setItem(OVERRIDE_KEY, v);
  emit();
}

function snapshotOnline() {
  const o = getNetworkOverride();
  if (o === "online") return true;
  if (o === "offline") return false;
  return navigator.onLine;
}

/** True when MedLink should treat the device as connected. */
export function useIsOnline() {
  return useSyncExternalStore(subscribe, snapshotOnline, () => true);
}

export function useNetworkOverride(): [NetworkOverride, (v: NetworkOverride) => void] {
  const value = useSyncExternalStore(subscribe, getNetworkOverride, () => "auto" as NetworkOverride);
  return [value, setNetworkOverride];
}

/* ── Cached emergency dataset ────────────────────────────────── */

export type CachedHospital = {
  id: string;
  name: string;
  tier: "A" | "B" | "C";
  address: string;
  phone: string;
  emergencyPhone: string;
  services: string[];
};

export type CachedProvider = {
  id: string;
  provider: string;
  phone: string;
  type: string;
  coverage: string;
};

export type CachedDonor = {
  id: string;
  name: string;
  group: string;
  phone: string | null;
  lastDonation: string;
  hospitalName: string;
};

export type EmergencyCache = {
  syncedAt: string; // ISO
  hospitals: CachedHospital[];
  providers: CachedProvider[];
  donors: CachedDonor[];
};

export const emergencyHotlines = [
  { label: "National Emergency", number: "999" },
  { label: "Ambulance Service", number: "+880 1712-334455" },
  { label: "Fire Service", number: "102" },
  { label: "MedLink Support", number: "+880 9610-000111" },
];

export const firstAidGuides: { title: string; steps: string[] }[] = [
  {
    title: "Chest pain / cardiac event",
    steps: [
      "Keep the person seated, calm and still.",
      "Loosen tight clothing; give nothing to eat or drink.",
      "Help them take prescribed nitroglycerin if available.",
      "If unresponsive and not breathing, start CPR (30:2).",
    ],
  },
  {
    title: "Severe bleeding",
    steps: [
      "Apply firm, direct pressure with a clean cloth.",
      "Do not remove soaked dressings — add layers on top.",
      "Raise the injured limb above heart level if possible.",
      "Keep the person warm and monitor for shock.",
    ],
  },
  {
    title: "Unconscious but breathing",
    steps: [
      "Place in the recovery position on their side.",
      "Tilt the head back to keep the airway open.",
      "Check breathing every minute.",
      "Do not give anything by mouth.",
    ],
  },
];

const coverageByProvider: Record<string, string> = {
  "MedLink Emergency Services": "Dhaka Metro · 24/7",
  "City Care Ambulance": "Gulshan · Banani · Uttara",
  "LifeLine Rescue": "Dhanmondi · Mohammadpur",
};

/** Builds the newest snapshot from live sources. */
function buildCache(): EmergencyCache {
  return {
    syncedAt: new Date().toISOString(),
    hospitals: hospitals.map((h) => ({
      id: h.id,
      name: h.name,
      tier: h.tier,
      address: h.address,
      phone: h.phone,
      emergencyPhone: h.phone,
      services: h.departments,
    })),
    providers: ambulances.map((a) => ({
      id: a.id,
      provider: a.provider,
      phone: a.phone,
      type: a.type,
      coverage: coverageByProvider[a.provider] ?? "Dhaka Metro",
    })),
    donors: donors
      .filter((d) => d.available)
      .slice(0, 6)
      .map((d, i) => ({
        id: d.id,
        name: d.name,
        group: d.group,
        // Contact number only if the donor consented to be reachable.
        phone: d.available ? d.phone : null,
        lastDonation: formatDate(d.lastDonation),
        hospitalName: hospitals[i % hospitals.length].name,
      })),
  };
}

export function readCache(): EmergencyCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as EmergencyCache) : null;
  } catch {
    return null;
  }
}

/** Replaces any previous snapshot with a fresh one (no history kept). */
export function syncEmergencyCache(): EmergencyCache {
  const next = buildCache();
  localStorage.removeItem(CACHE_KEY);
  localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  return next;
}

export function formatSyncTime(iso: string) {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  return d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });
}

/**
 * Syncs whenever the SOS Center is open and online; falls back to the last
 * stored snapshot when connectivity is lost.
 */
export function useEmergencySync() {
  const online = useIsOnline();
  const [cache, setCache] = useState<EmergencyCache | null>(null);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (online) {
      setCache(syncEmergencyCache());
      setJustSynced(true);
      const t = setTimeout(() => setJustSynced(false), 4000);
      return () => clearTimeout(t);
    }
    setCache(readCache());
  }, [online]);

  return { online, cache, justSynced };
}
