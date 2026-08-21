import React, { ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "../../theme";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  style,
  transparent = true,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        !transparent && styles.bordered,
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            android_ripple={{
              color: "rgba(22, 168, 156, 0.12)",
              borderless: true,
              radius: 20,
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={22} color={theme.colors.foreground} />
          </Pressable>
        )}

        {(title || subtitle) && (
          <View style={styles.titleWrap}>
            {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    minHeight: 52,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -theme.spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  rightAction: {
    flexDirection: "row",
    alignItems: "center",
  },
});
