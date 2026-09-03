import { api } from "./api";
import type { Ambulance, BedCapacitySummary, EmergencyCase, EmergencyRequest, HospitalRequestPayment, HospitalRequestStatus, HospitalReservation, HospitalServiceRequest, HospitalWard, Severity } from "@/types/hospital";

type ApiResponse<T> = { data: T };

export type HospitalDashboard = {
  hospital_id: string;
  hospital_name: string;
  hospital_status: string;
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  maintenance_beds: number;
  total_icu_beds: number;
  available_icu_beds: number;
  pending_reservations: number;
  active_cases: number;
};

export type HospitalDashboardAnalytics = {
  weekly: { day: string; incoming: number; completed: number; rejected: number }[];
  bySeverity: { name: "Critical" | "High" | "Moderate" | "Low"; value: number }[];
};

export type HospitalBed = {
  bed_id: string;
  bed_number: string | number;
  bed_status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  ward_id: string;
  ward_name: string;
};

export type HospitalActiveCase = {
  event_id: string;
  user_id: string;
  user_description: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  event_location_latitude?: number | null;
  event_location_longitude?: number | null;
  severity: string;
  event_status: string;
  is_emergency: boolean;
  created_at: string;
};

export type HospitalReservationRecord = {
  reservation_id: string;
  medical_event_id: string;
  user_id: string;
  hospital_id: string;
  ward_id: string;
  bed_id: string | null;
  reservation_mode: string;
  reservation_status: string;
  requested_at: string;
  approved_at: string | null;
  event_updated_at?: string | null;
  created_at: string;
  updated_at: string;
  user_description?: string | null;
  patient_first_name?: string | null;
  patient_last_name?: string | null;
  severity?: string | null;
  event_status?: string | null;
  is_emergency?: boolean;
  ward_name?: string | null;
  bed_number?: string | number | null;
  bed_status?: string | null;
};

export type HospitalPayment = {
  payment_id: string;
  reservation_id: string;
  total_amount: number | string;
  payment_method: string | null;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
  patient_id: string;
  patient_first_name?: string;
  patient_last_name?: string;
  reservation_mode: string;
  reservation_status: string;
  ward_name?: string | null;
  bed_number?: string | number | null;
};

export async function getHospitalDashboard() {
  const response = await api.get<ApiResponse<HospitalDashboard>>("/hospital/dashboard");
  return response.data.data;
}

export async function getHospitalDashboardAnalytics() {
  const response = await api.get<ApiResponse<HospitalDashboardAnalytics>>("/hospital/dashboard/analytics");
  return response.data.data;
}

export async function getMyHospital() {
  const response = await api.get<ApiResponse<{ name: string; hospital_id: string }>>("/hospital/my-hospital");
  return response.data.data;
}

export async function getActiveCases() {
  const response = await api.get<ApiResponse<HospitalActiveCase[]>>("/hospital/dashboard/active-cases");
  return response.data.data;
}

export async function approveEmergencyCase(eventId: string) {
  const response = await api.put<ApiResponse<HospitalActiveCase>>(`/hospital/dashboard/active-cases/${eventId}/approve`);
  return response.data.data;
}

export async function completeEmergencyCase(eventId: string) {
  const response = await api.put<ApiResponse<HospitalActiveCase>>(`/hospital/dashboard/active-cases/${eventId}/complete`);
  return response.data.data;
}

export async function getHospitalBedsFromApi() {
  const response = await api.get<ApiResponse<HospitalBed[]>>("/hospital/beds");
  return response.data.data;
}

export async function updateBedStatus(bedId: string, bedStatus: HospitalBed["bed_status"]) {
  const response = await api.put<ApiResponse<HospitalBed>>(`/hospital/beds/${bedId}/status`, { bedStatus });
  return response.data.data;
}

export async function getHospitalReservationsFromApi() {
  const response = await api.get<ApiResponse<HospitalReservationRecord[]>>("/hospital/reservations");
  return response.data.data;
}

export async function approveReservation(reservationId: string) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(`/hospital/reservations/${reservationId}/approve`);
  return response.data.data;
}

export async function assignBedToEvent(eventId: string, bedNumber: string | number) {
  const response = await api.put<ApiResponse<Record<string, unknown>>>(`/hospital/dashboard/active-cases/${eventId}/assign-bed`, { bedNumber });
  return response.data.data;
}

export async function getHospitalPaymentsFromApi() {
  const response = await api.get<ApiResponse<HospitalPayment[]>>("/hospital/payments");
  return response.data.data;
}

export async function createHospitalPayment(input: {
  reservationId: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "PAID";
}) {
  const response = await api.post<ApiResponse<HospitalPayment>>("/hospital/payments", input);
  return response.data.data;
}

