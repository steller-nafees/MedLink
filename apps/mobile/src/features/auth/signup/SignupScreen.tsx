import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  UserPlus,
  X,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { bloodGroups, type BloodGroup } from "../../../lib/blood";
import {
  AuthRequestError,
  saveAuthToken,
  signUpCustomer,
} from "../../../services/auth";

// NOTE: signUpCustomer's TS signature in services/auth.ts previously only
// accepted { email, phone, password }. It now receives the full profile
// payload below — widen that type (or accept Record<string, unknown>) so
// this compiles cleanly.

type Gender = "MALE" | "FEMALE" | "OTHER";

const genderOptions: { label: string; value: Gender }[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

const STEPS = [
  { key: "personal", title: "Personal details", subtitle: "Tell us a bit about yourself." },
  { key: "contact", title: "Contact & address", subtitle: "How we can reach you." },
  { key: "security", title: "Secure your account", subtitle: "Choose a strong password." },
] as const;

// Kept separate from theme.colors since the palette has no dedicated
// warning/success tokens today — swap these for theme tokens if/when added.
const strengthScale = [
  { label: "Very weak", color: "#DC2626" },
  { label: "Weak", color: "#EA580C" },
  { label: "Fair", color: "#D97706" },
  { label: "Good", color: "#65A30D" },
  { label: "Strong", color: "#16A34A" },
];

const BD_PHONE_LOCAL = /^1[3-9]\d{8}$/; // local part after +880

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Personal
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(bloodGroups[0]);

  // Contact
  const [email, setEmail] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyPhoneLocal, setEmergencyPhoneLocal] = useState("");

  // Security
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
  const nationalIdPattern = /^(\d{10}|\d{13}|\d{17})$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  const err = (value: string, pattern: RegExp, message: string) =>
    value.trim().length > 0 && !pattern.test(value.trim()) ? message : undefined;

  const dobError = err(dateOfBirth, dobPattern, "Use format YYYY-MM-DD");
  const nationalIdError = err(nationalId, nationalIdPattern, "Enter a valid NID (10, 13 or 17 digits)");
  const emailError = err(email, emailPattern, "Enter a valid email address");
  const phoneError = err(phoneLocal, BD_PHONE_LOCAL, "Enter a valid 10-digit mobile number");
  const emergencyPhoneError = err(
    emergencyPhoneLocal,
    BD_PHONE_LOCAL,
    "Enter a valid 10-digit mobile number",
  );
  const passwordError =
    password.length > 0 && !passwordPattern.test(password)
      ? "Password doesn't meet the requirements below"
      : undefined;
  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords do not match"
      : undefined;

  const canProceedPersonal =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dateOfBirth.trim().length > 0 &&
    !dobError &&
    nationalId.trim().length > 0 &&
    !nationalIdError;

  const canProceedContact =
    email.trim().length > 0 &&
    !emailError &&
    phoneLocal.length > 0 &&
    !phoneError &&
    address.trim().length > 0 &&
    emergencyContactName.trim().length > 0 &&
    emergencyPhoneLocal.length > 0 &&
    !emergencyPhoneError;

  const canSubmit =
    !isSubmitting &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !passwordError &&
    !confirmMismatch &&
    password === confirmPassword &&
    termsAccepted;

  const goNext = () => {
    setSubmitError("");
    if (step === 0 && !canProceedPersonal) {
      setSubmitError("Please complete your personal details correctly.");
      return;
    }
    if (step === 1 && !canProceedContact) {
      setSubmitError("Please complete your contact details correctly.");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
    }
  };

  const goBack = () => {
    setSubmitError("");
    if (step === 0) {
      router.back();
      return;
    }
    setStep((value) => value - 1);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitError("Please complete all required fields correctly before creating your account.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await signUpCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth: dateOfBirth.trim(),
        nationalId: nationalId.trim(),
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: `+880${emergencyPhoneLocal}`,
        bloodGroup,
        email: email.trim().toLowerCase(),
        phone: `+880${phoneLocal}`,
        password,
        userType: "CUSTOMER",
      });

      await saveAuthToken(response.token.accessToken);
      router.replace("/(patient)");
    } catch (error) {
      const message =
        error instanceof AuthRequestError
          ? error.message
          : "Something went wrong while creating your account.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={styles.flex}
      >
        <View style={styles.headerWrap}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ChevronLeft size={18} color={theme.colors.foreground} />
          </Pressable>
          <StepProgress currentStep={step} />
          <View style={styles.backButtonSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <StepTransition step={step}>
            <View style={styles.headingBlock}>
              <Text style={styles.rolePill}>
                STEP {step + 1} OF {STEPS.length}
              </Text>
              <Text style={styles.title}>{STEPS[step].title}</Text>
              <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>
            </View>

            {step === 0 && (
              <View style={styles.formBlock}>
                <View style={styles.row}>
                  <LabelField
                    label="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                    containerStyle={styles.rowItem}
                  />
                  <LabelField
                    label="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                    containerStyle={styles.rowItem}
                  />
                </View>

                <ChipGroup
                  label="Gender"
                  options={genderOptions.map((option) => option.label)}
                  selected={genderOptions.find((option) => option.value === gender)?.label ?? ""}
                  onSelect={(label) => {
                    const found = genderOptions.find((option) => option.label === label);
                    if (found) setGender(found.value);
                  }}
                />

                <LabelField
                  label="Date of birth"
                  placeholder="YYYY-MM-DD"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  keyboardType="numbers-and-punctuation"
                  trailingIcon={Calendar}
                  error={dobError}
                />

                <LabelField
                  label="National ID number"
                  value={nationalId}
                  onChangeText={setNationalId}
                  keyboardType="number-pad"
                  trailingIcon={CreditCard}
                  error={nationalIdError}
                />

                <BloodGroupGrid selected={bloodGroup} onSelect={setBloodGroup} />
              </View>
            )}

            {step === 1 && (
              <View style={styles.formBlock}>
                <LabelField
                  label="Email"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setSubmitError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                />

                <PhoneField
                  label="Phone number"
                  value={phoneLocal}
                  onChangeText={(value) => {
                    setPhoneLocal(value);
                    setSubmitError("");
                  }}
                  error={phoneError}
                />

                <LabelField
                  label="Address"
                  value={address}
                  onChangeText={setAddress}
                  trailingIcon={MapPin}
                  multiline
                />

                <View style={styles.sectionDivider}>
                  <UserPlus size={14} color={theme.colors.mutedForeground} />
                  <Text style={styles.sectionDividerText}>Emergency contact</Text>
                </View>

                <LabelField
                  label="Contact name"
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                />

                <PhoneField
                  label="Contact phone"
                  value={emergencyPhoneLocal}
                  onChangeText={setEmergencyPhoneLocal}
                  error={emergencyPhoneError}
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.formBlock}>
                <LabelField
                  label="Password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setSubmitError("");
                  }}
                  secureTextEntry={!showPassword}
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingPress={() => setShowPassword((value) => !value)}
                  error={passwordError}
                />

                <PasswordStrength password={password} />

                <LabelField
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setSubmitError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  trailingIcon={showConfirmPassword ? EyeOff : Eye}
                  onTrailingPress={() => setShowConfirmPassword((value) => !value)}
                  error={confirmMismatch}
                />

                <Pressable
                  onPress={() => setTermsAccepted((value) => !value)}
                  style={styles.termsRow}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Check size={12} color={theme.colors.primaryForeground} />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the
                    <Text style={styles.termsLink}> Terms of Service</Text>
                    {" and "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </Pressable>
              </View>
            )}
          </StepTransition>

          <ErrorBanner message={submitError} />

          <View style={styles.footerRow}>
            {step > 0 && (
              <Pressable onPress={goBack} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            )}

            <Pressable
              disabled={isLastStep ? !canSubmit : false}
              onPress={isLastStep ? handleSubmit : goNext}
              style={styles.primaryButtonFlex}
            >
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.primaryButton,
                  isLastStep && !canSubmit && styles.primaryButtonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep
                    ? isSubmitting
                      ? "Creating account..."
                      : "Create Account"
                    : "Continue"}
                </Text>
                {!isLastStep && <ChevronRight size={16} color={theme.colors.primaryForeground} />}
              </LinearGradient>
            </Pressable>
          </View>

          {step === 0 && (
            <View style={styles.loginWrap}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepProgressWrap}>
      {STEPS.map((item, index) => (
        <View key={item.key} style={styles.stepProgressItem}>
          <View
            style={[
              styles.stepProgressBar,
              index <= currentStep && styles.stepProgressBarActive,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function StepTransition({ step, children }: { step: number; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  const prevStepRef = useRef(step);
  const direction = step >= prevStepRef.current ? 1 : -1;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    prevStepRef.current = step;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [18 * direction, 0] });

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>{children}</Animated.View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [message, shakeAnim]);

  if (!message) return null;

  const translateX = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  return (
    <Animated.View style={[styles.errorBanner, { transform: [{ translateX }] }]}>
      <View style={styles.errorBannerIcon}>
        <AlertCircle size={14} color={theme.colors.destructive} />
      </View>
      <Text style={styles.errorBannerText}>{message}</Text>
    </Animated.View>
  );
}

function ErrorHint({ text }: { text: string }) {
  return (
    <View style={styles.errorHintRow}>
      <AlertCircle size={11} color={theme.colors.destructive} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

function LabelField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  trailingIcon: TrailingIcon,
  onTrailingPress,
  autoCapitalize,
  error,
  multiline,
  containerStyle,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad" | "numbers-and-punctuation";
  secureTextEntry?: boolean;
  trailingIcon?: typeof Eye;
  onTrailingPress?: () => void;
  autoCapitalize?: "none" | "sentences" | "words";
  error?: string;
  multiline?: boolean;
  containerStyle?: object;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const anim = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateTo(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value.length === 0) animateTo(0);
  };

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [multiline ? 18 : 17, -9] });
  const labelFontSize = anim.interpolate({ inputRange: [0, 1], outputRange: [14.5, 11.5] });

  return (
    <View style={[styles.fieldGroup, containerStyle]}>
      <View
        style={[
          styles.fieldWrap,
          multiline && styles.fieldWrapMultiline,
          isFocused && styles.fieldWrapFocused,
          !!error && styles.fieldWrapError,
        ]}
      >
        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: error
                ? theme.colors.destructive
                : isFocused
                ? theme.colors.primary
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={isFocused ? placeholder : undefined}
          placeholderTextColor={theme.colors.mutedForeground}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {TrailingIcon && (
          <Pressable onPress={onTrailingPress} hitSlop={8} disabled={!onTrailingPress}>
            <TrailingIcon size={16} color={theme.colors.mutedForeground} />
          </Pressable>
        )}
      </View>
      {!!error && <ErrorHint text={error} />}
    </View>
  );
}

function PhoneField({
  label,
  value,
  onChangeText,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const anim = useRef(new Animated.Value(1)).current; // prefix always present, label stays floated

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 0, useNativeDriver: false }).start();
  }, [anim]);

  return (
    <View style={styles.fieldGroup}>
      <View
        style={[
          styles.fieldWrap,
          isFocused && styles.fieldWrapFocused,
          !!error && styles.fieldWrapError,
        ]}
      >
        <Text
          style={[
            styles.floatingLabel,
            styles.floatingLabelStatic,
            {
              color: error
                ? theme.colors.destructive
                : isFocused
                ? theme.colors.primary
                : theme.colors.mutedForeground,
            },
          ]}
        >
          {label}
        </Text>
        <View style={styles.phonePrefix}>
          <Text style={styles.phonePrefixText}>+880</Text>
        </View>
        <View style={styles.phoneDivider} />
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, "").slice(0, 10))}
          placeholder={isFocused ? "1XXXXXXXXX" : undefined}
          placeholderTextColor={theme.colors.mutedForeground}
          keyboardType="number-pad"
          maxLength={10}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
        />
      </View>
      {!!error && <ErrorHint text={error} />}
    </View>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isActive = option === selected;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BloodGroupGrid({
  selected,
  onSelect,
}: {
  selected: BloodGroup;
  onSelect: (value: BloodGroup) => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Blood group</Text>
      <View style={styles.bloodGrid}>
        {bloodGroups.map((group) => {
          const isActive = group === selected;
          return (
            <Pressable
              key={group}
              onPress={() => onSelect(group)}
              style={[styles.bloodCard, isActive && styles.bloodCardActive]}
            >
              {isActive && (
                <View style={styles.bloodCardCheck}>
                  <Check size={10} color={theme.colors.primaryForeground} />
                </View>
              )}
              <Text style={[styles.bloodCardText, isActive && styles.bloodCardTextActive]}>
                {group}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const criteria = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One lowercase letter", met: /[a-z]/.test(password) },
      { label: "One number", met: /\d/.test(password) },
      { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*]/.test(password) },
    ],
    [password],
  );

  const metCount = criteria.filter((item) => item.met).length;
  const scoreIndex = password.length === 0 ? -1 : Math.max(0, metCount - 1);
  const scale = scoreIndex >= 0 ? strengthScale[scoreIndex] : undefined;

  if (password.length === 0) return null;

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBarTrack}>
        {strengthScale.map((segment, index) => (
          <View
            key={segment.label}
            style={[
              styles.strengthBarSegment,
              index <= scoreIndex && { backgroundColor: segment.color },
            ]}
          />
        ))}
      </View>
      {scale && <Text style={[styles.strengthLabel, { color: scale.color }]}>{scale.label}</Text>}

      <View style={styles.criteriaList}>
        {criteria.map((item) => (
          <View key={item.label} style={styles.criteriaRow}>
            {item.met ? (
              <Check size={13} color="#16A34A" />
            ) : (
              <X size={13} color={theme.colors.mutedForeground} />
            )}
            <Text style={[styles.criteriaText, item.met && styles.criteriaTextMet]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
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
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonSpacer: {
    width: 36,
  },
  stepProgressWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  stepProgressItem: {
    flex: 1,
  },
  stepProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  stepProgressBarActive: {
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headingBlock: {
    marginBottom: 24,
  },
  rolePill: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.primary,
  },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    color: theme.colors.mutedForeground,
  },
  formBlock: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
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
    gap: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  fieldWrapMultiline: {
    height: undefined,
    minHeight: 84,
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: "flex-start",
  },
  fieldWrapFocused: {
    borderColor: theme.colors.primary,
  },
  fieldWrapError: {
    borderColor: theme.colors.destructive,
  },
  floatingLabel: {
    position: "absolute",
    left: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 4,
  },
  floatingLabelStatic: {
    top: -9,
    fontSize: 11.5,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  phonePrefix: {
    paddingRight: 2,
  },
  phonePrefixText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  bloodCard: {
    width: "22%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    position: "relative",
  },
  bloodCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  bloodCardCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodCardText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  bloodCardTextActive: {
    color: theme.colors.primary,
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  sectionDividerText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: theme.colors.mutedForeground,
  },
  strengthWrap: {
    gap: 8,
    marginTop: -4,
  },
  strengthBarTrack: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  criteriaList: {
    gap: 6,
    marginTop: 2,
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  criteriaText: {
    fontSize: 12.5,
    color: theme.colors.mutedForeground,
  },
  criteriaTextMet: {
    color: theme.colors.foreground,
  },
  errorHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.destructive,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 18,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.destructive + "40",
    backgroundColor: theme.colors.destructive + "14",
  },
  errorBannerIcon: {
    marginTop: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    color: theme.colors.destructive,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
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
  footerRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  primaryButtonFlex: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    flexDirection: "row",
    gap: 6,
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
    marginTop: 20,
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