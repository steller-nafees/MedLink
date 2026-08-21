import { Stack } from "expo-router";
import { DriverLangProvider } from "../../features/ambulance/context/DriverLangContext";

export default function Layout() {
  return (
    <DriverLangProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DriverLangProvider>
  );
}