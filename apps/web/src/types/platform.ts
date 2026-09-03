export type AccountStatus = "active" | "suspended" | "pending";

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  registered: string;
  status: AccountStatus;
  role?: "customer" | "ambulance_driver" | "hospital_admin" | "super_admin";
  subtitle?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type HospitalAccount = {
  id: string;
  name: string;
  type: "General Hospital" | "Specialized Hospital" | "Diagnostic Center" | "Clinic";
  location: string;
  registered: string;
  verification: "OPEN" | "CLOSED" | "UNDER_MAINTENANCE" | "pending" | "suspended";
  contact: string;

  // Additional backend fields
  licenseNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hospitalStatus?: "OPEN" | "CLOSED" | "UNDER_MAINTENANCE";
  description?: string;
};

export type DriverAccount = {
  id: string;
  name: string;
  phone: string;
  reg: string;
  type: "ALS" | "Critical Care" | "Basic Life Support";
  provider: string;
  status: AccountStatus;
};

export type AmbulanceProviderAccount = {
  id: string;
  providerName: string;
  providerPhone: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  registered: string; // for display
};

export type HospitalApplication = {
  id: string;
  name: string;
  contact: string;
  submitted: string;
  documents: string[];
};

export type DriverApplication = {
  id: string;
  name: string;
  reg: string;
  type: DriverAccount["type"];
  license: string;
  licenseExpiry: string;
  submitted: string;
};

export type Settlement = {
  hospital: string;
  cases: number;
  settled: number;
  revenue?: number;
  outstanding?: number;
};

export type AdminNotification = {
  id: string;
  kind: "registration" | "suspension" | "settlement" | "system";
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

export type AuditEvent = {
  id: string;
  event: string;
  actor: string;
  target: string;
  time: string;
};

export type RecentLoginUser = {
  id: string;
  name: string;
  email: string;
  role: "General Users" | "Hospital" | "Ambulance Drivers";
  lastLogin: string;
};

export type MonthlyRevenue = {
  m: string;
  revenue: number;
  cases: number;
};

export type UserGrowth = {
  m: string;
  users: number;
  drivers: number;
  hospitals: number;
};

export type ActivityTrend = {
  m: string;
  reservations: number;
  blood: number;
  ambulance: number;
};

export type Totals = {
  users: number;
  drivers: number;
  hospitals: number;
  sos: number;
  blood: number;
  reservations: number;
  usersThisMonth?: number;
  usersLastMonth?: number;
  driversThisMonth?: number;
  pendingHospitals?: number;
  reservationsThisMonth?: number;
  reservationsLastMonth?: number;
};

export type SosDaily = {
  d: number;
  sos: number;
};

export type RevenueByHospital = {
  name: string;
  value: number;
};

export type SettlementRate = {
  name: string;
  rate: number;
};

export type ApiService = {
  name: string;
  status: "operational" | "degraded" | "down" | string;
  latency: string;
};

export type UptimeData = {
  d: number;
  uptime: number;
};

export type DauData = {
  d: number;
  dau: number;
};

export type RegistrationTrend = {
  m: string;
  users: number;
  providers: number;
  hospitals: number;
};

export type EmergencyTrend = {
  d: string;
  sos: number;
};

export type AnalyticsSnapshot = {
  totals: Totals;
  registrations: RegistrationTrend[];
  emergencyEvents: EmergencyTrend[];
  emergencyHistoryIsPartial: boolean;
};