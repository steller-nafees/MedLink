// Ported from ui-kit/src/routes/patient.settings.tsx and ui-kit/src/lib/medlink/app-settings.tsx.

export type SettingsLanguage = "en" | "bn";
export type SettingsAppearance = "light" | "dark" | "system";

const englishCopy = {
  settings: "Settings", language: "Language", languageHint: "Applies across the whole app", appearance: "Appearance", light: "Light", dark: "Dark", system: "System", notifications: "Notifications", privacyPolicy: "Privacy Policy", helpSupport: "Help & Support", logout: "Log Out",
} as const;

const banglaCopy: Record<keyof typeof englishCopy, string> = {
  settings: "সেটিংস", language: "ভাষা", languageHint: "পুরো অ্যাপে প্রযোজ্য", appearance: "থিম", light: "লাইট", dark: "ডার্ক", system: "সিস্টেম", notifications: "নোটিফিকেশন", privacyPolicy: "গোপনীয়তা নীতি", helpSupport: "সহায়তা", logout: "লগ আউট",
};

export const settingsCopy = { en: englishCopy, bn: banglaCopy } as const;
export const languageOptions = [{ value: "en", label: "English" }, { value: "bn", label: "বাংলা" }] as const;
export const connectivityOptions = [{ value: "auto", label: "Auto" }, { value: "online", label: "Online" }, { value: "offline", label: "Offline" }] as const;
export const emergencyConnectivityCopy = { title: "Emergency connectivity", hint: "Force offline emergency mode to use synced resources only" } as const;
export const settingsVersion = "MedLink · v2.4.0";
