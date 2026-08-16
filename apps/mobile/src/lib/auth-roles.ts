export type AccountRole = "patient" | "driver" | "hospital";

export type AccountTypeInfo = {
  id: AccountRole;
  label: string;
  emoji: string;
  summary: string;
  webOnly?: boolean;
  dashboard: string;
};

export const accountTypes: AccountTypeInfo[] = [
  {
    id: "patient",
    label: "General User",
    emoji: "👤",
    summary:
      "Healthcare services, AI Medical Assistant, hospital reservations, consultations, tests, emergency support and blood donation.",
    dashboard: "/(patient)",
  },
  {
    id: "driver",
    label: "Ambulance Driver",
    emoji: "🚑",
    summary: "Receive ambulance requests, manage emergency responses and coordinate patient transportation.",
    dashboard: "/(ambulance)",
  },
  {
    id: "hospital",
    label: "Hospital",
    emoji: "🏥",
    summary:
      "Manage reservations, consultations, diagnostic tests, blood requests, ambulance coordination and emergency cases.",
    webOnly: true,
    dashboard: "/(hospital)",
  },
];

/** Demo role detection — a real backend returns the role with the session. */
export function detectRole(identifier: string): AccountRole {
  const value = identifier.trim().toLowerCase();
  if (value.includes("hospital") || value.includes("clinic")) return "hospital";
  if (value.includes("driver") || value.includes("ambulance") || value.includes("emt")) return "driver";
  return "patient";
}

export const ambulanceTypes = ["ALS", "Critical Care", "Basic Life Support"] as const;
export const hospitalTypes = ["General Hospital", "Specialized Hospital", "Diagnostic Center", "Clinic"] as const;
