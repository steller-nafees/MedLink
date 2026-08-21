import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../theme";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "emergency"
  | "info"
  | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const getColors = (): { bg: string; text: string; dot: string } => {
    switch (variant) {
      case "success":
        return {
          bg: theme.colors.successLight,
          text: theme.colors.successDark,
          dot: theme.colors.success,
        };
      case "warning":
        return {
          bg: theme.colors.warningLight,
          text: theme.colors.warningDark,
          dot: theme.colors.warning,
        };
      case "error":
        return {
          bg: theme.colors.errorLight,
          text: theme.colors.errorDark,
          dot: theme.colors.error,
        };
      case "emergency":
        return {
          bg: theme.colors.emergencyLight,
          text: theme.colors.emergencyDark,
          dot: theme.colors.emergency,
        };
      case "info":
        return {
          bg: theme.colors.infoLight,
          text: theme.colors.infoDark,
          dot: theme.colors.info,
        };
      case "neutral":
        return {
          bg: theme.colors.muted,
          text: theme.colors.textSecondary,
          dot: theme.colors.textMuted,
        };
      case "primary":
      default:
        return {
          bg: theme.colors.primaryLight,
          text: theme.colors.primaryDark,
          dot: theme.colors.primary,
        };
    }
  };

  const badgeColors = getColors();

  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeColors.bg },
        isSmall ? styles.badgeSm : styles.badgeMd,
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: badgeColors.dot },
            isSmall && styles.dotSm,
          ]}
        />
      )}
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[
          styles.text,
          isSmall ? theme.typography.caption : theme.typography.caption,
          { color: badgeColors.text, fontSize: isSmall ? 11 : 12 },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  badgeMd: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  iconWrap: {
    marginRight: 2,
  },
  text: {
    fontWeight: "600",
  },
});
