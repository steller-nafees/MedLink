export type AccountRole = "patient" | "driver" | "hospital" | "admin";

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
    dashboard: "/patient",
  },
  {
    id: "driver",
    label: "Ambulance Driver",
    emoji: "🚑",
    summary: "Receive ambulance requests, manage emergency responses and coordinate patient transportation.",
    dashboard: "/ambulance",
  },
  {
    id: "hospital",
    label: "Hospital",
    emoji: "🏥",
    summary:
      "Manage reservations, consultations, diagnostic tests, blood requests, ambulance coordination and emergency cases.",
    webOnly: true,
    dashboard: "/hospital",
  },
  {
    id: "admin",
    label: "Super Admin",
    emoji: "🛡️",
    summary: "Govern the MedLink platform: verification, users, revenue and system health.",
    webOnly: true,
    dashboard: "/admin",
  },
];

export const ambulanceTypes = ["ALS", "Critical Care", "Basic Life Support"] as const;
export const hospitalTypes = ["General Hospital", "Specialized Hospital", "Diagnostic Center", "Clinic"] as const;
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
