export type EmergencyCaseStatus =
  | "incoming"
  | "pending"
  | "accepted"
  | "dispatched"
  | "en-route"
  | "on_scene"
  | "completed"
  | "arrived";

export type Severity = "critical" | "high" | "moderate" | "low";

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
  status: EmergencyCaseStatus;
  createdAt: string;
};

export type HospitalUser = {
  name: string;
  role: string;
};

export type BedTone = "primary" | "emergency" | "info" | "warning";

export type BedUnit = {
  id: number;
  occupied: boolean;
};

export type HospitalWard = {
  name: string;
  beds: BedUnit[];
  tone: BedTone;
};

export type BedCapacitySummary = {
  label: string;
  value: number;
  available: number;
  tone: BedTone;
};

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

export type EmergencyRequest = {
  id: string;
  patientName: string;
  urgency: "critical" | "moderate" | "stable";
  complaint: string;
  address: string;
  distanceKm: number;
  requestedAgoMin: number;
  status: "pending" | "assigned";
  assignedAmbulanceId?: string;
};

export type ReservationKind = "bed" | "icu";
export type ReservationStatus = "pending" | "accepted" | "confirmed" | "completed" | "cancelled";

export type HospitalReservation = {
  id: string;
  kind: ReservationKind;
  title: string;
  department: string;
  patient: string;
  date: string;
  time: string;
  status: ReservationStatus;
  charge: number;
  serviceFee: number;
  payment: "unpaid" | "pending" | "collected" | "settled";
};

export type HospitalRequestKind = "consultation" | "diagnostic" | "bed" | "icu" | "emergency";
export type HospitalRequestStatus = "pending" | "accepted" | "confirmed" | "scheduled" | "completed" | "cancelled";
export type HospitalRequestPayment = "unpaid" | "pending" | "paid" | "collected" | "settled";

export type HospitalServiceRequest = {
  id: string;
  kind: HospitalRequestKind;
  title: string;
  hospital: string;
  department: string;
  patient: string;
  doctor?: string;
  date: string;
  time: string;
  status: HospitalRequestStatus;
  charge: number;
  serviceFee: number;
  payment: HospitalRequestPayment;
};