import { StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Tone } from "./StatusBadge";
import { theme } from "../../theme";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: Tone;
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  tone = "muted",
}: InfoRowProps) {
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
        <Icon size={20} color={iconColors[tone]} strokeWidth={2.3} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 2,
  },
});
