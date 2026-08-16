<<<<<<< Updated upstream
import SignupScreen from "../../features/auth/signup/SignupScreen";

export default function SignupRoute() {
  return <SignupScreen />;
}
=======
import { useState } from "react";
import {
  Alert,
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
  Check,
  ChevronDown,
  ChevronLeft,
  Droplets,
  Lock,
  Mail,
  Phone,
  Siren,
  UserRound,
} from "lucide-react-native";
import { GuestSosModal } from "../../components/auth/GuestSosModal";
import { theme } from "../../theme";
import { bloodGroups, type BloodGroup } from "../../lib/blood";

export default function SignupScreen() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(bloodGroups[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const confirmMismatch =
    submitted && confirmPassword.length > 0 && password !== confirmPassword;

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit =
    fullName.trim().length > 0 &&
    isEmailValid &&
    phone.trim().length > 0 &&
    password.length > 0 &&
    password === confirmPassword &&
    acceptedTerms;

  const chooseBloodGroup = () => {
    Alert.alert(
      "Select blood group",
      undefined,
      bloodGroups.map((group) => ({
        text: group,
        onPress: () => setBloodGroup(group),
      }))
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (canSubmit) {
      setDone(true);
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
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={18} color={theme.colors.foreground} />
            </Pressable>
          </View>

          {done ? (
            <View style={styles.successWrap}>
              <View style={styles.successIconWrap}>
                <Check size={28} color={theme.colors.success} />
              </View>
              <Text style={styles.successTitle}>Account created</Text>
              <Text style={styles.successText}>
                You&apos;re all set. MedLink is ready for everyday care and emergencies.
              </Text>
              <Pressable onPress={() => router.replace("/(patient)")} style={styles.buttonWrap}>
                <LinearGradient
                  colors={[theme.colors.secondary, theme.colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Enter MedLink</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.headingBlock}>
                <Text style={styles.rolePill}>👤 General User</Text>
                <Text style={styles.title}>Create your account</Text>
                <Text style={styles.subtitle}>Takes less than a minute.</Text>
              </View>

              <View style={styles.formBlock}>
                <Field
                  icon={<UserRound size={16} color={theme.colors.mutedForeground} />}
                  label="Full name"
                  placeholder="Shirley Rahman"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Field
                  icon={<Mail size={16} color={theme.colors.mutedForeground} />}
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Field
                  icon={<Phone size={16} color={theme.colors.mutedForeground} />}
                  label="Phone number"
                  placeholder="+880 17XX-XXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <Field
                  icon={<Droplets size={16} color={theme.colors.mutedForeground} />}
                  label="Blood group"
                  value={bloodGroup}
                  onPress={chooseBloodGroup}
                  showSelector
                  actionIcon={<ChevronDown size={16} color={theme.colors.mutedForeground} />}
                />

                <Field
                  icon={<Lock size={16} color={theme.colors.mutedForeground} />}
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  actionIcon={
                    showPassword ? (
                      <Text style={styles.eyeText}>Hide</Text>
                    ) : (
                      <Text style={styles.eyeText}>Show</Text>
                    )
                  }
                  onActionPress={() => setShowPassword((value) => !value)}
                />

                <Field
                  icon={<Lock size={16} color={theme.colors.mutedForeground} />}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  actionIcon={
                    showConfirmPassword ? (
                      <Text style={styles.eyeText}>Hide</Text>
                    ) : (
                      <Text style={styles.eyeText}>Show</Text>
                    )
                  }
                  onActionPress={() => setShowConfirmPassword((value) => !value)}
                  error={confirmMismatch ? "Passwords do not match" : undefined}
                />

                <Pressable
                  onPress={() => setAcceptedTerms((value) => !value)}
                  style={styles.termsRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      acceptedTerms && styles.checkboxChecked,
                      submitted && !acceptedTerms && styles.checkboxError,
                    ]}
                  >
                    {acceptedTerms ? (
                      <Check size={12} color={theme.colors.primaryForeground} />
                    ) : null}
                  </View>
                  <Text style={styles.termsText}>I agree to the Terms and Privacy Policy.</Text>
                </Pressable>
                {submitted && !acceptedTerms ? (
                  <Text style={styles.errorText}>Please accept the terms and conditions.</Text>
                ) : null}
              </View>

              <View style={styles.bottomBlock}>
                <Pressable onPress={handleSubmit} style={styles.buttonWrap}>
                  <LinearGradient
                    colors={[theme.colors.secondary, theme.colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  </LinearGradient>
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

                <View style={styles.loginWrap}>
                  <Text style={styles.loginText}>Already have an account? </Text>
                  <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Text style={styles.loginLink}>Login</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
    </SafeAreaView>
  );
}

function Field({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  actionIcon,
  onActionPress,
  error,
  showSelector,
  onPress,
}: {
  icon?: React.ReactNode;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  actionIcon?: React.ReactNode;
  onActionPress?: () => void;
  error?: string;
  showSelector?: boolean;
  onPress?: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={onPress}
        style={[
          styles.fieldWrap,
          theme.shadows.shadowCard,
          error ? { borderColor: theme.colors.destructive, borderWidth: 1 } : undefined,
        ]}
      >
        {icon}
        {showSelector ? (
          <Text style={styles.selectorText}>{value}</Text>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.mutedForeground}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            style={styles.input}
          />
        )}
        {actionIcon ? (
          <Pressable onPress={onActionPress} hitSlop={8}>
            {actionIcon}
          </Pressable>
        ) : null}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerWrap: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border + "B3",
    alignItems: "center",
    justifyContent: "center",
  },
  headingBlock: {
    marginTop: 10,
    marginBottom: 20,
  },
  rolePill: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.primary,
  },
  title: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.5,
    color: theme.colors.foreground,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    color: theme.colors.mutedForeground,
  },
  formBlock: {
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    paddingLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
    paddingVertical: 0,
  },
  selectorText: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
  },
  eyeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  errorText: {
    paddingLeft: 4,
    fontSize: 12,
    color: theme.colors.destructive,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxError: {
    borderColor: theme.colors.destructive,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.mutedForeground,
  },
  bottomBlock: {
    marginTop: 20,
    gap: 10,
  },
  buttonWrap: {
    width: "100%",
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
  emergencyButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
  loginWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
  loginText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  successText: {
    marginTop: 8,
    maxWidth: 260,
    fontSize: 13.5,
    lineHeight: 20,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
});
>>>>>>> Stashed changes
