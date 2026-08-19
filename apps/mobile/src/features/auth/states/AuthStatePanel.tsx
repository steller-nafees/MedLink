import React, { ReactNode, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Inbox, Loader2, TriangleAlert, WifiOff } from "lucide-react-native";
import { theme } from "../../../theme";
import type { AuthStateIcon, AuthStateTone } from "./authStateMockData";

const icons = { Loader2, WifiOff, TriangleAlert, Inbox } as const;

export interface AuthStatePanelProps {
  icon: AuthStateIcon;
  tone?: AuthStateTone;
  title: string;
  description: string;
  action?: ReactNode;
  spinning?: boolean;
}

export function AuthStatePanel({
  icon,
  tone = "primary",
  title,
  description,
  action,
  spinning = false,
}: AuthStatePanelProps) {
  const isDark = useColorScheme() === "dark";
  const rotation = useRef(new Animated.Value(0)).current;
  const Icon = icons[icon];

  useEffect(() => {
    if (!spinning) return;
    const animation = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 900, useNativeDriver: true }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotation, spinning]);

  const palette = getPalette(isDark);
  const iconStyle = tone === "emergency"
    ? styles.emergencyIcon
    : tone === "muted"
      ? styles.mutedIcon
      : styles.primaryIcon;
  const iconColor = tone === "emergency"
    ? theme.colors.emergency
    : tone === "muted"
      ? palette.muted
      : palette.primary;

  return (
    <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={[styles.iconBox, iconStyle]}>
        <Animated.View
          style={spinning ? { transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] } : undefined}
        >
          <Icon size={24} color={iconColor} strokeWidth={2} />
        </Animated.View>
      </View>
      <Text style={[styles.title, { color: palette.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.muted }]}>{description}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

function getPalette(isDark: boolean) {
  return {
    surface: isDark ? theme.colors.surfaceDark : theme.colors.surface,
    foreground: isDark ? theme.colors.primaryForeground : theme.colors.foreground,
    muted: isDark ? theme.colors.primaryForeground : theme.colors.mutedForeground,
    border: isDark ? theme.colors.borderDark : theme.colors.border,
    primary: isDark ? theme.colors.secondary : theme.colors.primary,
  };
}

const styles = StyleSheet.create({
  panel: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    ...theme.shadows.shadowCard,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryIcon: { backgroundColor: theme.colors.primaryContainer },
  mutedIcon: { backgroundColor: theme.colors.surfaceVariant },
  emergencyIcon: { backgroundColor: theme.colors.emergencyLight },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 260,
    textAlign: "center",
    opacity: 0.8,
  },
  action: { alignSelf: "stretch", marginTop: 20 },
});
