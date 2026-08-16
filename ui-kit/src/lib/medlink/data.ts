// MedLink Enterprise — demo dataset (all fictional)
export type Severity = "critical" | "high" | "moderate" | "low";

export type Hospital = {
  id: string;
  name: string;
  tier: "A" | "B" | "C"; // A = preferred/partner hospital
  distanceKm: number;
  etaMin: number;
  address: string;
  rating: number;
  phone: string;
  departments: string[];
  beds: { total: number; available: number };
  icu: { total: number; available: number };
  emergency: boolean;
  bloodBank: string[];
  image?: string;
  coord: { x: number; y: number }; // for stylized map
};

export const hospitals: Hospital[] = [
  {
    id: "h-evercare",
    name: "Evercare Hospital Dhaka",
    tier: "A",
    distanceKm: 2.1,
    etaMin: 8,
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
    rating: 4.8,
    phone: "+880 2 8431065",
    departments: ["Emergency", "Cardiology", "Trauma", "Neurology", "ICU"],
    beds: { total: 300, available: 58 },
    icu: { total: 40, available: 9 },
    emergency: true,
    bloodBank: ["O-", "O+", "A+", "B+", "AB+"],
    coord: { x: 50, y: 40 },
  },
  {
    id: "h-square",
    name: "Square Hospital",
    tier: "A",
    distanceKm: 3.4,
    etaMin: 11,
    address: "18/F, West Panthapath, Dhaka",
    rating: 4.7,
    phone: "+880 2 8144400",
    departments: ["Emergency", "Cardiology", "Oncology", "ICU"],
    beds: { total: 450, available: 70 },
    icu: { total: 50, available: 11 },
    emergency: true,
    bloodBank: ["O+", "A+", "A-", "B+"],
    coord: { x: 40, y: 30 },
  },
  {
    id: "h-united",
    name: "United Hospital",
    tier: "A",
    distanceKm: 4.0,
    etaMin: 13,
    address: "Plot 15, Road 71, Gulshan, Dhaka",
    rating: 4.6,
    phone: "+880 2 8836000",
    departments: ["Emergency", "Cardiology", "Nephrology", "ICU"],
    beds: { total: 500, available: 90 },
    icu: { total: 45, available: 7 },
    emergency: true,
    bloodBank: ["O+", "A+", "B+", "AB+"],
    coord: { x: 62, y: 25 },
  },
  {
    id: "h-labaid",
    name: "Labaid Specialized Hospital",
    tier: "B",
    distanceKm: 5.2,
    etaMin: 16,
    address: "House 1, Road 4, Dhanmondi, Dhaka",
    rating: 4.4,
    phone: "+880 2 9676356",
    departments: ["Emergency", "Diagnostics", "Cardiology", "General"],
    beds: { total: 250, available: 30 },
    icu: { total: 20, available: 3 },
    emergency: true,
    bloodBank: ["O+", "A+", "B+"],
    coord: { x: 30, y: 60 },
  },
  {
    id: "h-dmch",
    name: "Dhaka Medical College Hospital",
    tier: "B",
    distanceKm: 6.0,
    etaMin: 19,
    address: "Secretariat Rd, Dhaka",
    rating: 4.1,
    phone: "+880 2 55165088",
    departments: ["Emergency", "Trauma", "General", "ICU"],
    beds: { total: 2300, available: 150 },
    icu: { total: 60, available: 5 },
    emergency: true,
    bloodBank: ["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"],
    coord: { x: 45, y: 70 },
  },
  {
    id: "h-ibnsina",
    name: "Ibn Sina Hospital",
    tier: "C",
    distanceKm: 7.1,
    etaMin: 22,
    address: "House 48, Road 9/A, Dhanmondi, Dhaka",
    rating: 4.3,
    phone: "+880 2 9611315",
    departments: ["General", "Orthopedics", "Diagnostics"],
    beds: { total: 150, available: 18 },
    icu: { total: 10, available: 1 },
    emergency: false,
    bloodBank: ["O+", "A+"],
    coord: { x: 20, y: 45 },
  },
];
export type Ambulance = {
  id: string;
  callSign: string;
  reg: string;
  provider: string;
  driver: string;
  type: "ALS" | "BLS" | "Critical Care";
  crew: string;
  etaMin: number;
  distanceKm: number;
  phone: string;
  status: "available" | "en_route" | "on_scene" | "returning";
};

