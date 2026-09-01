import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HospitalRoute } from "@/routes/hospital";

import { AdminRoute } from "@/routes/admin";
import { AdminDashboardPage } from "@/features/admin/dashboard/AdminDashboardPage";
import { AdminAnalyticsPage } from "@/features/admin/analytics/AdminAnalyticsPage";
import { AdminUsersPage } from "@/features/admin/users/AdminUsersPage";
import { AdminHospitalsPage } from "@/features/admin/hospitals/AdminHospitalsPage";
import { AdminAmbulanceProvidersPage } from "@/features/admin/ambulance-providers/AdminAmbulanceProvidersPage";
import { AdminDriversPage } from "@/features/admin/drivers/AdminDriversPage";
import { AdminVerificationPage } from "@/features/admin/verification/AdminVerificationPage";
import { AdminRevenuePage } from "@/features/admin/revenue/AdminRevenuePage";
import { AdminAuditPage } from "@/features/admin/audit/AdminAuditPage";
import { AdminHealthPage } from "@/features/admin/health/AdminHealthPage";
import { AdminNotificationsPage } from "@/features/admin/notifications/AdminNotificationsPage";

import { HospitalDashboardPage } from "@/features/hospital/dashboard/HospitalDashboardPage";
import { HospitalEmergenciesPage } from "@/features/hospital/emergencies/HospitalEmergenciesPage";
import { HospitalBedsPage } from "@/features/hospital/beds/HospitalBedsPage";
import { HospitalReservationsPage } from "@/features/hospital/reservations/HospitalReservationsPage";
import { HospitalRequestsPage } from "@/features/hospital/requests/HospitalRequestsPage";
import { HospitalPaymentsPage } from "@/features/hospital/payments/HospitalPaymentsPage";

import { LandingPage } from "@/features/landing/LandingPage";

function HospitalPage() {
  return (
    <HospitalRoute>
      <Routes>
        <Route index element={<HospitalDashboardPage />} />
        <Route
          path="emergencies"
          element={<HospitalEmergenciesPage />}
        />
        <Route path="beds" element={<HospitalBedsPage />} />
        <Route
          path="reservations"
          element={<HospitalReservationsPage />}
        />
        <Route path="requests" element={<HospitalRequestsPage />} />
        <Route path="payments" element={<HospitalPaymentsPage />} />
      </Routes>
    </HospitalRoute>
  );
}

function AdminPage() {
  return (
    <AdminRoute>
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="hospitals" element={<AdminHospitalsPage />} />
        <Route path="ambulance-providers" element={<AdminAmbulanceProvidersPage />} />
        <Route path="drivers" element={<AdminDriversPage />} />
        <Route
          path="verification"
          element={<AdminVerificationPage />}
        />
        <Route path="revenue" element={<AdminRevenuePage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route
          path="notifications"
          element={<AdminNotificationsPage />}
        />
        <Route path="health" element={<AdminHealthPage />} />
      </Routes>
    </AdminRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hospital/*" element={<HospitalPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}