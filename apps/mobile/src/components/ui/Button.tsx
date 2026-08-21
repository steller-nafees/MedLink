import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "emergency"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  pill = true,
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const borderRadius = pill ? theme.radii.pill : theme.radii.lg;

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { minHeight: 38, paddingHorizontal: theme.spacing.md },
    md: { minHeight: 48, paddingHorizontal: theme.spacing.lg },
    lg: { minHeight: 54, paddingHorizontal: theme.spacing.xl },
  };

  const textTypography =
    size === "sm" ? theme.typography.caption : theme.typography.button;

  const isGradient = variant === "primary" || variant === "emergency";

  const gradientColors: Record<string, readonly [string, string, ...string[]]> = {
    primary: [theme.colors.secondary, theme.colors.primary],
    emergency: [theme.colors.destructive, theme.colors.emergencyDark],
  };

  const getTextColor = () => {
    if (variant === "primary" || variant === "emergency" || variant === "destructive") {
      return theme.colors.primaryForeground;
    }
    if (variant === "secondary") {
      return theme.colors.primaryDark;
    }
    if (variant === "outline") {
      return theme.colors.primary;
    }
    return theme.colors.foreground;
  };

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <>
          {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
          <Text
            style={[
              styles.text,
              textTypography,
              { color: getTextColor() },
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </View>
  );

  const getBaseStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: theme.colors.primaryContainer,
          borderWidth: 0,
        };
      case "outline":
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "destructive":
        return {
          backgroundColor: theme.colors.destructive,
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  if (isGradient && !disabled) {
    return (
      <View
        style={[
          styles.wrapper,
          { borderRadius },
          style,
        ]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled || loading}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.2)",
            borderless: false,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            accessibilityLabel || (typeof children === "string" ? children : undefined)
          }
          style={({ pressed }) => [
            styles.pressable,
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={gradientColors[variant] || gradientColors.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, sizeStyles[size], { borderRadius }]}
          >
            {content}
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        getBaseStyle(),
        { borderRadius },
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        android_ripple={{
          color: "rgba(22, 168, 156, 0.12)",
          borderless: false,
        }}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || (typeof children === "string" ? children : undefined)
        }
        style={({ pressed }) => [
          styles.container,
          sizeStyles[size],
          { borderRadius },
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  text: {
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
  loader: {
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.8,
  },
});
