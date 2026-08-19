import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

export const dict = {
  // nav
  home: { en: "Home", bn: "হোম" },
  trip: { en: "Trip", bn: "ট্রিপ" },
  navigate: { en: "Navigate", bn: "নেভিগেট" },
  alerts: { en: "Alerts", bn: "নোটিশ" },
  history: { en: "History", bn: "ইতিহাস" },
  profile: { en: "Profile", bn: "প্রোফাইল" },

  // dashboard
  driver: { en: "Driver", bn: "চালক" },
  ambulanceId: { en: "Ambulance ID", bn: "অ্যাম্বুলেন্স আইডি" },
  shift: { en: "Shift", bn: "শিফট" },
  online: { en: "Online", bn: "অনলাইন" },
  offline: { en: "Offline", bn: "অফলাইন" },
  available: { en: "Available", bn: "উপলব্ধ" },
  onDuty: { en: "On Duty", bn: "দায়িত্বে" },
  busy: { en: "Busy", bn: "ব্যস্ত" },
  youAreOnline: { en: "You are online", bn: "আপনি অনলাইনে আছেন" },
  youAreOffline: { en: "You are offline", bn: "আপনি অফলাইনে আছেন" },
  tapToGoOnline: { en: "Tap to start receiving requests", bn: "অনুরোধ পেতে ট্যাপ করুন" },
  tapToGoOffline: { en: "Tap to stop receiving requests", bn: "অনুরোধ বন্ধ করতে ট্যাপ করুন" },
  tripsToday: { en: "Trips today", bn: "আজকের ট্রিপ" },
  avgResponse: { en: "Avg. response", bn: "গড় সাড়া" },
  rating: { en: "Rating", bn: "রেটিং" },

  // request
  newRequest: { en: "New Emergency Request", bn: "নতুন জরুরি অনুরোধ" },
  emergencyType: { en: "Emergency Type", bn: "জরুরি ধরন" },
  priority: { en: "Priority", bn: "অগ্রাধিকার" },
  critical: { en: "Critical", bn: "সংকটাপন্ন" },
  patient: { en: "Patient", bn: "রোগী" },
  guest: { en: "Guest", bn: "অতিথি" },
  pickup: { en: "Pickup", bn: "পিকআপ" },
  destination: { en: "Destination", bn: "গন্তব্য" },
  contact: { en: "Contact", bn: "যোগাযোগ" },
  accept: { en: "Accept Request", bn: "অনুরোধ গ্রহণ করুন" },
  reject: { en: "Reject", bn: "প্রত্যাখ্যান" },

  // trip
  emergency: { en: "Emergency", bn: "জরুরি অবস্থা" },
  currentEmergency: { en: "Current Emergency", bn: "বর্তমান জরুরি অবস্থা" },
  callPatient: { en: "Call Patient", bn: "রোগীকে কল করুন" },
  callHospital: { en: "Call Hospital", bn: "হাসপাতালে কল করুন" },
  navigateBtn: { en: "Navigate", bn: "নেভিগেট করুন" },
  markArrived: { en: "Mark Arrived", bn: "পৌঁছেছি চিহ্নিত করুন" },
  pickedUp: { en: "Picked Up Patient", bn: "রোগী তোলা হয়েছে" },
  atHospital: { en: "Arrived at Hospital", bn: "হাসপাতালে পৌঁছেছি" },
  complete: { en: "Complete Trip", bn: "ট্রিপ সম্পন্ন করুন" },
  timeline: { en: "Trip Timeline", bn: "ট্রিপ টাইমলাইন" },
  accepted: { en: "Accepted", bn: "গৃহীত" },
  navigating: { en: "Navigating", bn: "যাত্রা চলছে" },
  arrived: { en: "Arrived", bn: "পৌঁছেছে" },
  patientPickedUp: { en: "Patient Picked Up", bn: "রোগী তোলা হয়েছে" },
  hospitalReached: { en: "Hospital Reached", bn: "হাসপাতালে পৌঁছেছে" },
  completed: { en: "Completed", bn: "সম্পন্ন" },
  emergencyDetails: { en: "Emergency Details", bn: "জরুরি বিবরণ" },
  severity: { en: "Severity", bn: "তীব্রতা" },
  notes: { en: "Notes", bn: "নোট" },
  department: { en: "Department", bn: "বিভাগ" },
  hospitalInfo: { en: "Hospital", bn: "হাসপাতাল" },
  address: { en: "Address", bn: "ঠিকানা" },
  nextStep: { en: "Next step", bn: "পরবর্তী ধাপ" },

  // navigation
  eta: { en: "Arrival", bn: "পৌঁছানোর সময়" },
  distance: { en: "Distance", bn: "দূরত্ব" },
  endNavigation: { en: "End Navigation", bn: "নেভিগেশন শেষ" },
  minutes: { en: "min", bn: "মিনিট" },

  // notifications
  notifications: { en: "Notifications", bn: "নোটিফিকেশন" },
  nHospitalUpdated: { en: "Hospital Updated", bn: "হাসপাতাল পরিবর্তিত" },
  nCancelled: { en: "Patient Cancelled", bn: "রোগী বাতিল করেছে" },
  nCompleted: { en: "Trip Completed", bn: "ট্রিপ সম্পন্ন" },

  // history
  tripHistory: { en: "Trip History", bn: "ট্রিপ ইতিহাস" },
  duration: { en: "Duration", bn: "সময়কাল" },
  status: { en: "Status", bn: "অবস্থা" },

  // profile
  phone: { en: "Phone Number", bn: "ফোন নম্বর" },
  fullName: { en: "Full Name", bn: "পুরো নাম" },
  editProfile: { en: "Edit Profile", bn: "প্রোফাইল সম্পাদনা" },
  editInformation: { en: "Edit Information", bn: "তথ্য সম্পাদনা" },
  save: { en: "Save", bn: "সংরক্ষণ" },
  cancel: { en: "Cancel", bn: "বাতিল" },
  vehicleRegistration: { en: "Vehicle Registration", bn: "যানবাহন নিবন্ধন" },
  ambulanceType: { en: "Ambulance Type", bn: "অ্যাম্বুলেন্সের ধরন" },
  provider: { en: "Provider / Organization", bn: "প্রদানকারী / প্রতিষ্ঠান" },
  vehicleStatus: { en: "Vehicle Status", bn: "যানবাহনের অবস্থা" },
  active: { en: "Active", bn: "সক্রিয়" },
  inactive: { en: "Inactive", bn: "নিষ্ক্রিয়" },
  ambulanceInfo: { en: "Ambulance Information", bn: "অ্যাম্বুলেন্সের তথ্য" },
  driverInfo: { en: "Driver Information", bn: "চালকের তথ্য" },
  settings: { en: "Settings", bn: "সেটিংস" },
  language: { en: "Language", bn: "ভাষা" },
  theme: { en: "Theme", bn: "থিম" },
  logout: { en: "Log Out", bn: "লগ আউট" },

  // empty states
  noRequests: { en: "No requests right now", bn: "এখন কোনো অনুরোধ নেই" },
  noRequestsSub: { en: "Stay online — you'll be alerted instantly.", bn: "অনলাইনে থাকুন — সাথে সাথে জানানো হবে।" },
  offlineTitle: { en: "You are offline", bn: "আপনি অফলাইনে" },
  offlineSub: { en: "Go online to receive emergency requests.", bn: "জরুরি অনুরোধ পেতে অনলাইনে যান।" },
  noInternet: { en: "No internet connection", bn: "ইন্টারনেট সংযোগ নেই" },
  shiftEnded: { en: "Shift ended", bn: "শিফট শেষ" },
  noTrip: { en: "No active trip", bn: "কোনো সক্রিয় ট্রিপ নেই" },
  noTripSub: { en: "Accept a request from Home to start.", bn: "শুরু করতে হোম থেকে অনুরোধ গ্রহণ করুন।" },
} as const;

export type Key = keyof typeof dict;

const translate = (k: Key, lang: Lang) => dict[k]?.[lang] ?? String(k);

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => translate(k, "en"),
});

export function DriverLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: Key) => translate(k, lang);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
