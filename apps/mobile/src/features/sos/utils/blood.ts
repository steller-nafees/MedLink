// MedLink — Blood donation support utilities

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

/** Donors whose blood a recipient of `recipient` group can safely receive. */
const compatibility: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': bloodGroups,
};

export const canDonateTo = (donor: BloodGroup, recipient: BloodGroup) =>
  compatibility[recipient].includes(donor);

/** Standard whole-blood waiting period. */
export const DONATION_INTERVAL_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;

export type Eligibility = { eligible: boolean; daysLeft: number; label: string };

export function eligibilityFrom(lastDonation: string | null, now = new Date()): Eligibility {
  if (!lastDonation) return { eligible: true, daysLeft: 0, label: 'Eligible to donate' };
  const elapsed = Math.floor((now.getTime() - new Date(lastDonation).getTime()) / DAY);
  const daysLeft = Math.max(0, DONATION_INTERVAL_DAYS - elapsed);
  return daysLeft === 0
    ? { eligible: true, daysLeft: 0, label: 'Eligible to donate' }
    : { eligible: false, daysLeft, label: `Available in ${daysLeft} days` };
}

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No donations yet';

export type Donor = {
  id: string;
  name: string;
  group: BloodGroup;
  lastDonation: string | null;
  available: boolean;
  phone: string;
  /** Distance in km from each hospital id */
  distanceFromHospitalKm: Record<string, number>;
  donations: number;
};

export const donors: Donor[] = [
  {
    id: 'd1',
    name: 'Ahmed Hasan',
    group: 'O+',
    lastDonation: '2025-11-02',
    available: true,
    phone: '+880 1712-334455',
    distanceFromHospitalKm: { 'h-evercare': 1.2, 'h-square': 3.8, 'h-united': 5.2, 'h-labaid': 6.4 },
    donations: 7,
  },
  {
    id: 'd2',
    name: 'Tanvir Rahman',
    group: 'O+',
    lastDonation: '2025-09-18',
    available: true,
    phone: '+880 1819-776543',
    distanceFromHospitalKm: { 'h-evercare': 2.4, 'h-square': 2.1, 'h-united': 4.4, 'h-labaid': 5.0 },
    donations: 12,
  },
  {
    id: 'd3',
    name: 'Maya Fernandes',
    group: 'O-',
    lastDonation: '2026-06-14',
    available: true,
    phone: '+880 1933-220087',
    distanceFromHospitalKm: { 'h-evercare': 3.1, 'h-square': 1.4, 'h-united': 6.0, 'h-labaid': 4.2 },
    donations: 4,
  },
  {
    id: 'd4',
    name: 'Rafael Souza',
    group: 'O-',
    lastDonation: '2025-12-05',
    available: true,
    phone: '+880 1712-445566',
    distanceFromHospitalKm: { 'h-evercare': 3.9, 'h-square': 4.6, 'h-united': 2.2, 'h-labaid': 3.3 },
    donations: 9,
  },
  {
    id: 'd5',
    name: 'Nadia Karim',
    group: 'O+',
    lastDonation: '2026-05-28',
    available: false,
    phone: '+880 1812-334455',
    distanceFromHospitalKm: { 'h-evercare': 0.9, 'h-square': 3.0, 'h-united': 4.8, 'h-labaid': 5.9 },
    donations: 3,
  },
  {
    id: 'd6',
    name: 'Jonas Weber',
    group: 'A+',
    lastDonation: '2025-08-11',
    available: true,
    phone: '+880 1934-556677',
    distanceFromHospitalKm: { 'h-evercare': 1.6, 'h-square': 2.9, 'h-united': 5.5, 'h-labaid': 4.9 },
    donations: 15,
  },
  {
    id: 'd7',
    name: 'Priya Raman',
    group: 'B+',
    lastDonation: null,
    available: true,
    phone: '+880 1712-667788',
    distanceFromHospitalKm: { 'h-evercare': 2.8, 'h-square': 3.4, 'h-united': 3.9, 'h-labaid': 2.6 },
    donations: 0,
  },
  {
    id: 'd8',
    name: 'Chris Doyle',
    group: 'O+',
    lastDonation: '2026-07-01',
    available: true,
    phone: '+880 1234-556677',
    distanceFromHospitalKm: { 'h-evercare': 1.1, 'h-square': 4.1, 'h-united': 5.7, 'h-labaid': 6.8 },
    donations: 6,
  },
];

export type RankedDonor = Donor & { distanceKm: number; eligibility: Eligibility; status: 'online' | 'offline' };

export const LATE_NIGHT_DONOR_PRIORITY = { startHour: 22, endHour: 6 } as const;

export function isLateNightEmergency(now = new Date(), range = LATE_NIGHT_DONOR_PRIORITY) {
  const hour = now.getHours();
  return range.startHour > range.endHour
    ? hour >= range.startHour || hour < range.endHour
    : hour >= range.startHour && hour < range.endHour;
}

/**
 * Matching is always measured from the selected hospital, never the patient's location.
 * During the configurable late-night window, online donors are promoted ahead of offline
 * registered donors so the response team can contact active donors first.
 */
export function matchDonors(
  group: BloodGroup,
  hospitalId: string,
  opts: { limit?: number; now?: Date; lateNightRange?: typeof LATE_NIGHT_DONOR_PRIORITY } = {},
): RankedDonor[] {
  const { limit, now, lateNightRange } = opts;
  const prioritizeOnline = isLateNightEmergency(now, lateNightRange);
  const list = donors
    .filter((d) => canDonateTo(d.group, group))
    .map((d) => ({
      ...d,
      distanceKm: d.distanceFromHospitalKm[hospitalId] ?? 99,
      eligibility: eligibilityFrom(d.lastDonation),
      status: d.available ? ('online' as const) : ('offline' as const),
    }))
    .sort(
      (a, b) =>
        Number(b.eligibility.eligible) - Number(a.eligibility.eligible) ||
        (prioritizeOnline ? Number(b.available) - Number(a.available) : 0) ||
        Number(b.group === group) - Number(a.group === group) ||
        a.distanceKm - b.distanceKm ||
        (!prioritizeOnline ? Number(b.available) - Number(a.available) : 0),
    );
  return limit ? list.slice(0, limit) : list;
}