export const ambulances: Ambulance[] = [
  {
    id: "a-01",
    callSign: "Unit 12",
    reg: "Dhaka Metro Cha 11-1111",
    provider: "MedLink Emergency Services",
    driver: "Md. Kamal Hossain",
    type: "ALS",
    crew: "Medical Officer Dr. Farhan Kabir · Paramedic Rakib Hasan",
    etaMin: 4,
    distanceKm: 1.1,
    phone: "+880 1712-334455",
    status: "available",
  },
  {
    id: "a-02",
    callSign: "Unit 07",
    reg: "Dhaka Metro Cha 22-4519",
    provider: "City Care Ambulance",
    driver: "Md. Rashed Mia",
    type: "BLS",
    crew: "EMT Shanto Das · EMT Jannatul Ferdous",
    etaMin: 6,
    distanceKm: 2.3,
    phone: "+880 1819-776543",
    status: "available",
  },
  {
    id: "a-03",
    callSign: "Unit 21",
    reg: "Dhaka Metro Cha 33-7802",
    provider: "LifeLine Rescue",
    driver: "Md. Sohel Rana",
    type: "BLS",
    crew: "EMT Rakib Hasan · Emergency Care Assistant Nur Islam",
    etaMin: 9,
    distanceKm: 3.4,
    phone: "+880 1933-220087",
    status: "en_route",
  },
];


export type EmergencyCase = {
  id: string;
  patient: string;
  age: number;
  severity: Severity;
  summary: string;
  symptoms: string[];
  eta: string;
  hospital: string;
  ambulance: string;
  status: "incoming" | "en_route" | "on_scene" | "arrived" | "completed";
  createdAt: string;
};

export const emergencyQueue: EmergencyCase[] = [
  { id: "e-9021", patient: "Eleanor Chen", age: 74, severity: "critical", summary: "Suspected acute myocardial infarction. Chest pain 25 min, radiating to left arm, diaphoretic. Aspirin 325mg given.", symptoms: ["Chest pain", "Shortness of breath", "Diaphoresis"], eta: "6 min", hospital: "St. Mercy", ambulance: "Unit 12", status: "en_route", createdAt: "2m ago" },
  { id: "e-9020", patient: "Marcus Reid", age: 42, severity: "high", summary: "Motor vehicle collision. Conscious, complaining of pelvic pain. C-spine immobilized.", symptoms: ["Trauma", "Pelvic pain", "BP 96/58"], eta: "12 min", hospital: "St. Mercy", ambulance: "Unit 07", status: "en_route", createdAt: "5m ago" },
  { id: "e-9019", patient: "Amelia Osei", age: 31, severity: "moderate", summary: "Severe asthma exacerbation. SpO₂ 91%. Nebulizer in progress.", symptoms: ["Wheezing", "SpO₂ 91%"], eta: "9 min", hospital: "St. Mercy", ambulance: "Unit 21", status: "on_scene", createdAt: "8m ago" },
  { id: "e-9018", patient: "Jordan Vale", age: 58, severity: "low", summary: "Laceration to left forearm, controlled bleeding. Stable vitals.", symptoms: ["Laceration"], eta: "—", hospital: "St. Mercy", ambulance: "—", status: "arrived", createdAt: "18m ago" },
];

export const patient = {
  name: "Shirley Ramirez",
  age: 34,
  bloodType: "O+",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Asthma"],
  medications: ["Albuterol inhaler", "Vitamin D"],
  emergencyContact: { name: "Miguel Ramirez", relation: "Spouse", phone: "+1 (415) 555-0007" },
  insurance: "BlueShield · Plan #A-90124",
};

export const notifications = [
  { id: "n1", title: "Ambulance dispatched", body: "Unit 12 is 4 min away. Track live.", time: "just now", tone: "emergency" as const },
  { id: "n2", title: "Bed reserved at St. Mercy", body: "Emergency Bay 3 is being prepared.", time: "1m ago", tone: "success" as const },
  { id: "n3", title: "AI first-aid ready", body: "Tap to review instructions for chest pain.", time: "2m ago", tone: "info" as const },
  { id: "n4", title: "Lab results available", body: "Your blood panel from Apr 18 is ready.", time: "yesterday", tone: "muted" as const },
];

