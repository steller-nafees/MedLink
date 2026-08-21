import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { theme } from "../../../theme";

interface DriverHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: string;
}

export function DriverHeader({ title, subtitle, right, back }: DriverHeaderProps) {
  return (
    <View style={styles.header}>
      {back && (
        <Link href={back as any} style={styles.backButton}>
          <View style={styles.backButtonInner}>
            <ChevronLeft size={20} color={theme.colors.foreground} strokeWidth={2.6} />
          </View>
        </Link>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.shadowCard,
  },
  backButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  right: {
    paddingTop: 2,
  },
});
