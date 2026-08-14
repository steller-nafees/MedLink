import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";


const DURATION_MS = 1800;

export function MedlinkSplash({ next }: { next: string }) {
  const router = useRouter();

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        router.replace(next as any);
      }
    });

    return () => {
      progress.stopAnimation();
    };
  }, [next, progress, router]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logos/medlink_full.png")}
          accessibilityLabel="MedLink logo"
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Progress section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.companyName}>SyntheticMinds</Text>
      </View>
    </View>
  );
}

export default function SplashScreen() {
  return <MedlinkSplash next="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,

    backgroundColor: "#F8FAFC",
  },

  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 224,
    height: 224,
  },

  progressContainer: {
    width: "100%",
    maxWidth: 240,
    paddingBottom: 40,
  },

  progressBackground: {
    width: "100%",
    height: 6,
    overflow: "hidden",
    borderRadius: 999,

    backgroundColor: "#E2E8F0",
  },

  progressBar: {
    height: "100%",
    borderRadius: 999,

    backgroundColor: "#009688",
  },

  companyName: {
    marginTop: 24,

    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3.5,
    textAlign: "center",
    textTransform: "uppercase",

    color: "#64748B",
  },
});