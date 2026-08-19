import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "../../../theme";
import { AccountTypeCards } from "../components/AccountTypeCards";
import { accountTypes, type AccountRole } from "../../../lib/auth-roles";

export default function AccountTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountRole | undefined>();

  const handleSelect = (role: AccountRole) => {
    setSelected(role);
    const dashboard = accountTypes.find((t) => t.id === role)?.dashboard;
    if (dashboard) {
      // Navigate to the appropriate signup flow or dashboard
      if (role === "driver") {
        router.push("/(auth)/driver-signup");
      } else if (role === "patient") {
        router.push("/(auth)/signup");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerWrap}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={18} color={theme.colors.foreground} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headingBlock}>
            <Text style={styles.title}>Select account type</Text>
            <Text style={styles.subtitle}>
              Pick the option that describes you best.
            </Text>
          </View>

          <View style={styles.cardsBlock}>
            <AccountTypeCards onSelect={handleSelect} selected={selected} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headingBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: -0.5,
    color: theme.colors.foreground,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 18,
    color: theme.colors.mutedForeground,
  },
  cardsBlock: {
    marginTop: 24,
  },
});
