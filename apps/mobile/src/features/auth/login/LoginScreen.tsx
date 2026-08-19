import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Siren,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { Header } from "../../../components/ui/Header";
import { GuestSosModal } from "../../../components/auth/GuestSosModal";
import {
  AuthRequestError,
  loginCustomer,
  saveAuthToken,
} from "../../../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showSos, setShowSos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submit = async () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      setSubmitError("Enter your email or phone number and password.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await loginCustomer({
        ...(trimmedIdentifier.includes("@")
          ? { email: trimmedIdentifier }
          : { phone: trimmedIdentifier }),
        password,
      });

      await saveAuthToken(response.token.accessToken);
      router.replace("/(patient)");
    } catch (error) {
      const message =
        error instanceof AuthRequestError
          ? error.message
          : "Something went wrong while logging in.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <Header onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + theme.spacing.xxxl },
            ]}
          >
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                One login for patients and ambulance drivers.
              </Text>
            </View>

            <View style={styles.formBlock}>
              {/* Email / Phone Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email or phone number</Text>
                <View style={[styles.fieldWrap, theme.shadows.shadowCard]}>
                  <Mail size={18} color={theme.colors.textMuted} />
                  <TextInput
                    value={identifier}
                    onChangeText={(value) => {
                      setIdentifier(value);
                      setSubmitError("");
                    }}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="default"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.fieldWrap, theme.shadows.shadowCard]}>
                  <Lock size={18} color={theme.colors.textMuted} />
                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setSubmitError("");
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={theme.colors.textMuted} />
                    ) : (
                      <Eye size={18} color={theme.colors.textMuted} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password Link */}
              <View style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </View>

              {submitError ? (
                <View style={styles.errorBanner} accessibilityRole="alert">
                  <Text style={styles.errorBannerText}>{submitError}</Text>
                </View>
              ) : null}
            </View>

            {/* Login Button */}
            <View style={[styles.buttonWrap, theme.shadows.shadowFloat]}>
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Pressable
                  onPress={submit}
                  disabled={isSubmitting}
                  android_ripple={{ color: "rgba(255, 255, 255, 0.2)", borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel="Log In"
                  style={[styles.buttonInner, isSubmitting && styles.buttonDisabled]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.primaryForeground} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Login</Text>
                  )}
                </Pressable>
              </LinearGradient>
            </View>

            {/* Divider */}
            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Button */}
            <View style={[styles.buttonWrap, styles.socialButtonWrap]}>
            </View>

            {/* Emergency SOS Button */}
            <View style={[styles.buttonWrap, theme.shadows.shadowEmergency, { marginTop: theme.spacing.lg }]}>
              <LinearGradient
                colors={[theme.colors.destructive, theme.colors.emergencyDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emergencyButton}
              >
                <Pressable
                  onPress={() => setShowSos(true)}
                  android_ripple={{ color: "rgba(255, 255, 255, 0.25)", borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel="Emergency SOS"
                  style={styles.buttonInner}
                >
                  <Siren size={18} color={theme.colors.primaryForeground} />
                  <Text style={styles.emergencyButtonText}>Emergency SOS</Text>
                </Pressable>
              </LinearGradient>
            </View>
            <Text style={styles.emergencyCaption}>No account required</Text>

            {/* Sign Up Link */}
            <View style={styles.signupWrap}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <Pressable
                onPress={() => router.push("/(auth)/account-type")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
    </View>
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
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
  },
  headingBlock: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.body,
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
  formBlock: {
    gap: theme.spacing.lg,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.xxs,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radii.xl,
    borderWidth: 1.2,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 52,
  },
  input: {
    flex: 1,
    ...theme.typography.bodyLarge,
    color: theme.colors.foreground,
    paddingVertical: theme.spacing.md,
  },
  errorBanner: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.destructive + "40",
    backgroundColor: theme.colors.destructive + "14",
  },
  errorBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.destructive,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -theme.spacing.xs,
  },
  forgotText: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  buttonWrap: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    marginTop: theme.spacing.lg,
  },
  socialButtonWrap: {
    marginTop: 0,
  },
  primaryButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryForeground,
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 52,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  socialButtonText: {
    ...theme.typography.button,
    color: theme.colors.foreground,
  },
  emergencyButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
  },
  emergencyButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryForeground,
  },
  emergencyCaption: {
    ...theme.typography.caption,
    textAlign: "center",
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  signupWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xxl,
  },
  signupText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    ...theme.typography.body,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
