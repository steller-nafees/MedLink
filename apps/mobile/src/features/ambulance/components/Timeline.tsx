import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { theme } from "../../../theme";

interface TimelineProps {
  steps: string[];
  current: number;
}

export function Timeline({ steps, current }: TimelineProps) {
  return (
    <View style={styles.container}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <View key={s} style={styles.row}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  done
                    ? styles.circleDone
                    : active
                    ? styles.circleActive
                    : styles.circlePending,
                  active && styles.circleActiveRing,
                ]}
              >
                {done ? (
                  <Check size={18} color={theme.colors.primaryForeground} strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      done
                        ? styles.circleTextDone
                        : active
                        ? styles.circleTextActive
                        : styles.circleTextPending,
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    done ? styles.lineDone : styles.linePending,
                  ]}
                />
              )}
            </View>
            <View
              style={[
                styles.contentBox,
                active ? styles.contentBoxActive : styles.contentBoxInactive,
              ]}
            >
              <Text
                style={[
                  styles.contentText,
                  done || active
                    ? styles.contentTextBold
                    : styles.contentTextPending,
                ]}
              >
                {s}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  indicatorCol: {
    alignItems: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  circleDone: {
    backgroundColor: theme.colors.primary,
  },
  circleActive: {
    backgroundColor: theme.colors.primary + "26", // bg-primary/15 approx
  },
  circleActiveRing: {
    borderWidth: 4,
    borderColor: theme.colors.primary + "1A", // ring-4 ring-primary/10
  },
  circlePending: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  circleText: {
    fontSize: 13,
    fontWeight: "800",
  },
  circleTextDone: {
    color: theme.colors.primaryForeground,
  },
  circleTextActive: {
    color: theme.colors.primary,
  },
  circleTextPending: {
    color: theme.colors.mutedForeground,
  },
  line: {
    flex: 1,
    width: 4,
    borderRadius: 2,
    marginVertical: 4, // Spacing between circle and line
  },
  lineDone: {
    backgroundColor: theme.colors.primary,
  },
  linePending: {
    backgroundColor: theme.colors.border,
  },
  contentBox: {
    flex: 1,
    marginBottom: 8,
    borderRadius: theme.radii.xxl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentBoxActive: {
    backgroundColor: theme.colors.primary + "14", // bg-primary/8 approx
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  contentBoxInactive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70 approx
  },
  contentText: {
    fontSize: 15.5,
  },
  contentTextBold: {
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  contentTextPending: {
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
});
