import React from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { Phone, Building2, X, Navigation, ChevronLeft } from "lucide-react-native";
import { DriverShell } from "../components/DriverShell";
import { StylizedMap } from "../../../components/ui/StylizedMap";
import { BigButton } from "../../../components/ui/BigButton";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";

export function AmbulanceNavigateScreen() {
  const { t, lang } = useLang();
  const router = useRouter();
  const navData = mockData.navigation;

  return (
    <DriverShell showLanguage={false} hideNav>
      <View style={styles.container}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <StylizedMap
            style={styles.map}
          markers={navData.markers.map(m => ({
            ...m,
            label: m.label[lang]
          }))}
            route={navData.route}
          />

          {/* Top floating actions */}
          <View style={styles.topActions}>
            <Link href="/(ambulance)/trip" asChild>
              <Pressable style={styles.backButton}>
                <ChevronLeft size={24} color={theme.colors.foreground} strokeWidth={2.6} />
              </Pressable>
            </Link>
            <StatusBadge tone="emergency" dot={false} style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>{t("critical")}</Text>
            </StatusBadge>
          </View>

          {/* Turn banner */}
          <View style={styles.turnBanner}>
            <Navigation size={32} color={theme.colors.background} strokeWidth={2.6} />
            <View style={styles.turnBannerTextContent}>
              <Text style={styles.turnBannerDistance}>{navData.nextTurn.distance}</Text>
              <Text style={styles.turnBannerInstruction}>
                {navData.nextTurn.instruction[lang]}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Details Panel */}
        <View style={styles.bottomPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomPanelScrollContent}
          >
            <View style={styles.destinationCard}>
              <Text style={styles.destinationLabel}>{t("destination")}</Text>
              <Text style={styles.destinationValue}>{navData.destination.name[lang]}</Text>
              
              <View style={styles.etaGrid}>
                <View style={styles.etaBox}>
                  <Text style={styles.etaValueHighlight}>
                    {navData.destination.etaMinutes} {t("minutes")}
                  </Text>
                  <Text style={styles.etaLabelHighlight}>{t("eta")}</Text>
                </View>
                <View style={styles.distanceBox}>
                  <Text style={styles.distanceValue}>{navData.destination.distance}</Text>
                  <Text style={styles.distanceLabel}>{t("distance")}</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <View style={styles.actionsGrid}>
                <BigButton
                  icon={Phone}
                  variant="outline"
                  style={styles.halfButton}
                  onClick={() => {}} // dummy action
                >
                  {t("callPatient")}
                </BigButton>
                <BigButton
                  icon={Building2}
                  variant="outline"
                  style={styles.halfButton}
                  onClick={() => {}} // dummy action
                >
                  {t("callHospital")}
                </BigButton>
              </View>
              <BigButton icon={X} variant="emergency" onClick={() => router.push("/trip")}>
                {t("endNavigation")}
              </BigButton>
            </View>
          </ScrollView>
        </View>
      </View>
    </DriverShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  mapContainer: {
    position: "relative",
    height: 430, // matches web h-[430px]
  },
  map: {
    flex: 1,
    borderRadius: 0, // no border radius on full width map
    borderWidth: 0,
    borderBottomWidth: 1, // just a divider if needed, web has rounded-none
  },
  topActions: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.xl,
    backgroundColor: "rgba(255,255,255,0.95)", // bg-surface/95
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  criticalBadge: {
    backgroundColor: theme.colors.emergency,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
  },
  criticalBadgeText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 12.5,
  },
  turnBanner: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(23,37,47,0.95)", // bg-foreground/95 for light mode
    borderRadius: 24, // rounded-3xl
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20, // shadow-dialog approximation
  },
  turnBannerTextContent: {
    flex: 1,
  },
  turnBannerDistance: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.background,
    lineHeight: 26,
  },
  turnBannerInstruction: {
    fontSize: 14,
    color: theme.colors.background,
    opacity: 0.8,
    marginTop: 2,
  },
  bottomPanel: {
    flex: 1,
    marginTop: -32, // -mt-8
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    ...theme.shadows.shadowFloat, // to ensure it sits above the map
  },
  bottomPanelScrollContent: {
    paddingBottom: 24,
  },
  destinationCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70 approximation
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
  },
  destinationLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  destinationValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 24,
    marginTop: 4,
  },
  etaGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  etaBox: {
    flex: 1,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.primaryContainer,
    paddingVertical: 12,
    alignItems: "center",
  },
  etaValueHighlight: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  etaLabelHighlight: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.mutedForeground, // Web has text-muted-foreground. Or primary? Web says text-muted-foreground
    marginTop: 2,
  },
  distanceBox: {
    flex: 1,
    borderRadius: theme.radii.xxl,
    backgroundColor: theme.colors.surfaceVariant,
    paddingVertical: 12,
    alignItems: "center",
  },
  distanceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  distanceLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 8,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
});
