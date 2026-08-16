import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Siren,
  Globe,
  X,
  ChevronLeft,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { detectRole, accountTypes } from "../../../lib/auth-roles";
import { GuestSosModal } from "../../../components/auth/GuestSosModal";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [webNotice, setWebNotice] = useState(false);
  const [showSos, setShowSos] = useState(false);

  const submit = () => {
    const role = detectRole(identifier);
    if (role === "hospital") {
      setWebNotice(true);
      return;
    }
    const dashboard = accountTypes.find((t) => t.id === role)?.dashboard;
    if (dashboard) {
      router.replace(dashboard as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerWrap}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={18} color={theme.colors.foreground} />
            </Pressable>
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              One login for patients and ambulance drivers.
            </Text>
          </View>

          <View style={styles.formBlock}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email or phone number</Text>
              <View style={[styles.fieldWrap, theme.shadows.shadowCard]}>
                <Mail size={16} color={theme.colors.mutedForeground} />
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.mutedForeground}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.fieldWrap, theme.shadows.shadowCard]}>
                <Lock size={16} color={theme.colors.mutedForeground} />
                <TextInput
                  value=""
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={16} color={theme.colors.mutedForeground} />
                  ) : (
                    <Eye size={16} color={theme.colors.mutedForeground} />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.forgotWrap}>
              <Pressable onPress={() => router.push("/(auth)/forgot")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={submit} style={styles.buttonWrap}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={[styles.socialButton, theme.shadows.shadowCard]}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable onPress={() => setShowSos(true)} style={styles.buttonWrap}>
            <LinearGradient
              colors={[theme.colors.destructive, theme.colors.emergency]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emergencyButton}
            >
              <View style={styles.buttonInner}>
                <Siren size={18} color={theme.colors.primaryForeground} />
                <Text style={styles.emergencyButtonText}>Emergency SOS</Text>
              </View>
            </LinearGradient>
          </Pressable>
          <Text style={styles.emergencyCaption}>No account required</Text>

          <View style={styles.signupWrap}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/account-type")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {webNotice && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.webNoticeCard, theme.shadows.shadowDialog]}>
            <View style={styles.webNoticeHeader}>
              <View style={[styles.webNoticeIcon, { backgroundColor: theme.colors.info }]}>
                <Globe size={20} color={theme.colors.white} />
              </View>
              <View style={styles.webNoticeContent}>
                <Text style={styles.webNoticeTitle}>Use the web portal</Text>
                <Text style={styles.webNoticeSubtitle}>
                  Hospital accounts are available on the MedLink Web Portal.
                </Text>
              </View>
              <Pressable onPress={() => setWebNotice(false)}>
                <X size={16} color={theme.colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={styles.webNoticeButtons}>
              <Pressable style={styles.webPrimaryButtonWrap}>
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.webPrimaryButton}
                >
                  <Text style={styles.webButtonText}>Open Web Portal</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={() => setWebNotice(false)}
                style={[styles.webSecondaryButton, theme.shadows.shadowCard]}
              >
                <Text style={styles.webSecondaryButtonText}>Not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border + "B3",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headingBlock: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.foreground,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: theme.colors.mutedForeground,
    lineHeight: 20,
  },
  formBlock: {
    marginBottom: 20,
    gap: 12,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    marginBottom: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
  },
  forgotWrap: {
    alignItems: "flex-end",
    paddingRight: 4,
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  buttonWrap: {
    marginBottom: 12,
  },
  primaryButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingVertical: 14,
    marginBottom: 12,
  },
  googleIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  emergencyButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    paddingVertical: 16,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emergencyButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  emergencyCaption: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 11.5,
    color: theme.colors.mutedForeground,
  },
  signupWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.foreground + "73",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  webNoticeCard: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border + "B3",
    backgroundColor: theme.colors.surface,
    padding: 24,
  },
  webNoticeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  webNoticeIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webNoticeContent: {
    flex: 1,
  },
  webNoticeTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  webNoticeSubtitle: {
    marginTop: 6,
    fontSize: 12.5,
    color: theme.colors.mutedForeground,
    lineHeight: 18,
  },
  webNoticeButtons: {
    marginTop: 20,
    gap: 10,
  },
  webPrimaryButtonWrap: {
    overflow: "hidden",
    borderRadius: theme.radii.pill,
  },
  webPrimaryButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  webSecondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  webSecondaryButtonText: {
    color: theme.colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
});
