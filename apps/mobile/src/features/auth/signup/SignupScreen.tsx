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
  Check,
  ChevronLeft,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  UserRound,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { bloodGroups, type BloodGroup } from "../../../lib/blood";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(bloodGroups[0]);
  const [showBloodOptions, setShowBloodOptions] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword &&
    termsAccepted;

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

          <View style={styles.headingBlock}>
            <Text style={styles.rolePill}>👤 General User</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Takes less than a minute.</Text>
          </View>

          <View style={styles.formBlock}>
            <Field
              label="Full name"
              placeholder="Shirley Rahman"
              value={fullName}
              onChangeText={setFullName}
              icon={UserRound}
            />

            <Field
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Phone number"
              placeholder="+880 17XX-XXXXXX"
              value={phone}
              onChangeText={setPhone}
              icon={Phone}
              keyboardType="phone-pad"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Blood group</Text>
              <Pressable
                onPress={() => setShowBloodOptions((value) => !value)}
                style={[styles.fieldWrap, theme.shadows.shadowCard]}
              >
                <Droplets size={16} color={theme.colors.mutedForeground} />
                <Text style={styles.selectorText}>{bloodGroup}</Text>
                <View style={styles.selectorMeta}>
                  <Text style={styles.selectorChevron}>▾</Text>
                </View>
              </Pressable>

              {showBloodOptions && (
                <View style={[styles.optionsPanel, theme.shadows.shadowDialog]}>
                  {bloodGroups.map((group) => (
                    <Pressable
                      key={group}
                      onPress={() => {
                        setBloodGroup(group);
                        setShowBloodOptions(false);
                      }}
                      style={[
                        styles.optionButton,
                        group === bloodGroup && styles.optionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          group === bloodGroup && styles.optionButtonTextActive,
                        ]}
                      >
                        {group}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Field
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              icon={Lock}
              secureTextEntry={!showPassword}
              trailing={
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  {showPassword ? (
                    <EyeOff size={16} color={theme.colors.mutedForeground} />
                  ) : (
                    <Eye size={16} color={theme.colors.mutedForeground} />
                  )}
                </Pressable>
              }
            />

            <Field
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon={Lock}
              secureTextEntry={!showConfirmPassword}
              trailing={
                <Pressable onPress={() => setShowConfirmPassword((value) => !value)}>
                  {showConfirmPassword ? (
                    <EyeOff size={16} color={theme.colors.mutedForeground} />
                  ) : (
                    <Eye size={16} color={theme.colors.mutedForeground} />
                  )}
                </Pressable>
              }
              error={confirmMismatch ? "Passwords do not match" : undefined}
            />
          </View>

          <View style={styles.termsRow}>
            <Pressable
              onPress={() => setTermsAccepted((value) => !value)}
              style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
            >
              {termsAccepted && (
                <Check size={12} color={theme.colors.primaryForeground} />
              )}
            </Pressable>

            <Text style={styles.termsText}>
              I agree to the
              <Text style={styles.termsLink}> Terms of Service</Text>
              {' and '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <Pressable disabled={!canSubmit} onPress={() => router.push("/(patient)")}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.loginWrap}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  keyboardType,
  secureTextEntry,
  trailing,
  autoCapitalize,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: typeof UserRound;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  trailing?: React.ReactNode;
  autoCapitalize?: "none" | "sentences" | "words";
  error?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.fieldWrap, theme.shadows.shadowCard]}>
        {Icon ? <Icon size={16} color={theme.colors.mutedForeground} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
        {trailing}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 28,
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
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    color: theme.colors.mutedForeground,
  },
  formBlock: {
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
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
  selectorText: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
  },
  selectorMeta: {
    justifyContent: "center",
    alignItems: "center",
  },
  selectorChevron: {
    color: theme.colors.mutedForeground,
    fontSize: 16,
    fontWeight: "700",
  },
  optionsPanel: {
    marginTop: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 8,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionButtonActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  optionButtonText: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  optionButtonTextActive: {
    color: theme.colors.primary,
  },
  errorText: {
    marginTop: 2,
    paddingHorizontal: 4,
    fontSize: 12,
    color: theme.colors.destructive,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
    gap: 10,
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
  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: theme.colors.mutedForeground,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
  loginWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  loginText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
  },
});
