import { ReactNode } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";
import { Home, User } from "lucide-react-native";
import { LanguageToggle } from "./DriverUI";
import { useLang } from "../context/DriverLangContext";
import { theme } from "../../../theme";

const tabs = [
  { to: "/(ambulance)", key: "home", icon: Home, match: (p: string) => p === "/(ambulance)", center: false },
  { to: "/(ambulance)/profile", key: "profile", icon: User, match: (p: string) => p.startsWith("/(ambulance)/profile"), center: false },
] as const;

export function DriverShell({
  children,
  showLanguage = true,
  hideNav = false,
}: {
  children: ReactNode;
  showLanguage?: boolean;
  hideNav?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const router = useRouter();
  const { t } = useLang();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {showLanguage && (
        <View style={styles.languageContainer}>
          <LanguageToggle />
        </View>
      )}
      
      <View style={styles.content}>{children}</View>

      {!hideNav && (
        <View style={styles.navContainer}>
          <View style={styles.navBar}>
            {tabs.map((tab) => {
              const active = tab.match(path);
              const Icon = tab.icon;

              return (
                <Pressable
                  key={tab.to}
                  style={styles.navItem}
                  onPress={() => router.push(tab.to as any)}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      active && styles.iconWrapperActive,
                    ]}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.1 : 2}
                      color={active ? theme.colors.white : theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.navText,
                      active ? styles.navTextActive : styles.navTextInactive,
                    ]}
                    numberOfLines={1}
                  >
                    {t(tab.key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  languageContainer: {
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 30,
    backgroundColor: "rgba(247,251,251,0.85)", // background color approx with opacity
  },
  content: {
    flex: 1,
  },
  navContainer: {
    position: "absolute",
    bottom: 16, // usually bottom-4 in tailwind
    left: 16,
    right: 16,
    zIndex: 20,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: theme.radii.xxxl,
    borderWidth: 2,
    borderColor: theme.colors.primary + "99", // /60 in hex is approx 99
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 12,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: theme.colors.primary,
  },
  navText: {
    fontSize: 10,
    lineHeight: 10,
  },
  navTextActive: {
    fontWeight: "800",
    color: theme.colors.primary,
  },
  navTextInactive: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  navItemCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    borderWidth: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  centerIconActive: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
  },
  centerIconInactive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.white,
  },
});
