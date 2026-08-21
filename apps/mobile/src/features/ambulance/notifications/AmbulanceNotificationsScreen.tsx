import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Siren, Building2, UserX, CheckCircle2 } from "lucide-react-native";
import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { NotificationCard } from "../components/NotificationCard";
import { useLang, Key } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";

const iconMap = {
  Siren,
  Building2,
  UserX,
  CheckCircle2,
};

export function AmbulanceNotificationsScreen() {
  const { t, lang } = useLang();
  const en = lang === "en";

  return (
    <DriverShell showLanguage={false} hideNav={false}>
      <DriverHeader
        title={t("notifications")}
        subtitle={en ? "2 unread" : "২টি অপঠিত"}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {mockData.notifications.map((n, idx) => {
          const Icon = iconMap[n.icon as keyof typeof iconMap];

          return (
            <NotificationCard
              key={idx}
              icon={Icon}
              tone={n.tone as any}
              title={t(n.titleKey as Key)}
              body={n.body[lang]}
              time={n.time[lang]}
              unread={n.unread}
            />
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
});
