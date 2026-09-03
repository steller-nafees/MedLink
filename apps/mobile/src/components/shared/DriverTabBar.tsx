import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  User,
} from "lucide-react-native";
import { useLang, type Key } from "../../features/ambulance/context/DriverLangContext";
import { theme } from "../../theme";

/* ─── Tab definitions ─── */

type TabDef = {
  route: string;
  key: Key;
  icon: typeof Home;
  match: (p: string) => boolean;
};

const tabs: TabDef[] = [
  {
    route: "/(ambulance)",
    key: "home",
    icon: Home,
    match: (p) => p === "/(ambulance)" || p === "/(ambulance)/index",
  },
  {
    route: "/(ambulance)/profile",
    key: "profile",
    icon: User,
    match: (p) => p.includes("/profile"),
  },
];

/* ─── Tab Item ─── */
function TabItem({
  route,
  label,
  icon: Icon,
  active,
  onPress,
}: {
  route: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onPress: (route: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(route)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[styles.tabItem, active && styles.tabItemActive]}
    >
      <View style={styles.iconChip}>
        <Icon
          size={18}
          strokeWidth={active ? 2.1 : 2}
          color="#16A89C"
          fill="none"
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          { fontWeight: active ? "700" : "500" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ─── Driver Tab Bar ─── */
export function DriverTabBar({ hideNav = false }: { hideNav?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLang();

  const navigateTo = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router],
  );

  if (hideNav) return null;

  return (
    <View style={styles.navContainer}>
      <View style={styles.barOuter}>
        <BlurView intensity={40} tint="light" style={styles.blurFill}>
          <View style={styles.barInner}>
            {tabs.map((tab) => {
              const active = tab.match(pathname);

              return (
                <TabItem
                  key={tab.route}
                  route={tab.route}
                  label={t(tab.key)}
                  icon={tab.icon}
                  active={active}
                  onPress={navigateTo}
                />
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  /* Nav container — absolutely positioned at bottom */
  navContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    zIndex: 20,
  },

  /* Glass bar */
  barOuter: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(22,168,156,0.60)",
    overflow: "visible",
    ...theme.shadows.shadowNav,
  },

  blurFill: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.75)",
  },

  barInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 2,
  },

  /* Tab item — pill-shaped active state, matches patient bar */
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
  },

  tabItemActive: {
    backgroundColor: "rgba(22,168,156,0.12)",
  },

  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontSize: 10,
    lineHeight: 10,
    color: "#16A89C",
    fontFamily: theme.fonts.medium,
  },
});