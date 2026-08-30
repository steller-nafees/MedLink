import React, { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  ClipboardList,
  Building2,
  User,
  Plus,
  X,
  Bot,
  Siren,
} from "lucide-react-native";
import { theme } from "../../theme";

/* ─── Tab definitions ─── */

const leftTabs = [
  {
    route: "/(patient)" as const,
    label: "Home",
    icon: Home,
    // Expo Router strips group-parens from usePathname(), so the resolved
    // path for "/(patient)/index" is "/" — not "/(patient)". Match both
    // the real resolved path and the group-syntax form for safety.
    match: (p: string) => p === "/" || p === "/(patient)" || p === "/(patient)/index",
  },
  {
    route: "/(patient)/activity" as const,
    label: "Activity",
    icon: ClipboardList,
    match: (p: string) => p.includes("/activity"),
  },
] as const;

const rightTabs = [
  {
    route: "/(patient)/hospitals" as const,
    label: "Hospitals",
    icon: Building2,
    match: (p: string) => p.includes("/hospitals"),
  },
  {
    route: "/(patient)/profile" as const,
    label: "Profile",
    icon: User,
    match: (p: string) => p.includes("/profile"),
  },
] as const;

/* ─── Spring config approximating cubic-bezier(0.34,1.56,0.64,1) ─── */
const FAN_SPRING = { stiffness: 120, damping: 14, mass: 1 };

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

