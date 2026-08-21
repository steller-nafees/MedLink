import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { HeartPulse, Wind, Bandage, Clock, Building2 } from "lucide-react-native";
import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";

const iconMap = {
  HeartPulse,
  Wind,
  Bandage,
};

export function AmbulanceHistoryScreen() {
  const { t, lang } = useLang();
  const en = lang === "en";

  return (
    <DriverShell showLanguage={false} hideNav={false}>
      <DriverHeader
        title={t("tripHistory")}
        subtitle={en ? "32 trips this week" : "এই সপ্তাহে ৩২টি ট্রিপ"}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mockData.tripHistory.map((tr, idx) => {
          const Icon = iconMap[tr.icon as keyof typeof iconMap];

          return (
            <View key={idx} style={styles.card}>
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.iconBox,
                    tr.tone === "emergency"
                      ? styles.iconBoxEmergency
                      : tr.tone === "warning"
                      ? styles.iconBoxWarning
                      : styles.iconBoxInfo,
                  ]}
                >
                  <Icon
                    size={24}
                    strokeWidth={2.3}
                    color={
                      tr.tone === "emergency"
                        ? theme.colors.emergency
                        : tr.tone === "warning"
                        ? theme.colors.warning
                        : theme.colors.info
                    }
                  />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.typeText} numberOfLines={1}>
                    {tr.type[lang]}
                  </Text>
                  <Text style={styles.dateText}>{tr.date[lang]}</Text>
                </View>
                <StatusBadge tone="success" dot={false}>
                  {t("completed")}
                </StatusBadge>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.infoPill}>
                  <Building2 size={16} color={theme.colors.mutedForeground} />
                  <Text style={styles.infoPillText} numberOfLines={1}>
                    {tr.hospital[lang]}
                  </Text>
                </View>
                <View style={styles.infoPill}>
                  <Clock size={16} color={theme.colors.mutedForeground} />
                  <Text style={styles.infoPillText} numberOfLines={1}>
                    {tr.dur[lang]}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </DriverShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: theme.radii.xxxl,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxEmergency: {
    backgroundColor: theme.colors.emergency + "1A", // /10 opacity
  },
  iconBoxWarning: {
    backgroundColor: theme.colors.warning + "1A",
  },
  iconBoxInfo: {
    backgroundColor: theme.colors.info + "1A",
  },
  textBlock: {
    flex: 1,
  },
  typeText: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600", // font-medium
    color: theme.colors.mutedForeground,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  infoPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoPillText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
});
