import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PatientTabBar } from "../../components/shared/PatientTabBar";
import { PATIENT_NAV_CLEARANCE } from "../../constants/navigation";
import { theme } from "../../theme";
import { isEmergencySession } from "../../services/auth";

export default function PatientLayout() {
  const insets = useSafeAreaInsets();
  const [emergencySession, setEmergencySession] = useState<boolean | null>(null);

  useEffect(() => {
    void isEmergencySession().then(setEmergencySession);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: emergencySession ? 0 : PATIENT_NAV_CLEARANCE + insets.bottom,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      {emergencySession === false && <PatientTabBar />}
    </View>
  );
}