export async function getHospitalIncomingRequests() {
  const [hospital, reservations, activeCases, payments] = await Promise.all([
    getMyHospital().catch(() => null),
    getHospitalReservationsFromApi() as Promise<HospitalReservationRecord[]>,
    getActiveCases(),
    getHospitalPaymentsFromApi().catch(() => [] as HospitalPayment[]),
  ]);
  const hospitalName = hospital?.name ?? "Assigned hospital";
  const paymentsByReservation = new Map(payments.map((payment) => [payment.reservation_id, payment]));
  const reservationRequests = reservations.map((reservation) =>
    mapReservationToRequest(reservation, hospitalName, paymentsByReservation.get(reservation.reservation_id)),
  );
  const emergencyRequests = activeCases
    .filter((activeCase) => activeCase.is_emergency)
    .map((activeCase) => mapActiveCaseToRequest(activeCase, hospitalName));

  return [...emergencyRequests, ...reservationRequests].sort((left, right) => {
    const leftDate = "createdAt" in left ? Date.parse(String(left.createdAt)) : 0;
    const rightDate = "createdAt" in right ? Date.parse(String(right.createdAt)) : 0;
    return rightDate - leftDate;
  });
}

function mapReservationToRequest(
  reservation: HospitalReservationRecord,
  hospitalName: string,
  payment?: HospitalPayment,
): HospitalServiceRequest {
  const requestedAt = parseApiDate(reservation.requested_at ?? reservation.created_at);
  const mode = reservation.reservation_mode?.toLowerCase() ?? "";
  const kind = mode.includes("icu") ? "icu" : "bed";
  const wardName = reservation.ward_name ?? "Hospital ward";
  const patientName = [reservation.patient_first_name, reservation.patient_last_name].filter(Boolean).join(" ") || "Unnamed patient";
  const bedLabel = reservation.bed_number ? ` · Bed ${reservation.bed_number}` : "";

  return {
    id: reservation.reservation_id,
    kind,
    title: kind === "icu" ? "ICU Reservation" : "Bed Reservation",
    hospital: hospitalName,
    department: wardName,
    patient: patientName,
    date: requestedAt.date,
    time: requestedAt.time,
    status: mapReservationStatus(reservation.reservation_status),
    charge: Number(payment?.total_amount ?? 0),
    serviceFee: 0,
    payment: mapPaymentStatus(payment?.payment_status),
    createdAt: reservation.created_at,
    requestedAt: reservation.requested_at,
    approvedAt: reservation.approved_at,
    patientId: reservation.user_id,
    medicalEventId: reservation.medical_event_id,
    ward: wardName,
    bed: reservation.bed_number ? String(reservation.bed_number) : undefined,
    bedStatus: reservation.bed_status,
    severity: reservation.severity,
    eventStatus: reservation.event_status,
    description: `${reservation.user_description ?? "Reservation request"}${bedLabel}`,
  } as HospitalServiceRequest;
}

function mapActiveCaseToRequest(activeCase: HospitalActiveCase, hospitalName: string): HospitalServiceRequest {
  const createdAt = parseApiDate(activeCase.created_at);
  const patientName = [activeCase.first_name, activeCase.last_name].filter(Boolean).join(" ") || `Patient ${activeCase.user_id.slice(0, 8)}`;
  return {
    id: activeCase.event_id,
    kind: "emergency",
    title: "Emergency SOS",
    hospital: hospitalName,
    department: "Emergency",
    patient: patientName,
    date: createdAt.date,
    time: createdAt.time,
    status: mapEventStatus(activeCase.event_status),
    charge: 0,
    serviceFee: 0,
    payment: "unpaid",
    createdAt: activeCase.created_at,
    patientId: activeCase.user_id,
    phone: activeCase.phone ?? undefined,
    severity: activeCase.severity,
    eventStatus: activeCase.event_status,
    location: [activeCase.event_location_latitude, activeCase.event_location_longitude].filter(Boolean).join(", "),
    description: activeCase.user_description ?? "Active emergency case",
  } as HospitalServiceRequest;
}

