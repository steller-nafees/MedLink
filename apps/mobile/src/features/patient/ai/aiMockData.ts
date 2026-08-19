export type CardKind = "consultation" | "doctor" | "hospital" | "test" | "medicine" | "advice" | "vaccine" | "report";

export const promptSeeds = [
  { label: "I have a fever & sore throat", icon: "Thermometer", kind: "consultation", query: "I have had a fever and sore throat for two days." },
  { label: "Find a cardiologist", icon: "HeartPulse", kind: "doctor", query: "I need a heart specialist." },
  { label: "CBC blood test near me", icon: "FlaskConical", kind: "test", query: "I need to do a CBC blood test." },
  { label: "Hospitals with MRI", icon: "Building2", kind: "hospital", query: "Which hospitals have MRI facilities?" },
  { label: "About Paracetamol", icon: "Pill", kind: "medicine", query: "Tell me about Paracetamol." },
  { label: "Lower blood pressure naturally", icon: "Salad", kind: "advice", query: "How can I reduce high blood pressure naturally?" },
  { label: "Newborn vaccines", icon: "Syringe", kind: "vaccine", query: "Which vaccines does a newborn need?" },
  { label: "Explain my blood test", icon: "FileText", kind: "report", query: "Explain my blood test results." },
] as const;

export const quickChips = ["I have a fever", "Find a cardiologist", "I need a CBC test", "Find MRI facilities", "Explain my blood report", "Vaccination schedule", "Healthy diet tips", "Manage diabetes"];

export const doctors = [
  { name: "Dr. Rajiv Menon", spec: "Cardiologist · MD, DM", hosp: "Metro Heart Institute", exp: 18, rating: 4.9, fee: 45, dist: 2.1, today: true, initials: "RM" },
  { name: "Dr. Sofia Alves", spec: "Cardiologist · MD", hosp: "St. Mercy Medical", exp: 12, rating: 4.8, fee: 40, dist: 3.4, today: true, initials: "SA" },
  { name: "Dr. Kenji Tanaka", spec: "Interventional Cardio", hosp: "Northshore Regional", exp: 22, rating: 4.9, fee: 60, dist: 4.8, today: false, initials: "KT" },
];
export const hospitals = [
  { name: "St. Mercy Medical Center", dist: 1.8, services: ["MRI", "CT", "X-Ray", "Lab"], icu: 6, wait: "12 min", price: 220 },
  { name: "Northshore Regional", dist: 3.2, services: ["MRI", "X-Ray", "Lab"], icu: 9, wait: "20 min", price: 190 },
  { name: "Metro Heart Institute", dist: 5.1, services: ["MRI", "CT", "Cath Lab"], icu: 4, wait: "8 min", price: 260 },
];
export const centers = [
  { name: "St. Mercy Lab", price: 18, wait: "15 min", dist: 1.8, home: true },
  { name: "PathCare Diagnostics", price: 15, wait: "10 min", dist: 2.4, home: true },
  { name: "Northshore Lab", price: 22, wait: "25 min", dist: 3.2, home: false },
];
export const vaccineTimeline = [
  { age: "At birth", vaccines: [{ name: "BCG", purpose: "Tuberculosis" }, { name: "Hep B (1st)", purpose: "Hepatitis B" }, { name: "OPV-0", purpose: "Polio" }] },
  { age: "6 weeks", vaccines: [{ name: "DTP-1", purpose: "Diphtheria, Tetanus, Pertussis" }, { name: "Hib-1", purpose: "Influenzae B" }, { name: "Rotavirus-1", purpose: "Rotavirus" }] },
  { age: "10 weeks", vaccines: [{ name: "DTP-2", purpose: "Second dose" }, { name: "IPV-1", purpose: "Polio (injected)" }] },
  { age: "14 weeks", vaccines: [{ name: "DTP-3", purpose: "Third dose" }, { name: "PCV", purpose: "Pneumococcal" }] },
  { age: "9 months", vaccines: [{ name: "MMR-1", purpose: "Measles, Mumps, Rubella" }] },
];
export const reportFindings = [
  { label: "Hemoglobin", value: "11.2 g/dL", range: "12–16", status: "Low" }, { label: "WBC", value: "7.8 K/µL", range: "4–11", status: "Normal" }, { label: "Platelets", value: "265 K/µL", range: "150–400", status: "Normal" }, { label: "Vitamin D", value: "18 ng/mL", range: "30–100", status: "Low" }, { label: "Cholesterol", value: "220 mg/dL", range: "<200", status: "High" },
] as const;

export function inferKind(query: string): CardKind { const s = query.toLowerCase(); if (/(cardio|heart specialist|doctor|specialist|neurolog|dermatolog)/.test(s)) return "doctor"; if (/(mri|ct scan|x-?ray|hospital)/.test(s)) return "hospital"; if (/(test|cbc|blood test|lab|diagnostic)/.test(s)) return "test"; if (/(paracetamol|ibuprofen|medicine|drug|dosage)/.test(s)) return "medicine"; if (/(vaccin|immuniz|newborn)/.test(s)) return "vaccine"; if (/(blood report|report|explain.*result)/.test(s)) return "report"; if (/(diet|blood pressure|diabetes|lifestyle|natural|advice)/.test(s)) return "advice"; return "consultation"; }
export const intros: Record<CardKind, string> = { consultation: "I've reviewed your symptoms. Here's a digital consultation prepared from doctor-approved protocols.", doctor: "Here are the top specialists near you, ranked by availability and patient ratings.", hospital: "I found 3 hospitals nearby with the facilities you asked about.", test: "Here's where you can get this test done today, with pricing and wait times.", medicine: "Here's what you should know about this medication.", advice: "Here's a gentle plan you can start today. Small, consistent changes work best.", vaccine: "This is the recommended immunization schedule for a newborn.", report: "I've summarized your report in plain language. Here's what stands out." };
export const followups: Record<CardKind, string[]> = { consultation: ["Download prescription", "Explain in simple terms", "Show nearby hospitals"], doctor: ["Find another specialist", "Compare doctors", "Book appointment"], hospital: ["Compare hospitals", "Show only ICU", "Get directions"], test: ["Book home collection", "Compare centers", "What does this test show?"], medicine: ["Any interactions?", "Safe during pregnancy?", "Cheaper alternatives"], advice: ["Weekly meal plan", "Track my progress", "Warning signs"], vaccine: ["Set reminders", "Nearby clinics", "Side effects to watch"], report: ["What should I ask my doctor?", "Recommended follow-ups", "Save to history"] };
