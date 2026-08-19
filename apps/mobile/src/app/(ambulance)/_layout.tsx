import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DriverLangProvider } from "../../lib/driver-i18n";
import { DriverTabBar } from "../../components/shared/DriverTabBar";
import { LanguageToggle } from "../../components/shared/LanguageToggle";
import { theme } from "../../theme";

function AmbulanceContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Language toggle strip — sticky at top */}
      <View
        style={[
          styles.langStrip,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <LanguageToggle />
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />

      <DriverTabBar />
    </View>
  );
}

export default function AmbulanceLayout() {
  return (
    <DriverLangProvider>
      <AmbulanceContent />
    </DriverLangProvider>
  );
}

const styles = StyleSheet.create({
  langStrip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(247,251,251,0.85)", // background at 85% opacity
    zIndex: 30,
  },
});