/* ─── Patient Tab Bar ─── */
export function PatientTabBar({ hideNav = false }: { hideNav?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  // JS-thread state drives anything that needs a real React re-render
  // (icon swap, accessibility state, backdrop touch-blocking).
  const [open, setOpen] = useState(false);

  // UI-thread shared value drives the actual animation.
  const isOpen = useSharedValue(0); // 0 = closed, 1 = open
  const centerRotation = useSharedValue(0);

  const navigateTo = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router],
  );

  const closeFan = useCallback(() => {
    isOpen.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });
    centerRotation.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    setOpen(false);
  }, [isOpen, centerRotation]);

  const toggleFan = useCallback(() => {
    const opening = !open;
    if (opening) {
      isOpen.value = withSpring(1, FAN_SPRING);
      centerRotation.value = withTiming(45, { duration: 300, easing: Easing.out(Easing.ease) });
      setOpen(true);
    } else {
      closeFan();
    }
  }, [open, isOpen, centerRotation, closeFan]);

  const handleFanNavigate = useCallback(
    (route: string) => {
      closeFan();
      // Small delay so the closing animation starts before navigation
      setTimeout(() => router.push(route as any), 80);
    },
    [closeFan, router],
  );

  /* ─── Animated styles ─── */

  // Backdrop fade only — pointerEvents is handled via JS state below,
  // since it isn't a reliably-animatable style property and could
  // otherwise get stuck "auto" and block touches across the whole screen.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: isOpen.value,
  }));

  // Center button rotation + color swap
  const centerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${centerRotation.value}deg` }],
    backgroundColor: isOpen.value > 0.5 ? "#FFFFFF" : "#16A89C",
    borderColor: isOpen.value > 0.5 ? "#16A89C" : "#FFFFFF",
  }));

  // AI fan button (left, stagger 40ms)
  const aiFanStyle = useAnimatedStyle(() => {
    const progress = isOpen.value;
    return {
      opacity: progress,
      transform: [
        { translateX: interpolate(progress, [0, 1], [0, -92]) },
        { translateY: interpolate(progress, [0, 1], [-30, -104]) },
        { scale: interpolate(progress, [0, 1], [0.3, 1]) },
      ],
    };
  });

  // SOS fan button (right, stagger 90ms)
  const sosFanStyle = useAnimatedStyle(() => {
    const progress = isOpen.value;
    return {
      opacity: progress,
      transform: [
        { translateX: interpolate(progress, [0, 1], [0, 92]) },
        { translateY: interpolate(progress, [0, 1], [-30, -104]) },
        { scale: interpolate(progress, [0, 1], [0.3, 1]) },
      ],
    };
  });

  if (hideNav) return null;

  return (
    <>
      {/* Backdrop — only mounted/interactive while open, so it can never
          swallow touches when the fan is closed */}
      {open && (
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={closeFan} />
        </Animated.View>
      )}

      {/* Nav bar container */}
      <View style={styles.navContainer}>
        {/* Fan buttons — positioned relative to the center of the bar */}
        <View style={styles.fanAnchor} pointerEvents={open ? "box-none" : "none"}>
          {/* AI button (left) */}
          <Animated.View style={[styles.fanButton, aiFanStyle]} pointerEvents={open ? "auto" : "none"}>
            <Pressable
              onPress={() => handleFanNavigate("/(patient)/ai")}
              accessibilityLabel="AI Medical Assistant"
              style={styles.fanPressable}
            >
              <View style={[styles.fanCircle, styles.fanCircleAI]}>
                <Bot size={24} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={[styles.fanLabel, styles.fanLabelAI]}>
                <Text style={[styles.fanLabelText, { color: "#16A89C" }]}>
                  MedLInk AI
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* SOS button (right) */}
          <Animated.View style={[styles.fanButton, sosFanStyle]} pointerEvents={open ? "auto" : "none"}>
            <Pressable
              onPress={() => handleFanNavigate("/(patient)/sos")}
              accessibilityLabel="Emergency SOS"
              style={styles.fanPressable}
            >
              <View style={[styles.fanCircle, styles.fanCircleSOS]}>
                <Siren size={24} color="#FFFFFF" strokeWidth={2.2} />
              </View>
              <View style={[styles.fanLabel, styles.fanLabelSOS]}>
                <Text style={[styles.fanLabelText, { color: "#D64545" }]}>
                  Emergency SOS
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Glass bar */}
        <View style={styles.barOuter}>
          <BlurView intensity={40} tint="light" style={styles.blurFill}>
            <View style={styles.barInner}>
              {/* Left tabs */}
              {leftTabs.map((t) => (
                <TabItem
                  key={t.route}
                  route={t.route}
                  label={t.label}
                  icon={t.icon}
                  active={t.match(pathname)}
                  onPress={navigateTo}
                />
              ))}

              {/* Center button */}
              <View style={styles.centerSlot}>
                <Pressable
                  onPress={toggleFan}
                  accessibilityLabel="Get help"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                >
                  <Animated.View style={[styles.centerButton, centerButtonStyle]}>
                    {open ? (
                      <X size={24} color="#16A89C" strokeWidth={2.4} />
                    ) : (
                      <Plus size={28} color="#FFFFFF" strokeWidth={2.6} />
                    )}
                  </Animated.View>
                </Pressable>
              </View>

              {/* Right tabs */}
              {rightTabs.map((t) => (
                <TabItem
                  key={t.route}
                  route={t.route}
                  label={t.label}
                  icon={t.icon}
                  active={t.match(pathname)}
                  onPress={navigateTo}
                />
              ))}
            </View>
          </BlurView>
        </View>
      </View>
    </>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  /* Backdrop */
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.05)",
    zIndex: 25,
  },

  /* Nav container — absolutely positioned at bottom */
  navContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    zIndex: 30,
  },

  /* Fan anchor — centered above the bar */
  fanAnchor: {
    position: "absolute",
    alignSelf: "center",
    bottom: 0,
    zIndex: 35,
    width: 0,
    height: 0,
  },

  fanButton: {
    position: "absolute",
    alignItems: "center",
    zIndex: 35,
    width: 140, // fixed width so the box is symmetric before translateX runs
    left: -70,  // -width / 2, pre-centers the box on the anchor point
  },

  fanPressable: {
    alignItems: "center",
    gap: 4,
  },

  fanCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#FFFFFF",
  },

  fanCircleAI: {
    backgroundColor: "#16A89C",
    ...theme.shadows.shadowFanButton,
  },

  fanCircleSOS: {
    backgroundColor: "#D64545",
    ...theme.shadows.shadowSosFanButton,
  },

  fanLabel: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    ...theme.shadows.shadowCard,
  },

  fanLabelAI: {},
  fanLabelSOS: {},

  fanLabelText: {
    fontSize: 10.5,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
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
    borderRadius: 26, // inner radius = outer - borderWidth
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

  /* Tab item — the whole icon+label group is the pill now */
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