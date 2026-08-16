import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const logoImage = require("../../../assets/images/logos/medlink_full.png");
const DURATION_MS = 1800;

// Design tokens ported from :root in the web theme
const colors = {
  background: "#F7FBFB",
  surface: "#FFFFFF",
  primary: "#16A89C",
  primaryForeground: "#FFFFFF",
  accent: "#69D2CA",
  border: "#D7E4E5",
  mutedForeground: "#6B7280",
  foreground: "#17252F",
};

export default function SplashScreen({ next = "/onboarding" }: { next?: string }) {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start();

    const timeout = setTimeout(() => {
      router.replace(next as any);
    }, DURATION_MS);

    return () => {
      animation.stop();
      clearTimeout(timeout);
    };
  }, [progress, router, next]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <View style={styles.container}>
      {/* gradient-hero: soft radial glows top-left (primary) and bottom-right (accent) */}
      <View style={[styles.glow, styles.glowPrimary]} />
      <View style={[styles.glow, styles.glowAccent]} />

      <View style={styles.logoWrap}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barWidth }]} />
        </View>

        <Text style={styles.brand}>SyntheticMinds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.22,
  },
  glowPrimary: {
    top: -80,
    left: -100,
    backgroundColor: colors.primary,
  },
  glowAccent: {
    bottom: -100,
    right: -100,
    backgroundColor: colors.accent,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 224,
    height: 224,
  },
  progressWrap: {
    width: "100%",
    maxWidth: 240,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  brand: {
    marginTop: 24,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4.6,
    color: colors.mutedForeground,
    textTransform: "uppercase",
  },
});