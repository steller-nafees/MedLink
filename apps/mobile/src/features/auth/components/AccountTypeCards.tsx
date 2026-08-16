import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { theme } from "../../../theme";
import { accountTypes, type AccountRole } from "../../../lib/auth-roles";

interface AccountTypeCardsProps {
  onSelect: (role: AccountRole) => void;
  selected?: AccountRole;
}

export function AccountTypeCards({ onSelect, selected }: AccountTypeCardsProps) {
  // Mobile only shows patient and driver (not hospital)
  const mobileTypes = accountTypes.filter((t) => !t.webOnly);

  return (
    <View style={styles.container}>
      {mobileTypes.map((type) => {
        const isSelected = selected === type.id;
        const borderColor = isSelected
          ? theme.colors.primary
          : theme.colors.border;
        const backgroundColor = isSelected
          ? theme.colors.primaryContainer
          : theme.colors.surface;

        return (
          <Pressable
            key={type.id}
            onPress={() => onSelect(type.id)}
            style={[
              styles.card,
              {
                borderColor,
                backgroundColor,
              },
              isSelected && styles.cardSelected,
              theme.shadows.shadowCard,
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>{type.emoji}</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.label}>{type.label}</Text>
              </View>
              <Text style={styles.summary}>{type.summary}</Text>
            </View>

            <ChevronRight
              size={20}
              color={theme.colors.mutedForeground}
              style={styles.chevron}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: theme.radii.xxxl,
    borderWidth: 1.5,
  },
  cardSelected: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 15.5,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  summary: {
    marginTop: 6,
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.mutedForeground,
  },
  chevron: {
    marginTop: 4,
    flexShrink: 0,
  },
});
