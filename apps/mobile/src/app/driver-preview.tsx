// TEMP DRIVER UI PREVIEW - Delete this file later
import { AmbulanceDashboardScreen } from "../features/ambulance/dashboard/AmbulanceDashboardScreen";
import { DriverLangProvider } from "../features/ambulance/context/DriverLangContext";

export default function DriverPreviewScreen() {
  return (
    <DriverLangProvider>
      <AmbulanceDashboardScreen />
    </DriverLangProvider>
  );
}