export const analytics = {
  totalCases: 1284,
  avgResponse: 6.4, // min
  bedsUtilization: 0.72,
  icuUtilization: 0.81,
  weekly: [
    { day: "Mon", cases: 142, response: 6.8 },
    { day: "Tue", cases: 168, response: 6.2 },
    { day: "Wed", cases: 155, response: 6.9 },
    { day: "Thu", cases: 189, response: 5.9 },
    { day: "Fri", cases: 221, response: 6.4 },
    { day: "Sat", cases: 240, response: 7.1 },
    { day: "Sun", cases: 169, response: 6.0 },
  ],
  bySeverity: [
    { name: "Critical", value: 18, color: "var(--color-emergency)" },
    { name: "High", value: 32, color: "var(--color-warning)" },
    { name: "Moderate", value: 30, color: "var(--color-info)" },
    { name: "Low", value: 20, color: "var(--color-primary)" },
  ],
};

export const organizations = [
  { id: "o1", name: "St. Mercy Medical Center", type: "Hospital", city: "San Francisco", status: "active", cases: 412 },
  { id: "o2", name: "Northshore Regional", type: "Hospital", city: "Oakland", status: "active", cases: 289 },
  { id: "o3", name: "Metro Heart Institute", type: "Specialty", city: "San Jose", status: "active", cases: 176 },
  { id: "o4", name: "BayRescue EMS", type: "Ambulance", city: "San Francisco", status: "active", cases: 522 },
  { id: "o5", name: "Lakeside Community", type: "Hospital", city: "Berkeley", status: "pending", cases: 0 },
];

export const severityStyle = (s: Severity) => {
  switch (s) {
    case "critical": return { bg: "bg-emergency/10", text: "text-emergency", ring: "ring-emergency/30", dot: "bg-emergency" };
    case "high":     return { bg: "bg-warning/10",   text: "text-warning",   ring: "ring-warning/30",   dot: "bg-warning" };
    case "moderate": return { bg: "bg-info/10",      text: "text-info",      ring: "ring-info/30",      dot: "bg-info" };
    case "low":      return { bg: "bg-primary/10",   text: "text-primary",   ring: "ring-primary/30",   dot: "bg-primary" };
  }
};

/* ─────────────────────────────────────────────────────────────
   MedLink service requests, bookings & payments (demo data)
   ───────────────────────────────────────────────────────────── */

export type RequestKind =
  | "consultation"
  | "diagnostic"
  | "bed"
  | "icu"
  | "emergency";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "scheduled"
  | "completed"
  | "cancelled";

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
  charge: number;        // hospital charge
  serviceFee: number;    // MedLink fee
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
  { id: "r-4821", kind: "consultation", title: "Cardiology Consultation", hospital: "St. Mercy Medical Center", department: "Cardiology", patient: "Shirley Ramirez", doctor: "Dr. Amara Okafor", date: "Jul 29, 2026", time: "10:30", status: "confirmed", charge: 120, serviceFee: 6, payment: "unpaid" },
  { id: "r-4820", kind: "diagnostic", title: "MRI · Lumbar Spine", hospital: "Northshore Regional Hospital", department: "Radiology", patient: "Shirley Ramirez", date: "Jul 30, 2026", time: "14:00", status: "accepted", charge: 340, serviceFee: 17, payment: "pending" },
  { id: "r-4818", kind: "bed", title: "General Ward Bed", hospital: "Lakeside Community Hospital", department: "General Medicine", patient: "Shirley Ramirez", date: "Jul 26, 2026", time: "08:15", status: "completed", charge: 210, serviceFee: 11, payment: "paid" },
  { id: "r-4815", kind: "emergency", title: "Emergency SOS · Asthma", hospital: "St. Mercy Medical Center", department: "Emergency", patient: "Shirley Ramirez", date: "Jul 18, 2026", time: "22:41", status: "completed", charge: 480, serviceFee: 24, payment: "unpaid" },
  { id: "r-4809", kind: "icu", title: "ICU Reservation", hospital: "Metro Heart Institute", department: "Critical Care", patient: "Shirley Ramirez", date: "Jun 30, 2026", time: "03:20", status: "cancelled", charge: 0, serviceFee: 0, payment: "unpaid" },
  { id: "r-4802", kind: "consultation", title: "Pulmonology Follow-up", hospital: "St. Mercy Medical Center", department: "Pulmonology", patient: "Shirley Ramirez", doctor: "Dr. Neel Varma", date: "Jun 12, 2026", time: "16:00", status: "completed", charge: 95, serviceFee: 5, payment: "paid" },
];

