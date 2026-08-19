import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../theme";

export type CardVariant =
  | "default"
  | "elevated"
  | "outlined"
  | "accent"
  | "interactive";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  const paddingStyles: Record<CardPadding, ViewStyle> = {
    none: { padding: 0 },
    sm: { padding: theme.spacing.sm },
    md: { padding: theme.spacing.lg },
    lg: { padding: theme.spacing.xl },
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xxl,
          ...theme.shadows.shadowElevated,
        };
      case "outlined":
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.xxl,
        };
      case "accent":
        return {
          backgroundColor: theme.colors.primaryLight,
          borderWidth: 1,
          borderColor: theme.colors.primaryContainer,
          borderRadius: theme.radii.xxl,
        };
      case "interactive":
      case "default":
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.borderLight,
          borderRadius: theme.radii.xxl,
          ...theme.shadows.shadowCard,
        };
    }
  };

  if (onPress || variant === "interactive") {
    return (
      <View style={[styles.wrapper, getVariantStyle(), style]}>
        <Pressable
          onPress={onPress}
          android_ripple={{
            color: "rgba(22, 168, 156, 0.08)",
            borderless: false,
          }}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [
            styles.pressable,
            paddingStyles[padding],
            pressed && styles.pressed,
          ]}
        >
          {children}
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        getVariantStyle(),
        paddingStyles[padding],
        style,
      ]}
    >
      {children}
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
  pressed: {
    opacity: 0.92,
  },
});
