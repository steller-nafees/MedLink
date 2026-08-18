// MedLink — Smart Emergency Sync for React Native
// Lightweight, temporary cache of emergency resources so the SOS Center stays
// useful without connectivity. Uses AsyncStorage + NetInfo.

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { hospitals, ambulances } from './data';
import { donors, formatDate } from './blood';

const CACHE_KEY = 'medlink.emergency.cache';
const OVERRIDE_KEY = 'medlink.network.override'; // "online" | "offline" | null

/* ── Cached emergency dataset ────────────────────────────────── */

export type CachedHospital = {
  id: string;
  name: string;
  tier: 'A' | 'B' | 'C';
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
  { label: 'National Emergency', number: '999' },
  { label: 'Ambulance Service', number: '+880 1712-334455' },
  { label: 'Fire Service', number: '102' },
  { label: 'MedLink Support', number: '+880 9610-000111' },
];

export const firstAidGuides: { title: string; steps: string[] }[] = [
  {
    title: 'Chest pain / cardiac event',
    steps: [
      'Keep the person seated, calm and still.',
      'Loosen tight clothing; give nothing to eat or drink.',
      'Help them take prescribed nitroglycerin if available.',
      'If unresponsive and not breathing, start CPR (30:2).',
    ],
  },
  {
    title: 'Severe bleeding',
    steps: [
      'Apply firm, direct pressure with a clean cloth.',
      'Do not remove soaked dressings — add layers on top.',
      'Raise the injured limb above heart level if possible.',
      'Keep the person warm and monitor for shock.',
    ],
  },
  {
    title: 'Unconscious but breathing',
    steps: [
      'Place in the recovery position on their side.',
      'Tilt the head back to keep the airway open.',
      'Check breathing every minute.',
      'Do not give anything by mouth.',
    ],
  },
];

const coverageByProvider: Record<string, string> = {
  'MedLink Emergency Services': 'Dhaka Metro · 24/7',
  'City Care Ambulance': 'Gulshan · Banani · Uttara',
  'LifeLine Rescue': 'Dhanmondi · Mohammadpur',
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
      services: h.departments.slice(0, 4),
    })),
    providers: Array.from(new Set(ambulances.map((a) => a.provider))).map((provider) => {
      const first = ambulances.find((a) => a.provider === provider)!;
      return {
        id: first.id,
        provider,
        phone: first.phone,
        type: first.type,
        coverage: coverageByProvider[provider] || 'Coverage area not specified',
      };
    }),
    donors: donors.slice(0, 5).map((d) => ({
      id: d.id,
      name: d.name,
      group: d.group,
      phone: d.phone,
      lastDonation: formatDate(d.lastDonation),
      hospitalName: 'MedLink Blood Bank',
    })),
  };
}

export function formatSyncTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

/** Sync emergency resources to AsyncStorage. Returns true if successful. */
export async function syncEmergencyCache(): Promise<boolean> {
  try {
    const cache = buildCache();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return true;
  } catch (e) {
    console.warn('Failed to sync emergency cache', e);
    return false;
  }
}

/** Retrieve cached emergency resources. Returns null if not cached. */
export async function getCachedEmergency(): Promise<EmergencyCache | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.warn('Failed to read emergency cache', e);
    return null;
  }
}

export type NetworkOverride = 'auto' | 'online' | 'offline';

export async function getNetworkOverride(): Promise<NetworkOverride> {
  try {
    const v = await AsyncStorage.getItem(OVERRIDE_KEY);
    return v === 'online' || v === 'offline' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export async function setNetworkOverride(v: NetworkOverride) {
  try {
    if (v === 'auto') {
      await AsyncStorage.removeItem(OVERRIDE_KEY);
    } else {
      await AsyncStorage.setItem(OVERRIDE_KEY, v);
    }
  } catch (e) {
    console.warn('Failed to set network override', e);
  }
}

/** Hook to manage emergency sync state. */
export function useEmergencySync() {
  const [online, setOnline] = useState(true);
  const [cache, setCache] = useState<EmergencyCache | null>(null);
  const [justSynced, setJustSynced] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    (async () => {
      const cached = await getCachedEmergency();
      setCache(cached);
    })();
  }, []);

  // Monitor connectivity
  useEffect(() => {
    const subscription = NetInfo.addEventListener(async (state) => {
      const override = await getNetworkOverride();
      let isOnline = true;

      if (override === 'online') {
        isOnline = true;
      } else if (override === 'offline') {
        isOnline = false;
      } else {
        isOnline = state.isConnected ?? true;
      }

      setOnline(isOnline);

      // Auto-sync when coming online
      if (isOnline) {
        const success = await syncEmergencyCache();
        if (success) {
          const updated = await getCachedEmergency();
          setCache(updated);
          setJustSynced(true);
          setTimeout(() => setJustSynced(false), 3000);
        }
      }
    });

    return () => subscription();
  }, []);

  const manualSync = useCallback(async () => {
    if (online) {
      const success = await syncEmergencyCache();
      if (success) {
        const updated = await getCachedEmergency();
        setCache(updated);
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 3000);
      }
    }
  }, [online]);

  return { online, cache, justSynced, manualSync };
}
