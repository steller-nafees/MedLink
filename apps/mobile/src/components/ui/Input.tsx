import React, { ReactNode, useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from "../../theme";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  type?: "text" | "email" | "tel" | "password" | "number";
  icon?: ReactNode;
  rightAction?: ReactNode;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  type = "text",
  icon,
  rightAction,
  error,
  helperText,
  disabled = false,
  style,
  inputStyle,
  ...restProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isEmail = type === "email";
  const isTel = type === "tel";
  const isNumber = type === "number";

  let keyboardType: KeyboardTypeOptions = "default";
  if (isEmail) keyboardType = "email-address";
  if (isTel) keyboardType = "phone-pad";
  if (isNumber) keyboardType = "numeric";

  const secureTextEntry = isPassword && !showPassword;

  const getBorderColor = () => {
    if (error) return theme.colors.emergency;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          disabled && styles.inputWrapperDisabled,
        ]}
      >
        {icon && <View style={styles.iconWrap}>{icon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, inputStyle]}
          autoCapitalize={isEmail || isPassword ? "none" : undefined}
          autoCorrect={!isPassword}
          {...restProps}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <Eye size={18} color={theme.colors.textMuted} />
            ) : (
              <EyeOff size={18} color={theme.colors.textMuted} />
            )}
          </Pressable>
        )}

        {rightAction && !isPassword && (
          <View style={styles.rightActionWrap}>{rightAction}</View>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.2,
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  inputWrapperFocused: {
    borderWidth: 1.5,
    backgroundColor: theme.colors.surface,
  },
  inputWrapperError: {
    borderColor: theme.colors.emergency,
  },
  inputWrapperDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
    opacity: 0.7,
  },
  iconWrap: {
    marginRight: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    ...theme.typography.bodyLarge,
    color: theme.colors.foreground,
    paddingVertical: theme.spacing.md,
  },
  eyeButton: {
    padding: theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  rightActionWrap: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.emergency,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxs,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xxs,
  },
});
