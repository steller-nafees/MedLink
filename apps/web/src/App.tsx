import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRoute } from "@/routes/hospital";
import { HospitalDashboardPage } from "@/features/hospital/dashboard/HospitalDashboardPage";
import { HospitalEmergenciesPage } from "@/features/hospital/emergencies/HospitalEmergenciesPage";
import { HospitalBedsPage } from "@/features/hospital/beds/HospitalBedsPage";
import { HospitalReservationsPage } from "@/features/hospital/reservations/HospitalReservationsPage";
import { HospitalRequestsPage } from "@/features/hospital/requests/HospitalRequestsPage";
import { HospitalPaymentsPage } from "@/features/hospital/payments/HospitalPaymentsPage";

function HospitalPage() {
  return <HospitalRoute><Routes><Route index element={<HospitalDashboardPage />} /><Route path="emergencies" element={<HospitalEmergenciesPage />} /><Route path="beds" element={<HospitalBedsPage />} /><Route path="reservations" element={<HospitalReservationsPage />} /><Route path="requests" element={<HospitalRequestsPage />} /><Route path="payments" element={<HospitalPaymentsPage />} /></Routes></HospitalRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hospital/*" element={<HospitalPage />} />
      </Routes>
    </BrowserRouter>
  );
}