import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Phone,
  Mail,
  Lock,
  Check,
  IdCard,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { Header } from "../../../components/ui/Header";
import { ambulanceTypes } from "../../../lib/auth-roles";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthSelect } from "../../../components/ui/AuthSelect";
import { Button } from "../../../components/ui/Button";

export function DriverSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [done, setDone] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [ambulanceType, setAmbulanceType] = useState<string>(
    ambulanceTypes[0] as string
  );

  // Validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+]?[\d\s-()]{10,}$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  const emailError =
    email.trim().length > 0 && !emailPattern.test(email.trim())
      ? "Enter a valid email address"
      : "";

  const phoneError =
    phone.trim().length > 0 && !phonePattern.test(phone.trim())
      ? "Enter a valid phone number"
      : "";

  const passwordError =
    password.length > 0 && !passwordPattern.test(password)
      ? "Password must be 8+ characters with uppercase, lowercase, number and symbol"
      : "";

  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords do not match"
      : "";

  const canSubmit =
    fullName.trim().length > 0 &&
    phone.trim().length > 0 &&
    !phoneError &&
    email.trim().length > 0 &&
    !emailError &&
    password.length > 0 &&
    !passwordError &&
    confirmPassword.length > 0 &&
    !confirmMismatch &&
    vehicleRegistration.trim().length > 0 &&
    ambulanceType.length > 0;

  const handleGoBack = () => {
    router.back();
  };

  const handleCreateAccount = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDone(true);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {done ? (
          // Success state
          <ScrollView
            contentContainerStyle={[
              styles.successContent,
              { paddingBottom: insets.bottom + theme.spacing.xxxl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successIcon}>
              <Check size={40} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Driver account created</Text>
            <Text style={styles.successSubtitle}>
              Your ambulance is registered. You can start receiving emergency requests.
            </Text>

            <Button
              variant="primary"
              size="lg"
              onPress={() => router.push("/(ambulance)")}
              style={{ width: "100%" }}
            >
              Open driver dashboard
            </Button>
          </ScrollView>
        ) : (
          // Form state
          <View style={styles.container}>
            <Header onBack={handleGoBack} />

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + theme.spacing.xxxl },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Title section */}
              <View style={styles.titleSection}>
                <Text style={styles.badge}>Ambulance Driver</Text>
                <Text style={styles.title}>Register your ambulance</Text>
                <Text style={styles.subtitle}>
                  Enter your details and vehicle information.
                </Text>
              </View>

              {/* Personal Details Section */}
              <View style={styles.section}>
                <View style={styles.fieldsContainer}>
                  <AuthInput
                    icon={User}
                    label="Full name"
                    placeholder="Abdul Karim"
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <AuthInput
                    icon={Phone}
                    label="Phone number"
                    placeholder="+880 17XX-XXXXXX"
                    type="tel"
                    value={phone}
                    onChangeText={setPhone}
                    error={phoneError}
                    style={styles.input}
                  />

                  <AuthInput
                    icon={Mail}
                    label="Email"
                    placeholder="driver@example.com"
                    type="email"
                    value={email}
                    onChangeText={setEmail}
                    error={emailError}
                    style={styles.input}
                  />

                  <AuthInput
                    icon={Lock}
                    label="Password"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    error={passwordError}
                    style={styles.input}
                  />

                  <AuthInput
                    icon={Lock}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={confirmMismatch}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Vehicle Information Section */}
              <View style={styles.vehicleSection}>
                <Text style={styles.sectionLabel}>Vehicle information</Text>

                <View style={styles.fieldsContainer}>
                  <AuthInput
                    icon={IdCard}
                    label="Vehicle registration number"
                    placeholder="Dhaka Metro Cha 11-1111"
                    value={vehicleRegistration}
                    onChangeText={setVehicleRegistration}
                    style={styles.input}
                  />

                  <AuthSelect
                    label="Ambulance type"
                    options={ambulanceTypes}
                    value={ambulanceType}
                    onChange={setAmbulanceType}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Button section */}
              <View style={styles.buttonSection}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleCreateAccount}
                  disabled={!canSubmit}
                >
                  Create driver account
                </Button>

                <Text style={styles.loginPrompt}>
                  Already have an account?{" "}
                  <Text
                    style={styles.loginLink}
                    onPress={() => router.push("/(auth)/login")}
                  >
                    Log In
                  </Text>
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xs,
  },
  titleSection: {
    marginBottom: theme.spacing.xxl,
  },
  badge: {
    ...theme.typography.label,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.display,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  fieldsContainer: {
    gap: theme.spacing.md,
  },
  input: {
    marginTop: 0,
  },
  vehicleSection: {
    marginBottom: theme.spacing.xxl,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xxs,
  },
  buttonSection: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  loginPrompt: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  loginLink: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  successContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    ...theme.typography.display,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing.xxxl,
    maxWidth: 280,
  },
});
