import { Stack } from "expo-router";
import { View } from "react-native";
import { PatientTabBar } from "../../components/shared/PatientTabBar";
import { theme } from "../../theme";

export default function PatientLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <PatientTabBar />
    </View>
  );
}