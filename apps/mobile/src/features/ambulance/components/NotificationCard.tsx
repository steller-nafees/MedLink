import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { theme } from "../../../theme";

interface NotificationCardProps {
  icon: React.ElementType;
  tone: "emergency" | "warning" | "info" | "success" | "muted";
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

export function NotificationCard({ icon: Icon, tone, title, body, time, unread }: NotificationCardProps) {
  return (
    <View
      style={[
        styles.card,
        unread ? styles.cardUnread : styles.cardRead,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          tone === "emergency" && styles.iconEmergency,
          tone === "warning" && styles.iconWarning,
          tone === "info" && styles.iconInfo,
          tone === "success" && styles.iconSuccess,
        ]}
      >
        <Icon
          size={22}
          strokeWidth={2.3}
          color={
            tone === "emergency"
              ? theme.colors.emergency
              : tone === "warning"
              ? theme.colors.warning
              : tone === "info"
              ? theme.colors.info
              : tone === "success"
              ? theme.colors.success
              : theme.colors.mutedForeground
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: theme.radii.xxxl,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderWidth: 1,
    ...theme.shadows.shadowCard,
  },
  cardRead: {
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70
  },
  cardUnread: {
    borderColor: theme.colors.primary + "66", // border-primary/40 (approx 40% hex is 66)
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmergency: {
    backgroundColor: theme.colors.emergency + "1A", // ~10% opacity
  },
  iconWarning: {
    backgroundColor: theme.colors.warning + "1A",
  },
  iconInfo: {
    backgroundColor: theme.colors.info + "1A",
  },
  iconSuccess: {
    backgroundColor: theme.colors.success + "1A",
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "800", // Web uses font-bold, but typically translated to 700 or 800 in this project's bold definitions
    color: theme.colors.foreground,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  body: {
    marginTop: 2,
    fontSize: 13.5,
    lineHeight: 20, // leading-relaxed
    color: theme.colors.mutedForeground,
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
});
