import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  ViewStyle,
} from "react-native";
import { LucideIcon, Eye, EyeOff } from "lucide-react-native";
import { theme } from "../../theme";

interface AuthInputProps {
  icon?: LucideIcon;
  label?: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  defaultValue?: string;
  style?: ViewStyle;
}

export function AuthInput({
  icon: Icon,
  label,
  placeholder,
  type = "text",
  value,
  onChangeText,
  error,
  style,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isEmail = type === "email";
  const isTel = type === "tel";

  const keyboardType = isTel ? "phone-pad" : isEmail ? "email-address" : "default";
  const secureTextEntry = isPassword && !showPassword;

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? theme.colors.emergency : theme.colors.border },
        ]}
      >
        {Icon && (
          <Icon
            size={16}
            color={theme.colors.mutedForeground}
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <Eye size={16} color={theme.colors.mutedForeground} />
            ) : (
              <EyeOff size={16} color={theme.colors.mutedForeground} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    marginBottom: 6,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.shadows.shadowCard,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: theme.colors.emergency,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
