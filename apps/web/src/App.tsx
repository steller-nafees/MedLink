import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRoute } from "@/routes/hospital";
import { AdminRoute } from "@/routes/admin";
import { AdminDashboardPage } from "@/features/admin/dashboard/AdminDashboardPage";
import { AdminAnalyticsPage } from "@/features/admin/analytics/AdminAnalyticsPage";
import { AdminUsersPage } from "@/features/admin/users/AdminUsersPage";
import { AdminHospitalsPage } from "@/features/admin/hospitals/AdminHospitalsPage";
import { AdminDriversPage } from "@/features/admin/drivers/AdminDriversPage";
import { AdminVerificationPage } from "@/features/admin/verification/AdminVerificationPage";
import { AdminRevenuePage } from "@/features/admin/revenue/AdminRevenuePage";
import { AdminAuditPage } from "@/features/admin/audit/AdminAuditPage";
import { AdminHealthPage } from "@/features/admin/health/AdminHealthPage";
import { AdminNotificationsPage } from "@/features/admin/notifications/AdminNotificationsPage";
function HospitalPage() {
  return <HospitalRoute><div /></HospitalRoute>;
}

function AdminPage() {
  return (
    <AdminRoute>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="hospitals" element={<AdminHospitalsPage />} />
        <Route path="drivers" element={<AdminDriversPage />} />
        <Route path="verification" element={<AdminVerificationPage />} />
        <Route path="revenue" element={<AdminRevenuePage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="health" element={<AdminHealthPage />} />
      </Routes>
    </AdminRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hospital/*" element={<HospitalPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}