function parseApiDate(value?: string | null) {
  if (!value) return { date: "—", time: "—" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value.slice(0, 10), time: "—" };
  return {
    date: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function mapReservationStatus(status?: string | null): HospitalRequestStatus {
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "CONFIRMED":
      return "confirmed";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
    case "CANCELED":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapEventStatus(status?: string | null): HospitalRequestStatus {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
    case "CANCELED":
      return "cancelled";
    case "ACTIVE":
    case "PENDING":
      return "pending";
    default:
      return "accepted";
  }
}

function mapPaymentStatus(status?: string | null): HospitalRequestPayment {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "paid";
    case "COLLECTED":
      return "collected";
    case "SETTLED":
      return "settled";
    case "PENDING":
      return "pending";
    default:
      return "unpaid";
  }
}

const ambulances: Ambulance[] = [
  { id: "a-01", callSign: "Unit 12", reg: "Dhaka Metro Cha 11-1111", provider: "MedLink Emergency Services", driver: "Md. Kamal Hossain", type: "ALS", crew: "Medical Officer Dr. Farhan Kabir · Paramedic Rakib Hasan", etaMin: 4, distanceKm: 1.1, phone: "+880 1712-334455", status: "available" },
  { id: "a-02", callSign: "Unit 07", reg: "Dhaka Metro Cha 22-4519", provider: "City Care Ambulance", driver: "Md. Rashed Mia", type: "BLS", crew: "EMT Shanto Das · EMT Jannatul Ferdous", etaMin: 6, distanceKm: 2.3, phone: "+880 1819-776543", status: "available" },
  { id: "a-03", callSign: "Unit 21", reg: "Dhaka Metro Cha 33-7802", provider: "LifeLine Rescue", driver: "Md. Sohel Rana", type: "BLS", crew: "EMT Rakib Hasan · Emergency Care Assistant Nur Islam", etaMin: 9, distanceKm: 3.4, phone: "+880 1933-220087", status: "en_route" },
];

const emergencyRequests: EmergencyRequest[] = [
  { id: "req-1", patientName: "Rahim Chowdhury", urgency: "critical", complaint: "Chest pain, difficulty breathing", address: "Road 12, Banani", distanceKm: 3.1, requestedAgoMin: 2, status: "pending" },
  { id: "req-2", patientName: "Nusrat Jahan", urgency: "moderate", complaint: "Fall injury, suspected fracture", address: "Mirpur DOHS", distanceKm: 6.4, requestedAgoMin: 6, status: "pending" },
  { id: "req-3", patientName: "Kamal Hossain", urgency: "stable", complaint: "Scheduled dialysis transport", address: "Uttara Sector 7", distanceKm: 9.8, requestedAgoMin: 14, status: "pending" },
];

const hospitalReservations: HospitalReservation[] = [
  { id: "h-7710", kind: "icu", title: "ICU Reservation", department: "Critical Care", patient: "Amelia Osei", date: "Jul 28, 2026", time: "10:02", status: "accepted", charge: 640, serviceFee: 32, payment: "pending" },
  { id: "h-7709", kind: "bed", title: "General Ward Bed", department: "General Medicine", patient: "Jordan Vale", date: "Jul 28, 2026", time: "10:20", status: "confirmed", charge: 210, serviceFee: 11, payment: "pending" },
  { id: "h-7705", kind: "bed", title: "Post-op Bed", department: "Surgery", patient: "Naomi Fisher", date: "Jul 26, 2026", time: "07:45", status: "completed", charge: 260, serviceFee: 13, payment: "settled" },
];

const hospitalRequests: HospitalServiceRequest[] = [
  { id: "h-7712", kind: "consultation", title: "Cardiology Consultation", hospital: "St. Mercy Medical Center", department: "Cardiology", patient: "Eleanor Chen", doctor: "Dr. Amara Okafor", date: "Jul 28, 2026", time: "09:10", status: "pending", charge: 120, serviceFee: 6, payment: "unpaid" },
  { id: "h-7711", kind: "diagnostic", title: "CT Scan · Head", hospital: "St. Mercy Medical Center", department: "Radiology", patient: "Marcus Reid", date: "Jul 28, 2026", time: "09:35", status: "pending", charge: 290, serviceFee: 15, payment: "unpaid" },
  { id: "h-7710", kind: "icu", title: "ICU Reservation", hospital: "St. Mercy Medical Center", department: "Critical Care", patient: "Amelia Osei", date: "Jul 28, 2026", time: "10:02", status: "accepted", charge: 640, serviceFee: 32, payment: "pending" },
  { id: "h-7709", kind: "bed", title: "General Ward Bed", hospital: "St. Mercy Medical Center", department: "General Medicine", patient: "Jordan Vale", date: "Jul 28, 2026", time: "10:20", status: "confirmed", charge: 210, serviceFee: 11, payment: "pending" },
  { id: "h-7708", kind: "emergency", title: "Emergency SOS · Chest pain", hospital: "St. Mercy Medical Center", department: "Emergency", patient: "Shirley Ramirez", date: "Jul 28, 2026", time: "10:44", status: "accepted", charge: 480, serviceFee: 24, payment: "unpaid" },
  { id: "h-7705", kind: "consultation", title: "Neurology Consultation", hospital: "St. Mercy Medical Center", department: "Neurology", patient: "Priya Raman", doctor: "Dr. Luis Mendes", date: "Jul 27, 2026", time: "15:30", status: "completed", charge: 150, serviceFee: 8, payment: "collected" },
  { id: "h-7701", kind: "diagnostic", title: "Blood Panel · Full", hospital: "St. Mercy Medical Center", department: "Laboratory", patient: "Tom Byrne", date: "Jul 26, 2026", time: "11:05", status: "completed", charge: 80, serviceFee: 4, payment: "settled" },
  { id: "h-7699", kind: "bed", title: "Post-op Bed", hospital: "St. Mercy Medical Center", department: "Surgery", patient: "Naomi Fisher", date: "Jul 26, 2026", time: "07:45", status: "completed", charge: 260, serviceFee: 13, payment: "settled" },
];

const emergencyCases: EmergencyCase[] = [
  { id: "e-9021", patient: "Eleanor Chen", age: 74, severity: "critical", summary: "Suspected acute myocardial infarction. Chest pain 25 min, radiating to left arm, diaphoretic. Aspirin 325mg given.", symptoms: ["Chest pain", "Shortness of breath", "Diaphoresis"], eta: "6 min", hospital: "St. Mercy", ambulance: "Unit 12", status: "en-route", createdAt: "2m ago" },
  { id: "e-9020", patient: "Marcus Reid", age: 42, severity: "high", summary: "Motor vehicle collision. Conscious, complaining of pelvic pain. C-spine immobilized.", symptoms: ["Trauma", "Pelvic pain", "BP 96/58"], eta: "12 min", hospital: "St. Mercy", ambulance: "Unit 07", status: "en-route", createdAt: "5m ago" },
  { id: "e-9019", patient: "Amelia Osei", age: 31, severity: "moderate", summary: "Severe asthma exacerbation. SpO₂ 91%. Nebulizer in progress.", symptoms: ["Wheezing", "SpO₂ 91%"], eta: "9 min", hospital: "St. Mercy", ambulance: "Unit 21", status: "on_scene", createdAt: "8m ago" },
  { id: "e-9018", patient: "Jordan Vale", age: 58, severity: "low", summary: "Laceration to left forearm, controlled bleeding. Stable vitals.", symptoms: ["Laceration"], eta: "—", hospital: "St. Mercy", ambulance: "—", status: "arrived", createdAt: "18m ago" },
];

function makeBeds(total: number, occupied: number) {
  return Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    occupied: index < occupied,
  }));
}

