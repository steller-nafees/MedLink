import type {
  PlatformUser,
  HospitalAccount,
  DriverAccount,
  HospitalApplication,
  DriverApplication,
  AdminNotification,
  AuditEvent,
  RecentLoginUser,
  MonthlyRevenue,
  UserGrowth,
  ActivityTrend,
  Totals,
  SosDaily,
  RevenueByHospital,
  SettlementRate,
  ApiService,
  UptimeData,
  DauData
} from "@/types/platform";

export const SOS_SERVICE_FEE = 1000; // BDT per Emergency SOS case

const platformUsers: PlatformUser[] = [
  { id: "U-10241", name: "Nusrat Jahan", email: "nusrat.j@gmail.com", phone: "+8801711234501", registered: "2026-01-14", status: "active" },
  { id: "U-10242", name: "Rafiqul Islam", email: "rafiq.islam@gmail.com", phone: "+8801711234502", registered: "2026-01-22", status: "active" },
  { id: "U-10243", name: "Tanvir Ahmed", email: "tanvir.ahmed@yahoo.com", phone: "+8801711234503", registered: "2026-02-03", status: "suspended" },
  { id: "U-10244", name: "Mehjabin Chowdhury", email: "mehjabin.c@gmail.com", phone: "+8801711234504", registered: "2026-02-19", status: "active" },
  { id: "U-10245", name: "Shakib Hasan", email: "shakib.hasan@outlook.com", phone: "+8801711234505", registered: "2026-03-02", status: "active" },
  { id: "U-10246", name: "Farhana Akter", email: "farhana.akter@gmail.com", phone: "+8801711234506", registered: "2026-03-27", status: "pending" },
  { id: "U-10247", name: "Imran Kabir", email: "imran.kabir@gmail.com", phone: "+8801711234507", registered: "2026-04-11", status: "active" },
  { id: "U-10248", name: "Sadia Rahman", email: "sadia.rahman@gmail.com", phone: "+8801711234508", registered: "2026-05-06", status: "active" },
  { id: "U-10249", name: "Arif Mahmud", email: "arif.mahmud@gmail.com", phone: "+8801711234509", registered: "2026-06-01", status: "suspended" },
  { id: "U-10250", name: "Lamia Sultana", email: "lamia.s@gmail.com", phone: "+8801711234510", registered: "2026-07-09", status: "active" },
];

const hospitalAccounts: HospitalAccount[] = [
  { id: "H-2001", name: "Square Hospital", type: "General Hospital", location: "Panthapath, Dhaka", registered: "2025-11-04", verification: "verified", contact: "Dr. Kamrul Hasan" },
  { id: "H-2002", name: "Evercare Hospital", type: "General Hospital", location: "Bashundhara, Dhaka", registered: "2025-11-21", verification: "verified", contact: "Dr. Nabila Haque" },
  { id: "H-2003", name: "Ibn Sina Diagnostic", type: "Diagnostic Center", location: "Dhanmondi, Dhaka", registered: "2026-01-09", verification: "verified", contact: "Mr. Rezaul Karim" },
  { id: "H-2004", name: "National Heart Foundation", type: "Specialized Hospital", location: "Mirpur, Dhaka", registered: "2026-02-17", verification: "verified", contact: "Dr. Sabbir Alam" },
  { id: "H-2005", name: "Popular Medical Centre", type: "General Hospital", location: "Chattogram", registered: "2026-04-02", verification: "pending", contact: "Dr. Tahmina Yasmin" },
  { id: "H-2006", name: "City Care Clinic", type: "Clinic", location: "Sylhet", registered: "2026-05-28", verification: "suspended", contact: "Mr. Jahid Hossain" },
  { id: "H-2007", name: "Green Life Hospital", type: "General Hospital", location: "Green Road, Dhaka", registered: "2026-06-30", verification: "pending", contact: "Dr. Anisur Rahman" },
];

