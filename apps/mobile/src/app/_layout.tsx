import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { View, ActivityIndicator } from "react-native";
import { theme } from "../theme";
import { getAuthToken, isEmergencySession } from "../services/auth";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    let active = true;

    void Promise.all([getAuthToken(), isEmergencySession()]).then(([token, emergency]) => {
      if (!active) return;

      const group = segments[0];
      const route = segments.length > 1 ? segments[1] : undefined;
      const protectedRoute = group === "(patient)" || group === "(ambulance)";

      if (emergency && (group !== "(patient)" || route !== "sos")) {
        router.replace("/(patient)/sos");
      } else if (protectedRoute && !token) {
        router.replace("/(auth)/login");
      }

    });

    return () => {
      active = false;
    };
  }, [router, segments]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </SafeAreaProvider>
  );
}