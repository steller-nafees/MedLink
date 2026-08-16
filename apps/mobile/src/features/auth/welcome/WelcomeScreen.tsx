import { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Siren,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { GuestSosModal } from "../../../components/auth/GuestSosModal";

const logoImage = require("../../../assets/images/logos/medlink_full.png");

export default function WelcomeScreen() {
  const router = useRouter();
  const [showSos, setShowSos] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.buttonStack}>
            <Pressable onPress={() => setShowSos(true)} style={styles.buttonWrap}>
              <LinearGradient
                colors={[theme.colors.destructive, theme.colors.emergency]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, styles.emergencyButton]}
              >
                <View style={styles.buttonInner}>
                  <Siren size={18} color={theme.colors.primaryForeground} />
                  <Text style={styles.buttonText}>Emergency SOS</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.push("/(auth)/login")} style={styles.buttonWrap}>
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, styles.primaryButtonGrad]}
              >
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>Log In</Text>
                </View>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.push("/(auth)/account-type")} style={styles.buttonWrap}>
              <View style={[styles.outlineButton, styles.borderButton]}>
                <Text style={styles.outlineText}>Create Account</Text>
              </View>
            </Pressable>

            <Text style={styles.caption}>Emergency SOS works without an account.</Text>
          </View>
        </View>

        {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    maxWidth: "80%",
    height: 160,
  },
  buttonStack: {
    gap: 12,
  },
  buttonWrap: {
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
  },
  emergencyButton: {
    minHeight: 52,
  },
  primaryButtonGrad: {
    minHeight: 52,
  },
  borderButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary + "66",
    backgroundColor: theme.colors.surface,
    minHeight: 52,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  outlineButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  caption: {
    paddingTop: 4,
    textAlign: "center",
    fontSize: 11.5,
    color: theme.colors.mutedForeground,
  },
});
