import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Phone,
  Mail,
  Lock,
  Check,
  Ambulance,
  IdCard,
  ChevronLeft,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { ambulanceTypes } from "../../../lib/auth-roles";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthSelect } from "../../../components/ui/AuthSelect";

export function DriverSignupScreen() {
  const router = useRouter();
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

    // Mock submission - in real app, call signUpDriver API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDone(true);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {done ? (
          // Success state
          <ScrollView
            contentContainerStyle={styles.successContent}
            showsVerticalScrollIndicator={false}
          >
              <View style={styles.successIcon}>
                <Check size={36} color={theme.colors.success} />
              </View>
              <Text style={styles.successTitle}>Driver account created</Text>
              <Text style={styles.successSubtitle}>
                Your ambulance is registered. You can start receiving emergency
                requests.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push("/(ambulance)")}
              >
                <Text style={styles.primaryButtonText}>
                  Open driver dashboard
                </Text>
              </Pressable>
            </ScrollView>
        ) : (
          // Form state
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={handleGoBack}>
                <ChevronLeft size={20} color={theme.colors.foreground} />
              </Pressable>
            </View>

            {/* Title section */}
            <View style={styles.titleSection}>
              <Text style={styles.badge}>🚑 Ambulance Driver</Text>
              <Text style={styles.title}>Register your ambulance</Text>
              <Text style={styles.subtitle}>
                Your details and vehicle information.
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
                  icon={Ambulance}
                  label="Ambulance type"
                  options={ambulanceTypes}
                  value={ambulanceType}
                  onChange={setAmbulanceType}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Button Section */}
            <View style={styles.buttonSection}>
              <Pressable
                style={[
                  styles.primaryButton,
                  !canSubmit && styles.primaryButtonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={!canSubmit}
              >
                <Text style={styles.primaryButtonText}>Create Driver Account</Text>
              </Pressable>

              <Text style={styles.loginPrompt}>
                Already have an account?{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => router.push("/(auth)/login")}
                >
                  Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.xxxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 28,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.foreground,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: theme.colors.mutedForeground,
  },
  section: {
    marginBottom: 28,
  },
  fieldsContainer: {
    gap: 12,
  },
  input: {
    marginTop: 0,
  },
  vehicleSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  buttonSection: {
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowFloat,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primaryForeground,
  },
  loginPrompt: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 8,
  },
  loginLink: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  // Success state styles
  successContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.success}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13.5,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 260,
  },
});
