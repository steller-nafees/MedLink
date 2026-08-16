// MedLink — Blood donation support (demo dataset, all fictional)

export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export const bloodGroups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

/** Donors whose blood a recipient of `recipient` group can safely receive. */
const compatibility: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": bloodGroups,
};

export const canDonateTo = (donor: BloodGroup, recipient: BloodGroup) =>
  compatibility[recipient].includes(donor);

/** Standard whole-blood waiting period. */
export const DONATION_INTERVAL_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;

export type Eligibility = { eligible: boolean; daysLeft: number; label: string };

export function eligibilityFrom(lastDonation: string | null, now = new Date()): Eligibility {
  if (!lastDonation) return { eligible: true, daysLeft: 0, label: "Eligible to donate" };
  const elapsed = Math.floor((now.getTime() - new Date(lastDonation).getTime()) / DAY);
  const daysLeft = Math.max(0, DONATION_INTERVAL_DAYS - elapsed);
  return daysLeft === 0
    ? { eligible: true, daysLeft: 0, label: "Eligible to donate" }
    : { eligible: false, daysLeft, label: `Available in ${daysLeft} days` };
}

export const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "No donations yet";

export type Donor = {
  id: string;
  name: string;
  group: BloodGroup;
  lastDonation: string | null;
  available: boolean;
  phone: string;
  /** Distance in km from each hospital id — proximity is measured to the hospital, not the patient. */
  distanceFromHospitalKm: Record<string, number>;
  donations: number;
};

export const donors: Donor[] = [
  { id: "d1", name: "Ahmed Hasan", group: "O+", lastDonation: "2025-11-02", available: true, phone: "+1 (415) 555-0311", distanceFromHospitalKm: { "h-mercy": 1.2, "h-north": 3.8, "h-lake": 5.2, "h-metro": 6.4 }, donations: 7 },
  { id: "d2", name: "Tanvir Rahman", group: "O+", lastDonation: "2025-09-18", available: true, phone: "+1 (415) 555-0342", distanceFromHospitalKm: { "h-mercy": 2.4, "h-north": 2.1, "h-lake": 4.4, "h-metro": 5.0 }, donations: 12 },
  { id: "d3", name: "Maya Fernandes", group: "O-", lastDonation: "2026-06-14", available: true, phone: "+1 (415) 555-0377", distanceFromHospitalKm: { "h-mercy": 3.1, "h-north": 1.4, "h-lake": 6.0, "h-metro": 4.2 }, donations: 4 },
  { id: "d4", name: "Rafael Souza", group: "O-", lastDonation: "2025-12-05", available: true, phone: "+1 (415) 555-0390", distanceFromHospitalKm: { "h-mercy": 3.9, "h-north": 4.6, "h-lake": 2.2, "h-metro": 3.3 }, donations: 9 },
  { id: "d5", name: "Nadia Karim", group: "O+", lastDonation: "2026-05-28", available: false, phone: "+1 (415) 555-0402", distanceFromHospitalKm: { "h-mercy": 0.9, "h-north": 3.0, "h-lake": 4.8, "h-metro": 5.9 }, donations: 3 },
  { id: "d6", name: "Jonas Weber", group: "A+", lastDonation: "2025-08-11", available: true, phone: "+1 (415) 555-0414", distanceFromHospitalKm: { "h-mercy": 1.6, "h-north": 2.9, "h-lake": 5.5, "h-metro": 4.9 }, donations: 15 },
  { id: "d7", name: "Priya Raman", group: "B+", lastDonation: null, available: true, phone: "+1 (415) 555-0428", distanceFromHospitalKm: { "h-mercy": 2.8, "h-north": 3.4, "h-lake": 3.9, "h-metro": 2.6 }, donations: 0 },
  { id: "d8", name: "Chris Doyle", group: "O+", lastDonation: "2026-07-01", available: true, phone: "+1 (415) 555-0433", distanceFromHospitalKm: { "h-mercy": 1.1, "h-north": 4.1, "h-lake": 5.7, "h-metro": 6.8 }, donations: 6 },
];

export type RankedDonor = Donor & { distanceKm: number; eligibility: Eligibility; status: "online" | "offline" };

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
      status: d.available ? "online" as const : "offline" as const,
    }))
    .sort((a, b) =>
      Number(b.eligibility.eligible) - Number(a.eligibility.eligible) ||
      (prioritizeOnline ? Number(b.available) - Number(a.available) : 0) ||
      Number(b.group === group) - Number(a.group === group) ||
      a.distanceKm - b.distanceKm ||
      (!prioritizeOnline ? Number(b.available) - Number(a.available) : 0),
    );
  return limit ? list.slice(0, limit) : list;
}

/* ── Current user's donation profile ─────────────────────────── */
export const myDonation = {
  group: "O+" as BloodGroup,
  lastDonation: "2026-05-20",
  available: true,
};

/* ── Hospital-side blood requests ───────────────────────────── */
export type BloodRequestStatus = "sent" | "accepted" | "declined" | "completed";

export type DonorRequest = {
  id: string;
  donorId: string;
  donorName: string;
  group: BloodGroup;
  status: BloodRequestStatus;
  sentAt: string;
};

export type BloodRequest = {
  id: string;
  patient: string;
  group: BloodGroup;
  units: number;
  priority: "High" | "Medium" | "Low";
  department: string;
  hospitalId: string;
  hospitalName: string;
  createdAt: string;
  donorRequests: DonorRequest[];
};

export const bloodRequests: BloodRequest[] = [
  {
    id: "b-2201",
    patient: "Eleanor Chen",
    group: "O+",
    units: 2,
    priority: "High",
    department: "Emergency",
    hospitalId: "h-mercy",
    hospitalName: "St. Mercy Medical Center",
    createdAt: "4m ago",
    donorRequests: [
      { id: "dr1", donorId: "d1", donorName: "Ahmed Hasan", group: "O+", status: "accepted", sentAt: "3m ago" },
      { id: "dr2", donorId: "d2", donorName: "Tanvir Rahman", group: "O+", status: "sent", sentAt: "3m ago" },
    ],
  },
  {
    id: "b-2198",
    patient: "Marcus Reid",
    group: "O-",
    units: 3,
    priority: "High",
    department: "Trauma",
    hospitalId: "h-mercy",
    hospitalName: "St. Mercy Medical Center",
    createdAt: "26m ago",
    donorRequests: [
      { id: "dr3", donorId: "d4", donorName: "Rafael Souza", group: "O-", status: "completed", sentAt: "22m ago" },
      { id: "dr4", donorId: "d3", donorName: "Maya Fernandes", group: "O-", status: "declined", sentAt: "20m ago" },
    ],
  },
];

export const bloodStatusStyle = (s: BloodRequestStatus) => {
  switch (s) {
    case "sent": return { cls: "bg-warning/10 text-warning", label: "Request sent" };
    case "accepted": return { cls: "bg-info/10 text-info", label: "Accepted" };
    case "declined": return { cls: "bg-muted text-muted-foreground", label: "Declined" };
    case "completed": return { cls: "bg-success/10 text-success", label: "Donation completed" };
  }
};

/** Incoming request shown to a donor. */
export const incomingDonorRequest = {
  id: "inb-1",
  hospitalName: "St. Mercy Medical Center",
  group: "O+" as BloodGroup,
  urgency: "High",
  units: 2,
  requesterPhone: "+1 (415) 555-0142",
  distanceKm: 1.2,
};
