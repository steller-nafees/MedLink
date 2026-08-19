import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Header } from "../../../components/ui/Header";
import { AccountTypeCards } from "../components/AccountTypeCards";
import { accountTypes, type AccountRole } from "../../../lib/auth-roles";

export default function AccountTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<AccountRole | undefined>();

  const handleSelect = (role: AccountRole) => {
    setSelected(role);
    const dashboard = accountTypes.find((t) => t.id === role)?.dashboard;
    if (dashboard) {
      if (role === "driver") {
        router.push("/(auth)/driver-signup");
      } else if (role === "patient") {
        router.push("/(auth)/signup");
      }
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + theme.spacing.xxxl },
        ]}
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
  },
  headingBlock: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.body,
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
  cardsBlock: {
    marginTop: theme.spacing.sm,
  },
});
