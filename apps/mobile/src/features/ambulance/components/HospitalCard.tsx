import React from "react";
import { StyleSheet, View, Text, Linking } from "react-native";
import { useRouter } from "expo-router";
import { BigButton } from "../../../components/ui/BigButton";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { theme } from "../../../theme";

interface HospitalCardProps {
  name: string;
  address: string;
  phone: string;
  department: string;
  onNavigate?: string;
}

export function HospitalCard({ name, address, phone, department, onNavigate }: HospitalCardProps) {
  const { t } = useLang();
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t("hospitalInfo")}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.address}>{address}</Text>
      
      <View style={styles.badges}>
        <StatusBadge tone="info" dot={false}>
          {department}
        </StatusBadge>
        <StatusBadge tone="muted" dot={false}>
          {phone}
        </StatusBadge>
      </View>

      <View style={styles.actions}>
        <View style={styles.buttonHalf}>
          <BigButton
            variant="outline"
            onClick={() => Linking.openURL(`tel:${phone}`)}
          >
            {t("callHospital")}
          </BigButton>
        </View>
        <View style={styles.buttonHalf}>
          <BigButton
            variant="primary"
            onClick={() => {
              if (onNavigate) {
                router.push(onNavigate as any);
              }
            }}
          >
            {t("navigateBtn")}
          </BigButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.xxxl, // rounded-3xl
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70 approx
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  name: {
    marginTop: 4, // mt-1
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 22, // leading-tight approx
  },
  address: {
    marginTop: 4, // mt-1
    fontSize: 13.5,
    color: theme.colors.mutedForeground,
  },
  badges: {
    marginTop: 8, // mt-2
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actions: {
    marginTop: 16, // mt-4
    flexDirection: "row",
    gap: 8,
  },
  buttonHalf: {
    flex: 1,
  },
});
