import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HospitalRoute } from "@/routes/hospital";

function HospitalPage() {
  return <HospitalRoute><div /></HospitalRoute>;
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