/* Hospital-side inbox — multiple patients */
export const hospitalRequests: ServiceRequest[] = [
  { id: "h-7712", kind: "consultation", title: "Cardiology Consultation", hospital: "St. Mercy Medical Center", department: "Cardiology", patient: "Eleanor Chen", doctor: "Dr. Amara Okafor", date: "Jul 28, 2026", time: "09:10", status: "pending", charge: 120, serviceFee: 6, payment: "unpaid" },
  { id: "h-7711", kind: "diagnostic", title: "CT Scan · Head", hospital: "St. Mercy Medical Center", department: "Radiology", patient: "Marcus Reid", date: "Jul 28, 2026", time: "09:35", status: "pending", charge: 290, serviceFee: 15, payment: "unpaid" },
  { id: "h-7710", kind: "icu", title: "ICU Reservation", hospital: "St. Mercy Medical Center", department: "Critical Care", patient: "Amelia Osei", date: "Jul 28, 2026", time: "10:02", status: "accepted", charge: 640, serviceFee: 32, payment: "pending" },
  { id: "h-7709", kind: "bed", title: "General Ward Bed", hospital: "St. Mercy Medical Center", department: "General Medicine", patient: "Jordan Vale", date: "Jul 28, 2026", time: "10:20", status: "confirmed", charge: 210, serviceFee: 11, payment: "pending" },
  { id: "h-7708", kind: "emergency", title: "Emergency SOS · Chest pain", hospital: "St. Mercy Medical Center", department: "Emergency", patient: "Shirley Ramirez", date: "Jul 28, 2026", time: "10:44", status: "accepted", charge: 480, serviceFee: 24, payment: "unpaid" },
  { id: "h-7705", kind: "consultation", title: "Neurology Consultation", hospital: "St. Mercy Medical Center", department: "Neurology", patient: "Priya Raman", doctor: "Dr. Luis Mendes", date: "Jul 27, 2026", time: "15:30", status: "completed", charge: 150, serviceFee: 8, payment: "collected" },
  { id: "h-7701", kind: "diagnostic", title: "Blood Panel · Full", hospital: "St. Mercy Medical Center", department: "Laboratory", patient: "Tom Byrne", date: "Jul 26, 2026", time: "11:05", status: "completed", charge: 80, serviceFee: 4, payment: "settled" },
  { id: "h-7699", kind: "bed", title: "Post-op Bed", hospital: "St. Mercy Medical Center", department: "Surgery", patient: "Naomi Fisher", date: "Jul 26, 2026", time: "07:45", status: "completed", charge: 260, serviceFee: 13, payment: "settled" },
];

export const statusStyle = (s: RequestStatus) => {
  switch (s) {
    case "pending":   return { cls: "bg-warning/10 text-warning", label: "Pending" };
    case "accepted":  return { cls: "bg-info/10 text-info", label: "Accepted" };
    case "confirmed": return { cls: "bg-primary/10 text-primary", label: "Confirmed" };
    case "scheduled": return { cls: "bg-primary/10 text-primary", label: "Scheduled" };
    case "completed": return { cls: "bg-success/10 text-success", label: "Completed" };
    case "cancelled": return { cls: "bg-muted text-muted-foreground", label: "Cancelled" };
  }
};

export const paymentStyle = (p: PaymentStatus) => {
  switch (p) {
    case "unpaid":    return { cls: "bg-emergency/10 text-emergency", label: "Unpaid" };
    case "pending":   return { cls: "bg-warning/10 text-warning", label: "Pending payment" };
    case "paid":      return { cls: "bg-success/10 text-success", label: "Paid" };
    case "collected": return { cls: "bg-info/10 text-info", label: "Collected" };
    case "settled":   return { cls: "bg-success/10 text-success", label: "Settled" };
  }
};
