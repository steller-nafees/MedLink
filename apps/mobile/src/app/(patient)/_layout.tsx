import { Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PatientTabBar } from "../../components/shared/PatientTabBar";
import { PATIENT_NAV_CLEARANCE } from "../../constants/navigation";
import { theme } from "../../theme";
import { isEmergencySession } from "../../services/auth";

export default function PatientLayout() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [emergencySession, setEmergencySession] = useState<boolean | null>(null);
  const hidePatientNav = segments[1] === "ai";

  useEffect(() => {
    void isEmergencySession().then(setEmergencySession);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: emergencySession || hidePatientNav ? 0 : PATIENT_NAV_CLEARANCE + insets.bottom,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      {emergencySession === false && !hidePatientNav && <PatientTabBar />}
    </View>
  );
}