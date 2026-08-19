// MedLink Enterprise — demo dataset (all fictional, ported from web)

export type RequestKind = "consultation" | "diagnostic" | "bed" | "icu" | "emergency";
export type RequestStatus = "pending" | "accepted" | "confirmed" | "scheduled" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "collected" | "settled";

export type ServiceRequest = {
  id: string;
  kind: RequestKind;
  title: string;
  hospital: string;
  department: string;
  patient: string;
  doctor?: string;
  date: string;
  time: string;
  status: RequestStatus;
  charge: number;
  serviceFee: number;
  payment: PaymentStatus;
};

export const requestKindLabel: Record<RequestKind, string> = {
  consultation: "Doctor Consultation",
  diagnostic: "Diagnostic Test",
  bed: "Bed Reservation",
  icu: "ICU Reservation",
  emergency: "Emergency Request",
};

export const serviceRequests: ServiceRequest[] = [
  {
    id: "r-4821",
    kind: "consultation",
    title: "Cardiology Consultation",
    hospital: "St. Mercy Medical Center",
    department: "Cardiology",
    patient: "Shirley Ramirez",
    doctor: "Dr. Amara Okafor",
    date: "Jul 29, 2026",
    time: "10:30",
    status: "confirmed",
    charge: 120,
    serviceFee: 6,
    payment: "unpaid",
  },
  {
    id: "r-4820",
    kind: "diagnostic",
    title: "MRI · Lumbar Spine",
    hospital: "Northshore Regional Hospital",
    department: "Radiology",
    patient: "Shirley Ramirez",
    date: "Jul 30, 2026",
    time: "14:00",
    status: "accepted",
    charge: 340,
    serviceFee: 17,
    payment: "pending",
  },
  {
    id: "r-4818",
    kind: "bed",
    title: "General Ward Bed",
    hospital: "Lakeside Community Hospital",
    department: "General Medicine",
    patient: "Shirley Ramirez",
    date: "Jul 26, 2026",
    time: "08:15",
    status: "completed",
    charge: 210,
    serviceFee: 11,
    payment: "paid",
  },
  {
    id: "r-4815",
    kind: "emergency",
    title: "Emergency SOS · Asthma",
    hospital: "St. Mercy Medical Center",
    department: "Emergency",
    patient: "Shirley Ramirez",
    date: "Jul 18, 2026",
    time: "22:41",
    status: "completed",
    charge: 480,
    serviceFee: 24,
    payment: "unpaid",
  },
  {
    id: "r-4809",
    kind: "icu",
    title: "ICU Reservation",
    hospital: "Metro Heart Institute",
    department: "Critical Care",
    patient: "Shirley Ramirez",
    date: "Jun 30, 2026",
    time: "03:20",
    status: "cancelled",
    charge: 0,
    serviceFee: 0,
    payment: "unpaid",
  },
  {
    id: "r-4802",
    kind: "consultation",
    title: "Pulmonology Follow-up",
    hospital: "St. Mercy Medical Center",
    department: "Pulmonology",
    patient: "Shirley Ramirez",
    doctor: "Dr. Neel Varma",
    date: "Jun 12, 2026",
    time: "16:00",
    status: "completed",
    charge: 95,
    serviceFee: 5,
    payment: "paid",
  },
];

export const patient = {
  name: "Shirley Ramirez",
  age: 34,
  initials: "SR",
  bloodType: "O+",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Asthma"],
  medications: ["Albuterol inhaler", "Vitamin D"],
  emergencyContact: { name: "Miguel Ramirez", relation: "Spouse", phone: "+1 (415) 555-0007" },
  insurance: "BlueShield · Plan #A-90124",
};

export const statusStyle = (s: RequestStatus) => {
  switch (s) {
    case "pending":
      return { label: "Pending", color: "warning" };
    case "accepted":
      return { label: "Accepted", color: "info" };
    case "confirmed":
      return { label: "Confirmed", color: "primary" };
    case "scheduled":
      return { label: "Scheduled", color: "primary" };
    case "completed":
      return { label: "Completed", color: "success" };
    case "cancelled":
      return { label: "Cancelled", color: "muted" };
  }
};

export const paymentStyle = (p: PaymentStatus) => {
  switch (p) {
    case "unpaid":
      return { label: "Unpaid", color: "emergency" };
    case "pending":
      return { label: "Pending payment", color: "warning" };
    case "paid":
      return { label: "Paid", color: "success" };
    case "collected":
      return { label: "Collected", color: "info" };
    case "settled":
      return { label: "Settled", color: "success" };
  }
};

export const kindIcon: Record<RequestKind, string> = {
  consultation: "Stethoscope",
  diagnostic: "FileHeart",
  bed: "Building2",
  icu: "AlertTriangle",
  emergency: "AlertCircle",
};
