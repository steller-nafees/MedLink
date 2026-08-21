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
  Bell,
  Truck,
  Clock,
  User,
} from "lucide-react-native";
import { useLang, type Key } from "../../lib/driver-i18n";
import { theme } from "../../theme";

/* ─── Tab definitions ─── */

type TabDef = {
  route: string;
  key: Key;
  icon: typeof Home;
  match: (p: string) => boolean;
  center: boolean;
};

const tabs: TabDef[] = [
  {
    route: "/(ambulance)",
    key: "home",
    icon: Home,
    match: (p) => p === "/(ambulance)" || p === "/(ambulance)/index",
    center: false,
  },
  {
    route: "/(ambulance)/notifications",
    key: "alerts",
    icon: Bell,
    match: (p) => p.includes("/notifications"),
    center: false,
  },
  {
    route: "/(ambulance)/trip",
    key: "trip",
    icon: Truck,
    match: (p) => p.includes("/trip") || p.includes("/navigate"),
    center: true,
  },
  {
    route: "/(ambulance)/history",
    key: "history",
    icon: Clock,
    match: (p) => p.includes("/history"),
    center: false,
  },
  {
    route: "/(ambulance)/profile",
    key: "profile",
    icon: User,
    match: (p) => p.includes("/profile"),
    center: false,
  },
];

/* ─── Normal Tab Item ─── */
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
      style={styles.tabItem}
    >
      <View style={[styles.iconChip, active && styles.iconChipActive]}>
        <Icon
          size={18}
          strokeWidth={active ? 2.1 : 2}
          color={active ? "#FFFFFF" : "#16A89C"}
          fill={active ? "#16A89C" : "none"}
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

/* ─── Center Trip Button ─── */
function CenterTripButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.centerSlot}>
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel="Trip"
      >
        <View
          style={[
            styles.centerButton,
            {
              backgroundColor: active ? "#FFFFFF" : "#16A89C",
              borderColor: active ? "#16A89C" : "#FFFFFF",
            },
          ]}
        >
          <Truck
            size={22}
            strokeWidth={2.3}
            color={active ? "#16A89C" : "#FFFFFF"}
          />
        </View>
      </Pressable>
    </View>
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

              if (tab.center) {
                return (
                  <CenterTripButton
                    key={tab.route}
                    active={active}
                    onPress={() => navigateTo(tab.route)}
                  />
                );
              }

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
  /* Nav container — absolutely positioned at bottom with 16px inset */
  navContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16, // bottom-4 = 16px
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

  /* Tab item */
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },

  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  iconChipActive: {
    backgroundColor: "#16A89C",
  },

  tabLabel: {
    fontSize: 10,
    lineHeight: 10,
    color: "#16A89C",
    fontFamily: theme.fonts.medium,
  },

  /* Center button */
  centerSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -24 }],
    borderWidth: 5,
    ...theme.shadows.shadowFanButton,
  },
});
