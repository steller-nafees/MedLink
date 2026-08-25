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