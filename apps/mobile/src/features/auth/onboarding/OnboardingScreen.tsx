import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Extrapolation,
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
  ArrowRight,
} from "lucide-react-native";
import { theme } from "../../../theme";
import type { SharedValue } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

/* ─── Onboarding content ─── */

const ACCENT = "#C7EA6E"; // lime accent for the next button, matching the reference

const onboardingSlides = [
  {
    title: "Emergency Help When Every Second Matters",
    description: "Find hospitals, ambulances, and emergency care faster during critical situations.",
    icon: Siren,
    cardColor: "#F4DFEA",
    iconColor: "#D64545",
    iconBg: "#FFFFFF",
  },
  {
    title: "Your AI Medical Assistant",
    description: "Get help finding specialists, tests, hospitals, and healthcare information.",
    icon: Bot,
    cardColor: "#DAD4F5",
    iconColor: "#6C5CE7",
    iconBg: "#FFFFFF",
  },
  {
    title: "Healthcare Connected in One Place",
    description: "Access care, consultations, reservations, and emergency support from one platform.",
    icon: Building2,
    cardColor: "#FBF0C8",
    iconColor: "#16A89C",
    iconBg: "#FFFFFF",
  },
] as const;

const SLIDE_COUNT = onboardingSlides.length;
const AUTOPLAY_INTERVAL = 4500;

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const indexRef = useRef(0);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const isLastSlide = index === SLIDE_COUNT - 1;

  const scrollToIndex = useCallback((nextIndex: number, animated = true) => {
    scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated });
  }, []);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      const next = (indexRef.current + 1) % SLIDE_COUNT;
      scrollToIndex(next);
    }, AUTOPLAY_INTERVAL);
  }, [scrollToIndex, stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = useCallback(
    (event: any) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      indexRef.current = nextIndex;
      setIndex(nextIndex);
    },
    [],
  );

  const handleSkip = useCallback(() => {
    stopAutoplay();
    router.replace("/(auth)");
  }, [router, stopAutoplay]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      stopAutoplay();
      router.replace("/(auth)");
      return;
    }
    stopAutoplay();
    const next = indexRef.current + 1;
    scrollToIndex(next);
    startAutoplay();
  }, [isLastSlide, router, scrollToIndex, startAutoplay, stopAutoplay]);

  const handleDotPress = useCallback(
    (i: number) => {
      stopAutoplay();
      scrollToIndex(i);
      startAutoplay();
    },
    [scrollToIndex, startAutoplay, stopAutoplay],
  );

  return (
    <View style={styles.onboardingScreen}>
      {/* Top progress indicator */}
      <View style={styles.onboardingProgress}>
        {onboardingSlides.map((_, i) => (
          <ProgressSegment key={i} index={i} scrollX={scrollX} onPress={() => handleDotPress(i)} />
        ))}
      </View>

      {/* Swipeable slides */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoplay}
        onMomentumScrollEnd={(e) => {
          onMomentumScrollEnd(e);
          startAutoplay();
        }}
        style={styles.onboardingScroll}
      >
        {onboardingSlides.map((slide, i) => (
          <Slide key={i} slide={slide} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      {/* Bottom controls */}
      <View style={styles.onboardingFooter}>
        <Pressable onPress={handleSkip} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.onboardingSkip}>Skip</Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? "Get started" : "Next"}
          style={styles.onboardingNextButton}
        >
          <ArrowRight size={22} color={theme.colors.foreground} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Individual progress segment ─── */
function ProgressSegment({
  index,
  scrollX,
  onPress,
}: {
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const segmentStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [16, 28, 16],
      Extrapolation.CLAMP,
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
      [theme.colors.border, theme.colors.primary, theme.colors.border],
    );
    return { width, backgroundColor };
  });

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View style={[styles.onboardingProgressSegment, segmentStyle]} />
    </Pressable>
  );
}

/* ─── Individual slide ─── */
function Slide({
  slide,
  index,
  scrollX,
}: {
  slide: (typeof onboardingSlides)[number];
  index: number;
  scrollX: SharedValue<number>;
}) {
  const Icon = slide.icon;

  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolation.CLAMP),
      },
      {
        translateY: interpolate(scrollX.value, inputRange, [16, 0, 16], Extrapolation.CLAMP),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollX.value, inputRange, [12, 0, 12], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.illustrationCard, { backgroundColor: slide.cardColor }, cardStyle]}>
        <View style={[styles.illustrationIconWrap, { backgroundColor: slide.iconBg }]}>
          <Icon size={56} color={slide.iconColor} strokeWidth={1.8} />
        </View>
        {/* decorative floating badges, echoing the reference illustration style */}
        <View style={[styles.illustrationBadge, styles.illustrationBadgeTopLeft]}>
          <Icon size={16} color={slide.iconColor} strokeWidth={2} />
        </View>
        <View style={[styles.illustrationBadge, styles.illustrationBadgeBottomRight]}>
          <Icon size={16} color={slide.iconColor} strokeWidth={2} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.slideTextWrap, textStyle]}>
        <Text style={styles.onboardingTitle}>{slide.title}</Text>
        <Text style={styles.onboardingDescription}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
}

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

/* ─── Patient Tab Bar ─── */
function PatientTabBar({ hideNav = false }: { hideNav?: boolean }) {
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
  onboardingScreen: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 32,
    backgroundColor: theme.colors.background,
  },

  /* Top progress segments */
  onboardingProgress: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  onboardingProgressSegment: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
  },

  /* Slides */
  onboardingScroll: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  illustrationCard: {
    aspectRatio: 1,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  illustrationIconWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  illustrationBadge: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  illustrationBadgeTopLeft: {
    top: 20,
    left: 20,
  },
  illustrationBadgeBottomRight: {
    bottom: 20,
    right: 20,
  },

  slideTextWrap: {
    marginTop: 40,
  },
  onboardingTitle: {
    color: theme.colors.foreground,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  onboardingDescription: {
    marginTop: 12,
    color: theme.colors.mutedForeground,
    fontSize: 15,
    lineHeight: 22,
  },

  /* Footer */
  onboardingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 20,
  },
  onboardingSkip: {
    color: theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  onboardingNextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    ...theme.shadows.shadowFanButton,
  },

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