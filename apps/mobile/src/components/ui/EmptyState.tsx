import { StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Tone } from "./StatusBadge";
import { theme } from "../../theme";
import React from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  tone?: Tone;
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  tone = "muted",
}: EmptyStateProps) {
  const bgColors: Record<Tone, string> = {
    success: theme.colors.success + "1A",
    warning: theme.colors.warning + "1A",
    emergency: theme.colors.emergency + "1A",
    info: theme.colors.info + "1A",
    muted: theme.colors.surfaceVariant,
  };

  const iconColors: Record<Tone, string> = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    emergency: theme.colors.emergency,
    info: theme.colors.info,
    muted: theme.colors.mutedForeground,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: bgColors[tone] },
        ]}
      >
        <Icon size={36} color={iconColors[tone]} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.xxxl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.6)", // corresponding to bg-surface/60
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
  actionContainer: {
    width: "100%",
    marginTop: 20,
  },
});
