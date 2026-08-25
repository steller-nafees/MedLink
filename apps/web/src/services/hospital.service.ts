import type { Ambulance, BedCapacitySummary, EmergencyCase, EmergencyRequest, HospitalReservation, HospitalServiceRequest, HospitalWard, Severity } from "@/types/hospital";

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