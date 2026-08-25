export type EmergencyCaseStatus =
  | "pending"
  | "dispatched"
  | "en-route"
  | "completed"
  | "arrived";

export type EmergencyCase = {
  id: string;
  status: EmergencyCaseStatus;
};

export type HospitalUser = {
  name: string;
  role: string;
};