const driverAccounts: DriverAccount[] = [
  { id: "D-3001", name: "Abdul Karim", phone: "+8801811110001", reg: "Dhaka Metro Cha 11-1111", type: "ALS", provider: "MedLink Emergency Services", status: "active" },
  { id: "D-3002", name: "Sohel Rana", phone: "+8801811110002", reg: "Dhaka Metro Cha 12-3344", type: "Critical Care", provider: "LifeLine Ambulance", status: "active" },
  { id: "D-3003", name: "Jamal Uddin", phone: "+8801811110003", reg: "Dhaka Metro Ja 09-8877", type: "Basic Life Support", provider: "QuickCare EMS", status: "pending" },
  { id: "D-3004", name: "Mizanur Rahman", phone: "+8801811110004", reg: "Chattogram Metro Cha 04-2211", type: "ALS", provider: "BayRescue EMS", status: "active" },
  { id: "D-3005", name: "Habibur Rahman", phone: "+8801811110005", reg: "Sylhet Metro Cha 02-5566", type: "Basic Life Support", provider: "City Ambulance", status: "suspended" },
  { id: "D-3006", name: "Nazmul Hoque", phone: "+8801811110006", reg: "Dhaka Metro Cha 15-7788", type: "Critical Care", provider: "MedLink Emergency Services", status: "active" },
];

const hospitalApplications: HospitalApplication[] = [
  { id: "APP-H-118", name: "Popular Medical Centre", contact: "Dr. Tahmina Yasmin", submitted: "2026-07-21", documents: ["Trade licence", "DGHS registration", "Facility photos"] },
  { id: "APP-H-119", name: "Green Life Hospital", contact: "Dr. Anisur Rahman", submitted: "2026-07-26", documents: ["Trade licence", "DGHS registration", "Tax certificate"] },
  { id: "APP-H-120", name: "Rangpur Community Hospital", contact: "Dr. Selina Parvin", submitted: "2026-07-29", documents: ["Trade licence", "Facility photos"] },
];

const driverApplications: DriverApplication[] = [
  { id: "APP-D-441", name: "Jamal Uddin", reg: "Dhaka Metro Ja 09-8877", type: "Basic Life Support", license: "DL-BD-7729341", licenseExpiry: "2029-03-14", submitted: "2026-07-24" },
  { id: "APP-D-442", name: "Ruhul Amin", reg: "Khulna Metro Cha 03-4590", type: "ALS", license: "DL-BD-8814226", licenseExpiry: "2028-11-02", submitted: "2026-07-28" },
  { id: "APP-D-443", name: "Alamgir Hossain", reg: "Dhaka Metro Cha 17-2255", type: "Critical Care", license: "DL-BD-9903117", licenseExpiry: "2030-01-19", submitted: "2026-07-30" },
];

const settlementRows = [
  { hospital: "Square Hospital", cases: 245, settled: 200000 },
  { hospital: "Evercare Hospital", cases: 198, settled: 198000 },
  { hospital: "Ibn Sina Diagnostic", cases: 86, settled: 60000 },
  { hospital: "National Heart Foundation", cases: 132, settled: 105000 },
  { hospital: "Popular Medical Centre", cases: 74, settled: 40000 },
  { hospital: "Green Life Hospital", cases: 61, settled: 61000 },
];

const adminNotifications: AdminNotification[] = [
  { id: "N1", kind: "registration", title: "New hospital registration", body: "Rangpur Community Hospital submitted an application for verification.", time: "12 min ago", unread: true },
  { id: "N2", kind: "registration", title: "New ambulance driver registration", body: "Alamgir Hossain · Dhaka Metro Cha 17-2255 · Critical Care", time: "1 hr ago", unread: true },
  { id: "N3", kind: "settlement", title: "Settlement overdue", body: "Popular Medical Centre has ৳34,000 outstanding for over 30 days.", time: "4 hrs ago", unread: true },
  { id: "N4", kind: "suspension", title: "Hospital suspended", body: "City Care Clinic was suspended after repeated verification failures.", time: "Yesterday" },
  { id: "N5", kind: "suspension", title: "Driver suspended", body: "Habibur Rahman was suspended pending licence re-verification.", time: "2 days ago" },
  { id: "N6", kind: "system", title: "System alert resolved", body: "Elevated API latency in the Dhaka region returned to normal.", time: "3 days ago" },
];