const bedCapacity: BedCapacitySummary[] = [
  { label: "Total beds", value: 300, available: 58, tone: "primary" },
  { label: "ICU beds", value: 40, available: 9, tone: "emergency" },
  { label: "Emergency bays", value: 8, available: 5, tone: "warning" },
];

const hospitalWards: HospitalWard[] = [
  { name: "Emergency Bays", beds: makeBeds(8, 3), tone: "emergency" },
  { name: "General Ward A", beds: makeBeds(24, 18), tone: "primary" },
  { name: "General Ward B", beds: makeBeds(24, 15), tone: "primary" },
  { name: "ICU", beds: makeBeds(12, 8), tone: "emergency" },
  { name: "Pediatrics", beds: makeBeds(16, 6), tone: "info" },
];

export function getAmbulances(): Ambulance[] {
  return ambulances;
}

export function getEmergencyRequests(): EmergencyRequest[] {
  return emergencyRequests;
}

export function getHospitalReservations(): HospitalReservation[] {
  return hospitalReservations;
}

export function getBedCapacity(): BedCapacitySummary[] {
  return bedCapacity;
}

export function getHospitalWards(): HospitalWard[] {
  return hospitalWards;
}

export function getEmergencyCases(): EmergencyCase[] {
  return emergencyCases;
}

export function getOpenEmergencyCount(): number {
  return getEmergencyCases().filter(
    (emergencyCase) =>
      emergencyCase.status !== "completed" &&
      emergencyCase.status !== "arrived",
  ).length;
}

export function severityStyle(severity: Severity) {
  switch (severity) {
    case "critical": return { bg: "severity-critical", text: "severity-critical-text" };
    case "high": return { bg: "severity-high", text: "severity-high-text" };
    case "moderate": return { bg: "severity-moderate", text: "severity-moderate-text" };
    case "low": return { bg: "severity-low", text: "severity-low-text" };
  }
}

export function getHospitalRequests(): HospitalServiceRequest[] {
  return hospitalRequests;
}
