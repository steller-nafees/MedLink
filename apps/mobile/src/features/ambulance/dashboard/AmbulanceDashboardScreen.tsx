import { useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Power,
  Navigation,
  Clock3,
  WifiOff,
  Inbox,
  HeartPulse,
  Ambulance,
  MapPin,
  Building2,
  Phone,
  Check,
  X,
} from "lucide-react-native";
import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { BigButton } from "../../../components/ui/BigButton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { InfoRow } from "../../../components/ui/InfoRow";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";

export function AmbulanceDashboardScreen() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [request, setRequest] = useState(true);

  const driverName = mockData.driverName[lang];
  const shiftText = mockData.shift[lang];
  const lastLocation = {
    address: mockData.lastLocation.address[lang],
    updated: mockData.lastLocation.updated[lang],
  };

  const toggleOnline = () => setOnline(!online);

  const toggleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(online ? 28 : 0, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  return (
    <DriverShell showLanguage hideNav={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DriverHeader
          title={driverName}
          subtitle={`${t("ambulanceId")} · ${mockData.ambulanceId}`}
          right={
            <Pressable
              style={styles.bellButton}
              onPress={() => router.push("/notifications")}
            >
              <Bell size={20} color={theme.colors.foreground} strokeWidth={2.3} />
              <View style={styles.bellDot} />
            </Pressable>
          }
        />

        {/* Online / offline */}
        <View style={styles.section}>
          <Pressable onPress={toggleOnline} style={styles.toggleButton}>
            {online ? (
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.toggleButtonInner, styles.toggleButtonOnline]}
              >
                <View style={styles.powerIconOnline}>
                  <Power size={28} color={theme.colors.white} strokeWidth={2.6} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitleOnline}>{t("youAreOnline")}</Text>
                  <Text style={styles.toggleSubtitleOnline}>{t("tapToGoOffline")}</Text>
                </View>
                <View style={styles.toggleTrackOnline}>
                  <Animated.View style={[styles.toggleThumb, toggleAnimatedStyle]} />
                </View>
              </LinearGradient>
            ) : (
              <View style={[styles.toggleButtonInner, styles.toggleButtonOffline]}>
                <View style={styles.powerIconOffline}>
                  <Power size={28} color={theme.colors.mutedForeground} strokeWidth={2.6} />
                </View>
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleTitleOffline}>{t("youAreOffline")}</Text>
                  <Text style={styles.toggleSubtitleOffline}>{t("tapToGoOnline")}</Text>
                </View>
                <View style={styles.toggleTrackOffline}>
                  <Animated.View style={[styles.toggleThumb, toggleAnimatedStyle]} />
                </View>
              </View>
            )}
          </Pressable>

          {/* Shift status */}
          <View style={styles.shiftCard}>
            <View>
              <Text style={styles.shiftLabel}>{t("shift")}</Text>
              <Text style={styles.shiftValue}>{shiftText}</Text>
            </View>
            <StatusBadge tone={online ? "success" : "muted"}>
              {online ? t("available") : t("offline")}
            </StatusBadge>
          </View>

          {/* Last location */}
          <View style={[styles.locationCard, !online && styles.locationCardOffline]}>
            <View
              style={[
                styles.locationIconWrapper,
                online ? styles.locationIconOnline : styles.locationIconOffline,
              ]}
            >
              <Navigation
                size={24}
                color={online ? theme.colors.primary : theme.colors.mutedForeground}
                strokeWidth={2.4}
              />
            </View>
            <View style={styles.locationContent}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationLabel}>
                  {lang === "en" ? "Last Location" : "সর্বশেষ অবস্থান"}
                </Text>
                <View style={styles.locationStatus}>
                  <View
                    style={[
                      styles.locationStatusDot,
                      online ? styles.locationStatusDotOnline : styles.locationStatusDotOffline,
                    ]}
                  />
                  <Text
                    style={[
                      styles.locationStatusText,
                      online ? styles.locationStatusTextOnline : styles.locationStatusTextOffline,
                    ]}
                  >
                    {online ? (lang === "en" ? "LIVE" : "লাইভ") : (lang === "en" ? "OFFLINE" : "অফলাইন")}
                  </Text>
                </View>
              </View>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {lastLocation.address}
              </Text>
              <View style={styles.locationTimeContainer}>
                <Clock3 size={14} color={theme.colors.mutedForeground} />
                <Text style={styles.locationTimeText}>
                  {online
                    ? lastLocation.updated
                    : lang === "en"
                    ? "Location sharing is paused"
                    : "লোকেশন শেয়ারিং বন্ধ আছে"}
                </Text>
              </View>
            </View>
          </View>

          {/* Driver statistics */}
          <View style={styles.statsGrid}>
            {[
              { v: mockData.stats.tripsToday, l: t("tripsToday") },
              { v: `${mockData.stats.avgResponseMinutes} ${t("minutes")}`, l: t("avgResponse") },
              { v: mockData.stats.rating, l: t("rating") },
            ].map((stat) => (
              <View key={stat.l} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.v}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{stat.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency request */}
        <View style={[styles.section, styles.mt5]}>
          {!online ? (
            <EmptyState
              icon={WifiOff}
              tone="muted"
              title={t("offlineTitle")}
              subtitle={t("offlineSub")}
              action={
                <BigButton icon={Power} onClick={() => setOnline(true)}>
                  {t("online")}
                </BigButton>
              }
            />
          ) : request ? (
            <View style={styles.requestCard}>
              <LinearGradient
                colors={["#D64545", theme.colors.emergency]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.requestHeader}
              >
                <View style={styles.requestHeaderTitleRow}>
                  <View style={styles.requestBlinkDot} />
                  <Text style={styles.requestHeaderTitle}>{t("newRequest")}</Text>
                </View>
                <View style={styles.requestCriticalBadge}>
                  <Text style={styles.requestCriticalText}>{t("critical")}</Text>
                </View>
              </LinearGradient>

              <View style={styles.requestBody}>
                <View style={styles.requestTypeRow}>
                  <View style={styles.requestTypeIcon}>
                    <HeartPulse size={28} color={theme.colors.emergency} strokeWidth={2.4} />
                  </View>
                  <View style={styles.requestTypeTextContainer}>
                    <Text style={styles.requestTypeLabel}>{t("emergencyType")}</Text>
                    <Text style={styles.requestTypeValue}>
                      {mockData.incomingRequest.type[lang]}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.divider} />
                  <InfoRow
                    icon={Ambulance}
                    tone="info"
                    label={t("patient")}
                    value={mockData.incomingRequest.patient[lang]}
                  />
                  <View style={styles.divider} />
                  <InfoRow
                    icon={MapPin}
                    tone="warning"
                    label={t("pickup")}
                    value={mockData.incomingRequest.pickup[lang]}
                  />
                  <View style={styles.divider} />
                  <InfoRow
                    icon={Building2}
                    tone="success"
                    label={t("destination")}
                    value={mockData.incomingRequest.destination[lang]}
                  />
                  <View style={styles.divider} />
                  <InfoRow
                    icon={Phone}
                    tone="muted"
                    label={t("contact")}
                    value={mockData.incomingRequest.contact}
                  />
                </View>

                <View style={styles.requestActions}>
                  <BigButton
                    icon={Check}
                    variant="emergency"
                    onClick={() => router.push("/navigate")}
                  >
                    {t("accept")}
                  </BigButton>
                  <BigButton
                    icon={X}
                    variant="outline"
                    onClick={() => setRequest(false)}
                  >
                    {t("reject")}
                  </BigButton>
                </View>
              </View>
            </View>
          ) : (
            <EmptyState
              icon={Inbox}
              title={t("noRequests")}
              subtitle={t("noRequestsSub")}
              action={
                <BigButton variant="outline" onClick={() => setRequest(true)}>
                  {t("newRequest")}
                </BigButton>
              }
            />
          )}
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
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  bellDot: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.emergency,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  section: {
    marginHorizontal: 20,
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
