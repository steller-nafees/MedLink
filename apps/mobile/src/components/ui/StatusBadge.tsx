import { StyleSheet, Text, View, StyleProp, ViewStyle } from "react-native";
import Animated, {
  withRepeat,
  withTiming,
  useAnimatedStyle,
  withSequence,
  useSharedValue,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";
import { theme } from "../../theme";

export type Tone = "success" | "warning" | "emergency" | "info" | "muted";

interface StatusBadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({
  tone = "muted",
  children,
  dot = true,
  style,
}: StatusBadgeProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (tone === "emergency" && dot) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = 1;
    }
  }, [tone, dot]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bgColors: Record<Tone, string> = {
    success: theme.colors.success + "1A", // ~10% opacity
    warning: theme.colors.warning + "1A",
    emergency: theme.colors.emergency + "1A",
    info: theme.colors.info + "1A",
    muted: theme.colors.surfaceVariant,
  };

  const textColors: Record<Tone, string> = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    emergency: theme.colors.emergency,
    info: theme.colors.info,
    muted: theme.colors.mutedForeground,
  };

  const dotColors: Record<Tone, string> = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    emergency: theme.colors.emergency,
    info: theme.colors.info,
    muted: theme.colors.mutedForeground, // bg-current fallback in web
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColors[tone] },
        style,
      ]}
    >
      {dot && (
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColors[tone] },
            tone === "emergency" && animatedStyle,
          ]}
        />
      )}
      <Text style={[styles.text, { color: textColors[tone] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12.5,
    fontWeight: "800",
  },
});
