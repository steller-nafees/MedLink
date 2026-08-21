import { StyleSheet, Text, Pressable, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import { theme } from "../../theme";

type BigButtonVariant = "primary" | "emergency" | "outline" | "success" | "dark";

interface BigButtonProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: BigButtonVariant;
  onClick?: () => void;
  href?: string;
  style?: StyleProp<ViewStyle>;
}

export function BigButton({
  icon: Icon,
  children,
  variant = "primary",
  onClick,
  href,
  style,
}: BigButtonProps) {
  const content = (
    <>
      {Icon && (
        <Icon
          size={24}
          color={
            variant === "outline" ? theme.colors.foreground : theme.colors.white
          }
          strokeWidth={2.4}
        />
      )}
      <Text
        style={[
          styles.text,
          variant === "outline" ? styles.textOutline : styles.textLight,
        ]}
      >
        {children}
      </Text>
    </>
  );

  const containerStyle = [styles.base, style];

  const InnerButton = () => {
    if (variant === "primary") {
      return (
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[...containerStyle, styles.primary]}
        >
          {content}
        </LinearGradient>
      );
    }
    if (variant === "emergency") {
      return (
        <LinearGradient
          colors={["#D64545", theme.colors.emergency]} // approximated gradient for emergency
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[...containerStyle, styles.emergency]}
        >
          {content}
        </LinearGradient>
      );
    }

    return (
      <Pressable
        style={({ pressed }) => [
          ...containerStyle,
          variant === "outline" && styles.outline,
          variant === "success" && styles.success,
          variant === "dark" && styles.dark,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
        onPress={onClick}
      >
        {content}
      </Pressable>
    );
  };

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable
          style={({ pressed }) => [
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <InnerButton />
        </Pressable>
      </Link>
    );
  }

  if (variant === "primary" || variant === "emergency") {
    // For gradients, we wrap in Pressable
    return (
      <Pressable
        onPress={onClick}
        style={({ pressed }) => [
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <InnerButton />
      </Pressable>
    );
  }

  return <InnerButton />;
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: theme.radii.xxxl,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  textLight: {
    color: theme.colors.white,
  },
  textOutline: {
    color: theme.colors.foreground,
  },
  primary: {
    ...theme.shadows.shadowFloat,
  },
  emergency: {
    ...theme.shadows.shadowFloat,
  },
  outline: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.shadowCard,
  },
  success: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.shadowCard,
  },
  dark: {
    backgroundColor: theme.colors.foreground,
    ...theme.shadows.shadowCard,
  },
});
