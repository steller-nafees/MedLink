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

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        router.replace("/onboarding");
      }
    });

    return () => animation.stop();
  }, [progress, router]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <View style={styles.container}>
      <View style={styles.glow} />

      <View style={styles.main}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progress, { width: progressWidth }]} />
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
    backgroundColor: "#F4FBFF",
  },

  glow: {
    position: "absolute",
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: "rgba(10, 141, 255, 0.10)",
  },

  main: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 224,
    height: 224,
  },

  footer: {
    width: "100%",
    maxWidth: 240,
    paddingBottom: 40,
  },

  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#D7E8F7",
  },

  progress: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0A8DFF",
  },

  brand: {
    marginTop: 24,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3.52,
    textAlign: "center",
    color: "#6E7F97",
    textTransform: "uppercase",
  },
});