import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { theme } from "../../../theme";
import { accountTypes, type AccountRole } from "../../../lib/auth-roles";

interface AccountTypeCardsProps {
  onSelect: (role: AccountRole) => void;
  selected?: AccountRole;
}

export function AccountTypeCards({ onSelect, selected }: AccountTypeCardsProps) {
  const mobileTypes = accountTypes.filter((t) => !t.webOnly && t.id !== "driver");

  return (
    <View style={styles.container}>
      {mobileTypes.map((type) => {
        const isSelected = selected === type.id;
        const borderColor = isSelected
          ? theme.colors.primary
          : theme.colors.borderLight;
        const backgroundColor = isSelected
          ? theme.colors.primaryLight
          : theme.colors.surface;

        return (
          <View
            key={type.id}
            style={[
              styles.cardWrapper,
              theme.shadows.shadowCard,
              { borderColor, backgroundColor },
              isSelected && styles.cardSelected,
            ]}
          >
            <Pressable
              onPress={() => onSelect(type.id)}
              android_ripple={{
                color: "rgba(22, 168, 156, 0.12)",
                borderless: false,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${type.label} account: ${type.summary}`}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.emoji}>{type.emoji}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.label,
                      isSelected && { color: theme.colors.primaryDark },
                    ]}
                  >
                    {type.label}
                  </Text>
                </View>
                <Text style={styles.summary}>{type.summary}</Text>
              </View>

              <ChevronRight
                size={20}
                color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                style={styles.chevron}
              />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  cardWrapper: {
    borderRadius: theme.radii.xxl,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
  },
  summary: {
    ...theme.typography.bodySmall,
    marginTop: 4,
    color: theme.colors.textMuted,
  },
  chevron: {
    flexShrink: 0,
  },
});
