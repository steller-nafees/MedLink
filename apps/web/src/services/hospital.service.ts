import type { BedCapacitySummary, EmergencyCase, HospitalWard, Severity } from "@/types/hospital";

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