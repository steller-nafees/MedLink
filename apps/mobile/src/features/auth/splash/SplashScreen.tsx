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
import { theme } from "../../../theme";

const logoImage = require("../../../assets/images/logos/medlink_full.png");
const DURATION_MS = 1800;

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
      {/* Soft radial glow circles */}
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
    paddingHorizontal: theme.spacing.xxxl,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.primary,
  },
  glowAccent: {
    bottom: -100,
    right: -100,
    backgroundColor: theme.colors.accent,
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
    paddingBottom: theme.spacing.huge,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primary,
  },
  brand: {
    ...theme.typography.label,
    marginTop: theme.spacing.xxl,
    letterSpacing: 4,
    color: theme.colors.textMuted,
  },
});