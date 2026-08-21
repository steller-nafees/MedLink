import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  Navigation,
  MapPin,
  Flag,
  Ambulance,
  Building2,
  CheckCircle2,
  HeartPulse,
  Truck,
  StickyNote,
} from "lucide-react-native";

import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { Timeline } from "../components/Timeline";
import { HospitalCard } from "../components/HospitalCard";
import { BigButton } from "../../../components/ui/BigButton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { InfoRow } from "../../../components/ui/InfoRow";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";

export function AmbulanceTripScreen() {
  const { t, lang } = useLang();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [active, setActive] = useState(true);

  const steps = [
    t("accepted"),
    t("navigating"),
    t("arrived"),
    t("patientPickedUp"),
    t("hospitalReached"),
    t("completed"),
  ];

  const nextLabels = [
    t("navigateBtn"),
    t("markArrived"),
    t("pickedUp"),
    t("atHospital"),
    t("complete"),
    t("complete"),
  ];

  const nextIcons = [Navigation, Flag, Ambulance, Building2, CheckCircle2, CheckCircle2];
  const NextIcon = nextIcons[Math.min(step, 5)];

  if (!active) {
    return (
      <DriverShell showLanguage={false} hideNav={false}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <DriverHeader title={t("trip")} />
          <View style={styles.section}>
            <EmptyState
              icon={Truck}
              title={t("noTrip")}
              subtitle={t("noTripSub")}
              action={
                <BigButton
                  variant="outline"
                  onClick={() => {
                    setActive(true);
                    setStep(1);
                  }}
                >
                  {t("accept")}
                </BigButton>
              }
            />
          </View>
        </ScrollView>
      </DriverShell>
    );
  }

  const { incomingRequest, navigation, trip } = mockData;

  return (
    <DriverShell showLanguage={false} hideNav={false}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DriverHeader
          title={lang === "en" ? "Emergency" : "জরুরি"}
          subtitle={lang === "en" ? "Trip #AM-2291" : "ট্রিপ #AM-2291"}
          right={
            <StatusBadge tone="emergency" dot={false}>
              {t("critical")}
            </StatusBadge>
          }
        />

        {/* Status card */}
        <View style={styles.section}>
          <LinearGradient
            colors={["#D64545", theme.colors.emergency]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <Text style={styles.statusNextStep}>{t("nextStep")}</Text>
            <Text style={styles.statusCurrent}>{steps[Math.min(step, steps.length - 1)]}</Text>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxValue}>
                  {navigation.destination.etaMinutes} {t("minutes")}
                </Text>
                <Text style={styles.statusBoxLabel}>{t("eta")}</Text>
              </View>
              <View style={styles.statusBox}>
                <Text style={styles.statusBoxValue}>{navigation.destination.distance}</Text>
                <Text style={styles.statusBoxLabel}>{t("distance")}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Patient / route info */}
        <View style={[styles.section, styles.mt3]}>
          <View style={styles.infoCard}>
            <InfoRow
              icon={HeartPulse}
              tone="emergency"
              label={t("patient")}
              value={incomingRequest.patient[lang]}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={MapPin}
              tone="warning"
              label={t("pickup")}
              value={incomingRequest.pickup[lang]}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={Building2}
              tone="success"
              label={t("destination")}
              value={incomingRequest.destination[lang]}
            />
            <View style={styles.divider} />
            <InfoRow
              icon={Phone}
              tone="info"
              label={t("contact")}
              value={incomingRequest.contact}
            />
          </View>
        </View>

        {/* Primary actions */}
        <View style={[styles.section, styles.mt3]}>
          <View style={styles.actionGrid}>
            <View style={styles.actionHalf}>
              <BigButton
                icon={Phone}
                variant="outline"
                onClick={() => Linking.openURL(`tel:${incomingRequest.contact.replace(/\s+/g, '')}`)}
                style={styles.minHeight44}
              >
                {t("callPatient")}
              </BigButton>
            </View>
            <View style={styles.actionHalf}>
              <BigButton
                icon={Navigation}
                variant="primary"
                onClick={() => router.push("/navigate")}
                style={styles.minHeight44}
              >
                {t("navigateBtn")}
              </BigButton>
            </View>
          </View>
          <View style={styles.mt1_5}>
            <BigButton
              icon={NextIcon}
              variant={step >= steps.length - 1 ? "success" : "dark"}
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              {nextLabels[Math.min(step, nextLabels.length - 1)]}
            </BigButton>
          </View>
        </View>

        {/* Emergency details */}
        <View style={[styles.section, styles.mt4]}>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsHeader}>{t("emergencyDetails")}</Text>
            <View style={styles.badgeWrap}>
              <StatusBadge tone="emergency" dot={false}>
                {incomingRequest.type[lang]}
              </StatusBadge>
              <StatusBadge tone="warning" dot={false}>
                {t("severity")}: {t("critical")}
              </StatusBadge>
              <StatusBadge tone="info" dot={false}>
                {t("department")}: {trip.department[lang]}
              </StatusBadge>
            </View>
            
            <View style={styles.notesBox}>
              <StickyNote size={14} color={theme.colors.mutedForeground} style={styles.notesIcon} />
              <Text style={styles.notesText}>{trip.emergencyNotes[lang]}</Text>
            </View>
          </View>
        </View>

        {/* Hospital */}
        <View style={[styles.section, styles.mt3]}>
          <HospitalCard
            name={trip.hospital.name[lang]}
            address={trip.hospital.address[lang]}
            phone={trip.hospital.phone}
            department={trip.hospital.department[lang]}
            onNavigate="/navigate"
          />
        </View>

        {/* Timeline */}
        <View style={[styles.section, styles.mt4, styles.mb6]}>
          <Text style={styles.timelineHeader}>{t("timeline")}</Text>
          <Timeline steps={steps} current={step} />
        </View>
      </ScrollView>
    </DriverShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 16,
  },
  mt3: {
    marginTop: 12,
  },
  mt4: {
    marginTop: 16,
  },
  mt1_5: {
    marginTop: 6,
  },
  mb6: {
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: theme.radii.xxl, // rounded-2xl
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.shadows.shadowFloat,
  },
  statusNextStep: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.white,
    opacity: 0.85,
  },
  statusCurrent: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.white,
    lineHeight: 22,
  },
  statusGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  statusBox: {
    flex: 1,
    borderRadius: theme.radii.xl,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    alignItems: "center",
  },
  statusBoxValue: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.white,
  },
  statusBoxLabel: {
    fontSize: 10,
    color: theme.colors.white,
    opacity: 0.85,
  },
  infoCard: {
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70 approx
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    ...theme.shadows.shadowCard,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(202, 212, 224, 0.7)",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 6, // gap-1.5 is 6px
  },
  actionHalf: {
    flex: 1,
  },
  minHeight44: {
    minHeight: 44,
  },
  detailsCard: {
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)",
    backgroundColor: theme.colors.surface,
    padding: 14,
    ...theme.shadows.shadowCard,
  },
  detailsHeader: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  badgeWrap: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  notesBox: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 10,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18, // leading-relaxed
    color: theme.colors.foreground,
  },
  timelineHeader: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
});
