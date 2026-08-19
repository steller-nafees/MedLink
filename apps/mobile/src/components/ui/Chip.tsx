import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../theme";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  style,
  accessibilityLabel,
}: ChipProps) {
  return (
    <View
      style={[
        styles.wrapper,
        selected ? styles.wrapperSelected : styles.wrapperUnselected,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        android_ripple={{
          color: selected ? "rgba(255, 255, 255, 0.2)" : "rgba(22, 168, 156, 0.12)",
          borderless: false,
        }}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={accessibilityLabel || label}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text
          style={[
            styles.text,
            selected ? styles.textSelected : styles.textUnselected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radii.pill,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  wrapperUnselected: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  wrapperSelected: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
    gap: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...theme.typography.caption,
    fontWeight: "600",
  },
  textUnselected: {
    color: theme.colors.textSecondary,
  },
  textSelected: {
    color: theme.colors.primaryForeground,
  },
});