const auditLog: AuditEvent[] = [
  { id: "L-9001", event: "Settlement recorded", actor: "Alex Nguyen", target: "Evercare Hospital · ৳198,000", time: "2026-07-31 09:12" },
  { id: "L-9002", event: "Driver approved", actor: "Alex Nguyen", target: "Mizanur Rahman · D-3004", time: "2026-07-30 17:48" },
  { id: "L-9003", event: "Account suspended", actor: "System", target: "Arif Mahmud · U-10249", time: "2026-07-30 11:05" },
  { id: "L-9004", event: "Hospital registered", actor: "Self-service", target: "Rangpur Community Hospital", time: "2026-07-29 15:22" },
  { id: "L-9005", event: "Hospital approved", actor: "Farzana Rahim", target: "National Heart Foundation · H-2004", time: "2026-07-28 10:39" },
  { id: "L-9006", event: "User registered", actor: "Self-service", target: "Lamia Sultana · U-10250", time: "2026-07-27 08:14" },
  { id: "L-9007", event: "Driver approved", actor: "Farzana Rahim", target: "Nazmul Hoque · D-3006", time: "2026-07-26 19:02" },
  { id: "L-9008", event: "Settlement recorded", actor: "Alex Nguyen", target: "Square Hospital · ৳200,000", time: "2026-07-25 13:41" },
];

const recentLogins: RecentLoginUser[] = [
  { id: "R-101", name: "Nusrat Jahan", email: "nusrat.j@gmail.com", role: "General Users", lastLogin: "Today · 08:42" },
  { id: "R-102", name: "Rafiqul Islam", email: "rafiq.islam@gmail.com", role: "General Users", lastLogin: "Today · 08:16" },
  { id: "R-103", name: "Abdul Karim", email: "abdul.karim@medlink.io", role: "Ambulance Drivers", lastLogin: "Today · 07:51" },
  { id: "R-104", name: "Square Hospital", email: "ops@squarehospital.com", role: "Hospital", lastLogin: "Today · 07:28" },
  { id: "R-105", name: "Mehjabin Chowdhury", email: "mehjabin.c@gmail.com", role: "General Users", lastLogin: "Today · 06:59" },
  { id: "R-106", name: "Sohel Rana", email: "sohel.rana@lifelinebd.com", role: "Ambulance Drivers", lastLogin: "Today · 06:31" },
  { id: "R-107", name: "Evercare Hospital", email: "support@evercarebd.com", role: "Hospital", lastLogin: "Yesterday · 18:42" },
  { id: "R-108", name: "Shakib Hasan", email: "shakib.hasan@outlook.com", role: "General Users", lastLogin: "Yesterday · 17:23" },
  { id: "R-109", name: "Mizanur Rahman", email: "mizanur.rahman@bayrescue.com", role: "Ambulance Drivers", lastLogin: "Yesterday · 16:58" },
  { id: "R-110", name: "Sadia Rahman", email: "sadia.rahman@gmail.com", role: "General Users", lastLogin: "Yesterday · 15:15" },
  { id: "R-111", name: "National Heart Foundation", email: "admin@nhfbd.org", role: "Hospital", lastLogin: "Yesterday · 14:40" },
  { id: "R-112", name: "Nazmul Hoque", email: "nazmul.hoque@medlink.io", role: "Ambulance Drivers", lastLogin: "Yesterday · 13:34" },
  { id: "R-113", name: "Farhana Akter", email: "farhana.akter@gmail.com", role: "General Users", lastLogin: "Jun 28 · 20:12" },
  { id: "R-114", name: "Ibn Sina Diagnostic", email: "care@ibnsina.com", role: "Hospital", lastLogin: "Jun 28 · 18:55" },
  { id: "R-115", name: "Jamal Uddin", email: "jamal.uddin@quickcareems.com", role: "Ambulance Drivers", lastLogin: "Jun 28 · 17:44" },
  { id: "R-116", name: "Imran Kabir", email: "imran.kabir@gmail.com", role: "General Users", lastLogin: "Jun 27 · 12:08" },
  { id: "R-117", name: "Green Life Hospital", email: "operations@greenlifebd.com", role: "Hospital", lastLogin: "Jun 27 · 10:19" },
  { id: "R-118", name: "Habibur Rahman", email: "habibur.rahman@cityambulance.com", role: "Ambulance Drivers", lastLogin: "Jun 26 · 21:05" },
  { id: "R-119", name: "Lamia Sultana", email: "lamia.s@gmail.com", role: "General Users", lastLogin: "Jun 26 · 19:07" },
  { id: "R-120", name: "City Care Clinic", email: "info@citycareclinic.com", role: "Hospital", lastLogin: "Jun 25 · 09:13" },
];

const monthlyRevenue: MonthlyRevenue[] = [
  { m: "Feb", revenue: 68000, cases: 68 },
  { m: "Mar", revenue: 94000, cases: 94 },
  { m: "Apr", revenue: 112000, cases: 112 },
  { m: "May", revenue: 131000, cases: 131 },
  { m: "Jun", revenue: 158000, cases: 158 },
  { m: "Jul", revenue: 183000, cases: 183 },
];

