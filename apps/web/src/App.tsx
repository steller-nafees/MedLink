import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRoute } from "@/routes/hospital";
import { HospitalDashboardPage } from "@/features/hospital/dashboard/HospitalDashboardPage";
import { HospitalEmergenciesPage } from "@/features/hospital/emergencies/HospitalEmergenciesPage";
import { HospitalBedsPage } from "@/features/hospital/beds/HospitalBedsPage";

function HospitalPage() {
  return <HospitalRoute><Routes><Route index element={<HospitalDashboardPage />} /><Route path="emergencies" element={<HospitalEmergenciesPage />} /><Route path="beds" element={<HospitalBedsPage />} /></Routes></HospitalRoute>;
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