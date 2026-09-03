import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text, ScrollView } from "react-native";
import {
  Navigation,
  Clock3,
} from "lucide-react-native";
import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { getMyAmbulanceProvider, type AmbulanceProvider } from "../../../services/ambulance";
import { updateMyLocation } from "../../../services/ambulance";
import { getCurrentLocation } from "../../../lib/location";
import { BigButton } from "../../../components/ui/BigButton";
import { theme } from "../../../theme";

export function AmbulanceDashboardScreen() {
  const { t, lang } = useLang();
  const [provider, setProvider] = useState<AmbulanceProvider | null>(null);
  const [providerLoading, setProviderLoading] = useState(true);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getMyAmbulanceProvider()
      .then((assignedProvider) => {
        if (active) setProvider(assignedProvider);
      })
      .catch((error: unknown) => {
        if (active) {
          setProviderError(
            error instanceof Error ? error.message : "Unable to load ambulance information."
          );
        }
      })
      .finally(() => {
        if (active) setProviderLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleUpdateLocation = async () => {
    setLocationUpdating(true);
    setLocationMessage(null);

    try {
      const location = await getCurrentLocation();
      const updatedLocation = await updateMyLocation(location.latitude, location.longitude);
      setLocationUpdatedAt(updatedLocation.updated_at);
      setLocationMessage("Location updated successfully.");
    } catch (error: unknown) {
      setLocationMessage(
        error instanceof Error ? error.message : "Unable to update your location."
      );
    } finally {
      setLocationUpdating(false);
    }
  };

  const driverName = mockData.driverName[lang];
  const lastLocation = {
    address: mockData.lastLocation.address[lang],
    updated: mockData.lastLocation.updated[lang],
  };

  return (
    <DriverShell showLanguage={false} hideNav={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DriverHeader
          title={driverName}
          subtitle={`${t("ambulanceId")} · ${provider?.id ?? mockData.ambulanceId}`}
        />

        <View style={styles.section}>
          <View style={styles.providerCard}>
            <View style={styles.providerCardContent}>
              <Text style={styles.providerLabel}>{t("provider")}</Text>
              <Text style={styles.providerName} numberOfLines={2}>
                {provider?.provider_name ?? "Ambulance provider"}
              </Text>
              {provider?.phone ? <Text style={styles.providerPhone}>{provider.phone}</Text> : null}
            </View>
            <StatusBadge tone={provider?.is_active ? "success" : "muted"}>
              {provider?.is_active ? "ACTIVE" : "INACTIVE"}
            </StatusBadge>
          </View>

          <View style={styles.locationCard}>
            <View
              style={[
                styles.locationIconWrapper,
                styles.locationIconOnline,
              ]}
            >
              <Navigation
                size={24}
                color={theme.colors.primary}
                strokeWidth={2.4}
              />
            </View>
            <View style={styles.locationContent}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>
                  {lang === "en" ? "Last Location" : "সর্বশেষ অবস্থান"}
                </Text>
                <Text style={styles.locationStatusTextOnline}>
                  {provider?.is_active ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
              {providerLoading ? (
                <ActivityIndicator color={theme.colors.primary} style={styles.providerLoader} />
              ) : (
                <Text style={styles.locationAddress} numberOfLines={1}>
                  {provider?.address ?? lastLocation.address}
                </Text>
              )}
              {providerError ? (
                <Text style={styles.providerError} numberOfLines={2}>
                  {providerError}
                </Text>
              ) : null}
              <View style={styles.locationTimeContainer}>
                <Clock3 size={14} color={theme.colors.mutedForeground} />
                <Text style={styles.locationTimeText}>
                  {locationUpdatedAt || provider?.updated_at
                    ? new Date(locationUpdatedAt || provider?.updated_at || "").toLocaleString()
                    : lastLocation.updated}
                </Text>
              </View>
            </View>
          </View>

          <BigButton
            icon={Navigation}
            onClick={handleUpdateLocation}
            style={styles.locationButton}
          >
            {locationUpdating ? "Updating location..." : "Update my location"}
          </BigButton>
          {locationMessage ? (
            <Text style={styles.locationMessage}>{locationMessage}</Text>
          ) : null}
        </View>
      </ScrollView>
    </DriverShell>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Make room for nav
  },
  section: {
    marginHorizontal: 20,
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
  },
  providerCardContent: {
    flex: 1,
  },
  providerLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 4,
  },
  providerPhone: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  locationButton: {
    marginTop: 12,
  },
  locationMessage: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  mt5: {
    marginTop: 20,
  },
  toggleButton: {
    width: "100%",
  },
  toggleButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 28,
    padding: 20,
    minHeight: 96,
  },
  toggleButtonOnline: {
    ...theme.shadows.shadowFloat,
  },
  toggleButtonOffline: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.shadowCard,
  },
  powerIconOnline: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  powerIconOffline: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitleOnline: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primaryForeground,
    lineHeight: 24,
  },
  toggleSubtitleOnline: {
    fontSize: 13.5,
    fontWeight: "600",
    color: theme.colors.primaryForeground,
    opacity: 0.85,
  },
  toggleTitleOffline: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 24,
  },
  toggleSubtitleOffline: {
    fontSize: 13.5,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  toggleTrackOnline: {
    width: 64,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 4,
  },
  toggleTrackOffline: {
    width: 64,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.border,
    padding: 4,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  shiftCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadows.shadowCard,
  },
  shiftLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  shiftValue: {
    fontSize: 14.5,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 2,
  },
  locationCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.primary + "40", // approx /25 opacity in primary
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
  },
  locationCardOffline: {
    borderColor: theme.colors.border,
    opacity: 0.7,
  },
  locationIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconOnline: {
    backgroundColor: theme.colors.primary + "1A", // ~10%
  },
  locationIconOffline: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  locationContent: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationStatusDotOnline: {
    backgroundColor: theme.colors.primary,
  },
  locationStatusDotOffline: {
    backgroundColor: theme.colors.mutedForeground,
  },
  locationStatusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  locationStatusTextOnline: {
    color: theme.colors.primary,
  },
  locationStatusTextOffline: {
    color: theme.colors.mutedForeground,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 4,
  },
  providerLoader: {
    alignSelf: "flex-start",
    marginVertical: 8,
  },
  providerError: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.emergency,
    marginTop: 6,
  },
  locationTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  locationTimeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  statsGrid: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 12,
    ...theme.shadows.shadowCard,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.foreground,
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  requestCard: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.emergency + "66", // approx /40
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    ...theme.shadows.shadowFloat,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  requestHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestBlinkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.white,
  },
  requestHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.white,
  },
  requestCriticalBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
  },
  requestCriticalText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: theme.colors.white,
    textTransform: "uppercase",
  },
  requestBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  requestTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requestTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.emergency + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  requestTypeTextContainer: {
    flex: 1,
  },
  requestTypeLabel: {
    fontSize: 11.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: theme.colors.mutedForeground,
  },
  requestTypeValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 2,
  },
  requestDetails: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  requestActions: {
    marginTop: 16,
    gap: 8,
  },
});
