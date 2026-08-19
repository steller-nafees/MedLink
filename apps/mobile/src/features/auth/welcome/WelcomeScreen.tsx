import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Siren } from "lucide-react-native";
import { theme } from "../../../theme";
import { GuestSosModal } from "../../../components/auth/GuestSosModal";

const logoImage = require("../../../assets/images/logos/medlink_full.png");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showSos, setShowSos] = useState(false);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 16) + 16,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image
            source={logoImage}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="MedLink Logo"
          />
        </View>

        <View style={styles.buttonStack}>
          {/* Emergency SOS Button */}
          <View style={[styles.buttonWrap, theme.shadows.shadowEmergency]}>
            <LinearGradient
              colors={[theme.colors.destructive, theme.colors.emergencyDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Pressable
                onPress={() => setShowSos(true)}
                android_ripple={{ color: "rgba(255, 255, 255, 0.25)", borderless: false }}
                accessibilityRole="button"
                accessibilityLabel="Emergency SOS without account"
                style={styles.buttonInner}
              >
                <Siren size={20} color={theme.colors.primaryForeground} />
                <Text style={styles.buttonText}>Emergency SOS</Text>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Log In Button */}
          <View style={[styles.buttonWrap, theme.shadows.shadowFloat]}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                android_ripple={{ color: "rgba(255, 255, 255, 0.2)", borderless: false }}
                accessibilityRole="button"
                accessibilityLabel="Log in to your account"
                style={styles.buttonInner}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Create Account Button */}
          <View style={styles.buttonWrap}>
            <View style={styles.borderButton}>
              <Pressable
                onPress={() => router.push("/(auth)/account-type")}
                android_ripple={{ color: "rgba(22, 168, 156, 0.12)", borderless: false }}
                accessibilityRole="button"
                accessibilityLabel="Create a new account"
                style={styles.buttonInner}
              >
                <Text style={styles.outlineText}>Create Account</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.caption}>Emergency SOS works without an account.</Text>
        </View>
      </View>

      {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    justifyContent: "space-between",
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 400,
    maxWidth: "85%",
    height: 240,
  },
  buttonStack: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  buttonWrap: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
  },
  primaryButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
  },
  borderButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    overflow: "hidden",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.primaryForeground,
  },
  outlineText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  caption: {
    ...theme.typography.caption,
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
