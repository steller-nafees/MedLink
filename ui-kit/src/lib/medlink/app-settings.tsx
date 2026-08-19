import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";
export type Appearance = "light" | "dark" | "system";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  appearance: Appearance;
  setAppearance: (a: Appearance) => void;
  t: (key: keyof typeof en) => string;
};

const AppSettingsContext = createContext<Ctx | null>(null);

const en = {
  profile: "Profile",
  profileSub: "Your personal healthcare hub",
  editProfile: "Edit Profile",
  save: "Save",
  cancel: "Cancel",
  personalInformation: "Personal Information",
  fullName: "Full Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  bloodGroup: "Blood Group",
  address: "Address",
  email: "Email",
  phone: "Phone",
  medicalInformation: "Medical Information",
  allergies: "Allergies",
  conditions: "Existing Conditions",
  medications: "Current Medications",
  addItem: "Add",
  emergencyContacts: "Emergency Contacts",
  addContact: "Add Contact",
  relationship: "Relationship",
  healthcarePreferences: "Healthcare Preferences",
  healthcarePrefSub: "Used by your AI Assistant and Emergency SOS",
  preferredTier: "Preferred Hospital Tier",
  tierAOnly: "Tier A Only",
  tierAB: "Tier A + Tier B",
  allHospitals: "All Hospitals",
  tierADesc: "Premium hospitals with advanced facilities and specialists",
  tierABDesc: "Premium and good quality hospitals",
  allDesc: "Every hospital, including basic facilities",
  favoriteHospitals: "Favorite Hospitals",
  searchHospital: "Search hospital",
  noFavorites: "No favorites yet. Search above to add one.",
  emergencyPreference: "Emergency Preference",
  emergencyPrefSub: "How MedLink recommends hospitals during an emergency",
  bestHospital: "Best Hospital",
  balanced: "Balanced",
  nearest: "Nearest Available",
  settings: "Settings",
  language: "Language",
  languageHint: "Applies across the whole app",
  appearance: "Appearance",
  light: "Light",
  dark: "Dark",
  system: "System",
  notifications: "Notifications",
  privacyPolicy: "Privacy Policy",
  helpSupport: "Help & Support",
  logout: "Log Out",
  remove: "Remove",
  none: "None recorded",
};

const bn: Record<keyof typeof en, string> = {
  profile: "প্রোফাইল",
  profileSub: "আপনার ব্যক্তিগত স্বাস্থ্যকেন্দ্র",
  editProfile: "প্রোফাইল সম্পাদনা",
  save: "সংরক্ষণ",
  cancel: "বাতিল",
  personalInformation: "ব্যক্তিগত তথ্য",
  fullName: "পূর্ণ নাম",
  dateOfBirth: "জন্ম তারিখ",
  gender: "লিঙ্গ",
  bloodGroup: "রক্তের গ্রুপ",
  address: "ঠিকানা",
  email: "ইমেইল",
  phone: "ফোন",
  medicalInformation: "চিকিৎসা তথ্য",
  allergies: "অ্যালার্জি",
  conditions: "বিদ্যমান রোগ",
  medications: "বর্তমান ওষুধ",
  addItem: "যোগ করুন",
  emergencyContacts: "জরুরি যোগাযোগ",
  addContact: "যোগাযোগ যোগ করুন",
  relationship: "সম্পর্ক",
  healthcarePreferences: "স্বাস্থ্যসেবা পছন্দ",
  healthcarePrefSub: "এআই সহকারী ও জরুরি SOS এতে ব্যবহৃত হয়",
  preferredTier: "পছন্দের হাসপাতাল টিয়ার",
  tierAOnly: "শুধু টিয়ার A",
  tierAB: "টিয়ার A + টিয়ার B",
  allHospitals: "সব হাসপাতাল",
  tierADesc: "উন্নত সুবিধা ও বিশেষজ্ঞসহ প্রিমিয়াম হাসপাতাল",
  tierABDesc: "প্রিমিয়াম ও ভালো মানের হাসপাতাল",
  allDesc: "সাধারণ সুবিধাসহ সব হাসপাতাল",
  favoriteHospitals: "প্রিয় হাসপাতাল",
  searchHospital: "হাসপাতাল খুঁজুন",
  noFavorites: "এখনো কোনো প্রিয় নেই। উপরে খুঁজে যোগ করুন।",
  emergencyPreference: "জরুরি পছন্দ",
  emergencyPrefSub: "জরুরি অবস্থায় MedLink কীভাবে হাসপাতাল সুপারিশ করবে",
  bestHospital: "সেরা হাসপাতাল",
  balanced: "ভারসাম্যপূর্ণ",
  nearest: "নিকটতম উপলব্ধ",
  settings: "সেটিংস",
  language: "ভাষা",
  languageHint: "পুরো অ্যাপে প্রযোজ্য",
  appearance: "থিম",
  light: "লাইট",
  dark: "ডার্ক",
  system: "সিস্টেম",
  notifications: "নোটিফিকেশন",
  privacyPolicy: "গোপনীয়তা নীতি",
  helpSupport: "সহায়তা",
  logout: "লগ আউট",
  remove: "সরান",
  none: "কিছু নেই",
};

const dict = { en, bn };

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [appearance, setAppearanceState] = useState<Appearance>("light");

  useEffect(() => {
    const l = localStorage.getItem("medlink.lang") as Lang | null;
    const a = localStorage.getItem("medlink.appearance") as Appearance | null;
    if (l === "en" || l === "bn") setLangState(l);
    if (a === "light" || a === "dark" || a === "system") setAppearanceState(a);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark =
        appearance === "dark" ||
        (appearance === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", isDark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [appearance]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      appearance,
      setLang: (l) => {
        setLangState(l);
        localStorage.setItem("medlink.lang", l);
      },
      setAppearance: (a) => {
        setAppearanceState(a);
        localStorage.setItem("medlink.appearance", a);
      },
      t: (key) => dict[lang][key] ?? en[key],
    }),
    [lang, appearance]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return ctx;
}
