export type BloodGroup = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export const bloodGroups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export type Eligibility = { eligible: boolean; daysLeft: number; label: string };

const DONATION_INTERVAL_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

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

export const myDonation = {
  group: "O+" as BloodGroup,
  lastDonation: "2026-05-20",
  available: true,
};