const userGrowth: UserGrowth[] = [
  { m: "Feb", users: 4200, drivers: 62, hospitals: 9 },
  { m: "Mar", users: 6100, drivers: 78, hospitals: 12 },
  { m: "Apr", users: 9400, drivers: 96, hospitals: 15 },
  { m: "May", users: 13800, drivers: 118, hospitals: 18 },
  { m: "Jun", users: 18600, drivers: 141, hospitals: 22 },
  { m: "Jul", users: 24182, drivers: 168, hospitals: 26 },
];

const activityTrend: ActivityTrend[] = [
  { m: "Feb", reservations: 320, blood: 48, ambulance: 96 },
  { m: "Mar", reservations: 405, blood: 63, ambulance: 128 },
  { m: "Apr", reservations: 512, blood: 81, ambulance: 154 },
  { m: "May", reservations: 601, blood: 97, ambulance: 182 },
  { m: "Jun", reservations: 708, blood: 118, ambulance: 214 },
  { m: "Jul", reservations: 842, blood: 139, ambulance: 246 },
];

const sosDaily: SosDaily[] = Array.from({ length: 30 }).map((_, i) => ({
  d: i + 1,
  sos: 4 + Math.round(Math.sin(i / 3) * 2 + (i % 5) + 2),
}));


const totals: Totals = {
  users: 24182,
  drivers: driverAccounts.length + 162,
  hospitals: hospitalAccounts.length + 19,
  sos: settlementRows.reduce((a, s) => a + s.cases, 0),
  blood: 546,
  reservations: 3388,
};

const apiServices: ApiService[] = [
  { name: "Core API", status: "operational", latency: "128 ms" },
  { name: "Authentication", status: "operational", latency: "94 ms" },
  { name: "Payments & settlements", status: "operational", latency: "212 ms" },
  { name: "Notifications", status: "degraded", latency: "486 ms" },
  { name: "Analytics pipeline", status: "operational", latency: "156 ms" },
];

const uptimeSeries: UptimeData[] = Array.from({ length: 30 }).map((_, i) => ({
  d: i + 1,
  uptime: 99.72 + ((i * 7) % 9) / 32,
}));

const dauSeries: DauData[] = Array.from({ length: 14 }).map((_, i) => ({
  d: i + 1,
  dau: 5400 + i * 140 + ((i * 37) % 11) * 45,
}));

export const platformService = {
  getUsers: async () => platformUsers,
  getHospitals: async () => hospitalAccounts,
  getDrivers: async () => driverAccounts,
  getHospitalApplications: async () => hospitalApplications,
  getDriverApplications: async () => driverApplications,
  getSettlements: async () => settlementRows.map((r) => {
    const revenue = r.cases * SOS_SERVICE_FEE;
    return { ...r, revenue, outstanding: revenue - r.settled };
  }),
  getAdminNotifications: async () => adminNotifications,
  getAuditLog: async () => auditLog,
  getRecentLogins: async (): Promise<RecentLoginUser[]> => recentLogins,
  getMonthlyRevenue: async () => monthlyRevenue,
  getUserGrowth: async () => userGrowth,
  getActivityTrend: async () => activityTrend,
  getTotals: async () => totals,
  getOverallRevenueStats: async () => {
    const totalCases = settlementRows.reduce((a, s) => a + s.cases, 0);
    const totalRevenue = totalCases * SOS_SERVICE_FEE;
    const totalSettled = settlementRows.reduce((a, s) => a + s.settled, 0);
    const totalOutstanding = totalRevenue - totalSettled;
    
    return { totalRevenue, totalOutstanding, totalSettled };
  },
  getSosDaily: async () => sosDaily,
  getRevenueByHospital: async (): Promise<RevenueByHospital[]> => {
    return settlementRows.map((r) => ({
      name: r.hospital,
      value: r.cases * SOS_SERVICE_FEE,
    }));
  },
  getSettlementRate: async (): Promise<SettlementRate[]> => {
    return settlementRows.map((r) => ({
      name: r.hospital.split(" ")[0],
      rate: Math.round((r.settled / (r.cases * SOS_SERVICE_FEE)) * 100),
    }));
  },
  getApiServices: async () => apiServices,
  getUptimeSeries: async () => uptimeSeries,
  getDauSeries: async () => dauSeries,
};
