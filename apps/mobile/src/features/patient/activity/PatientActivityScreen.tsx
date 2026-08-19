import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { ChevronRight, Siren } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import {
  paymentStyle,
  requestKindLabel,
  serviceRequests,
  statusStyle,
  type PaymentStatus,
  type RequestStatus,
  type ServiceRequest,
} from "../../../lib/data";

const filters = ["Emergency", "Bookings"] as const;
type ActivityFilter = (typeof filters)[number];

export default function PatientActivityScreen() {
  const [tab, setTab] = useState<ActivityFilter>("Emergency");
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const palette = getPalette(isDark);
  const styles = createStyles(palette);
  const emergencyRequests = useMemo(
    () => serviceRequests.filter((request) => request.kind === "emergency"),
    [],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 128 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your emergency SOS requests, in one place</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((filter) => {
            const isSelected = tab === filter;
            const isDisabled = filter === "Bookings";

            return (
              <Pressable
                key={filter}
                disabled={isDisabled}
                onPress={() => setTab(filter)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                style={({ pressed }) => [
                  styles.filter,
                  isSelected ? styles.filterSelected : styles.filterDefault,
                  isDisabled && styles.filterDisabled,
                  pressed && !isDisabled && styles.filterPressed,
                ]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{filter}</Text>
                {isDisabled && (
                  <View style={styles.comingSoonPill}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === "Emergency" && (
          <View style={styles.requestList}>
            {emergencyRequests.map((request) => (
              <RequestCard key={request.id} request={request} palette={palette} />
            ))}
            {!emergencyRequests.length && (
              <Text style={styles.emptyEmergency}>No emergency activity yet.</Text>
            )}
          </View>
        )}

        {tab === "Bookings" && (
          <View style={styles.bookingsSection}>
            <View style={styles.bookingsEmptyState}>
              <View style={styles.comingSoonLargePill}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.bookingsCopy}>
                Bookings for beds, ICU and diagnostics will show up here.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function RequestCard({ request, palette }: { request: ServiceRequest; palette: ReturnType<typeof getPalette> }) {
  const status = statusStyle(request.status);
  const payment = paymentStyle(request.payment);
  const statusTone = getStatusTone(request.status);
  const paymentTone = getPaymentTone(request.payment);
  const payable = request.status === "completed" && request.payment !== "paid";
  const styles = createStyles(palette);

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.requestIcon}>
          <Siren size={20} color={theme.colors.emergency} strokeWidth={2} />
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.kindLabel}>{requestKindLabel[request.kind]}</Text>
          <Text style={styles.requestTitle} numberOfLines={1}>{request.title}</Text>
          <Text style={styles.hospital} numberOfLines={1}>{request.hospital}</Text>
        </View>
        <ChevronRight size={16} color={palette.muted} strokeWidth={2} style={styles.chevron} />
      </View>

      <View style={styles.metadataRow}>
        <StatusPill label={status.label} tone={statusTone} />
        <StatusPill label={payment.label} tone={paymentTone} />
        <Text style={styles.date}>{request.date} · {request.time}</Text>
      </View>

      {request.charge > 0 && (
        <View style={styles.chargeRow}>
          <View>
            <Text style={styles.chargeLabel}>MedLink service charge</Text>
            <Text style={styles.chargeAmount}>৳1,000</Text>
          </View>
          {payable && <Text style={styles.payNow}>Pay Now</Text>}
          {request.payment === "paid" && <Text style={styles.settled}>Settled</Text>}
        </View>
      )}
    </View>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "primary" | "success" | "warning" | "info" | "emergency" | "muted" }) {
  const styles = createStyles(getPalette(useColorScheme() === "dark"));
  return <View style={[styles.statusPill, styles[`${tone}Pill`]]}><Text style={[styles.statusText, styles[`${tone}Text`]]}>{label}</Text></View>;
}

function getStatusTone(status: RequestStatus) {
  return status === "completed" ? "success" : status === "accepted" ? "info" : status === "pending" ? "warning" : status === "cancelled" ? "muted" : "primary";
}

function getPaymentTone(payment: PaymentStatus) {
  return payment === "paid" || payment === "settled" ? "success" : payment === "collected" ? "info" : payment === "pending" ? "warning" : "emergency";
}

function getPalette(isDark: boolean) {
  return isDark
    ? {
        background: theme.colors.backgroundDark,
        surface: theme.colors.surfaceDark,
        variant: theme.colors.container,
        foreground: theme.colors.primaryForeground,
        muted: theme.colors.primaryLight,
        border: theme.colors.borderDark,
      }
    : {
        background: theme.colors.background,
        surface: theme.colors.surface,
        variant: theme.colors.surfaceVariant,
        foreground: theme.colors.foreground,
        muted: theme.colors.mutedForeground,
        border: theme.colors.borderLight,
      };
}

const createStyles = (palette: ReturnType<typeof getPalette>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 22, lineHeight: 26, letterSpacing: -0.44, color: palette.foreground },
  subtitle: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
  filters: { gap: 8, paddingHorizontal: 20, paddingTop: 4 },
  filter: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: theme.radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  filterSelected: { borderColor: theme.colors.transparent, backgroundColor: palette.foreground },
  filterDefault: { borderColor: palette.border, backgroundColor: palette.surface },
  filterDisabled: { opacity: 0.6 },
  filterPressed: { opacity: 0.84 },
  filterText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: palette.muted },
  filterTextSelected: { color: palette.background },
  comingSoonPill: { borderRadius: theme.radii.pill, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: theme.colors.primaryContainer },
  comingSoonLargePill: { marginBottom: 8, borderRadius: theme.radii.pill, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: theme.colors.primaryContainer },
  comingSoonText: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 9.5, lineHeight: 12, letterSpacing: 0.5, textTransform: "uppercase", color: theme.colors.primary },
  requestList: { gap: 10, marginTop: 16, paddingHorizontal: 20 },
  requestCard: { borderWidth: 1, borderColor: palette.border, borderRadius: theme.radii.xxxl, backgroundColor: palette.surface, padding: 16, ...theme.shadows.shadowCard },
  requestTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  requestIcon: { width: 44, height: 44, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: theme.radii.lg, backgroundColor: theme.colors.emergencyLight },
  requestInfo: { flex: 1, minWidth: 0 },
  kindLabel: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 10.5, lineHeight: 14, letterSpacing: 1.5, textTransform: "uppercase", color: palette.muted },
  requestTitle: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 19, color: palette.foreground },
  hospital: { fontFamily: theme.fonts.regular, fontSize: 12.5, lineHeight: 17, color: palette.muted },
  chevron: { marginTop: 4, flexShrink: 0 },
  metadataRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 12 },
  statusPill: { alignSelf: "flex-start", borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 10.5, lineHeight: 13, letterSpacing: 0.5 },
  primaryPill: { backgroundColor: theme.colors.primaryContainer }, primaryText: { color: theme.colors.primary },
  successPill: { backgroundColor: theme.colors.successLight }, successText: { color: theme.colors.success },
  warningPill: { backgroundColor: theme.colors.warningLight }, warningText: { color: theme.colors.warning },
  infoPill: { backgroundColor: theme.colors.infoLight }, infoText: { color: theme.colors.info },
  emergencyPill: { backgroundColor: theme.colors.emergencyLight }, emergencyText: { color: theme.colors.emergency },
  mutedPill: { backgroundColor: theme.colors.muted }, mutedText: { color: palette.muted },
  date: { marginLeft: "auto", fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 15, color: palette.muted },
  chargeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, borderRadius: theme.radii.lg, backgroundColor: palette.variant, paddingHorizontal: 14, paddingVertical: 10 },
  chargeLabel: { fontFamily: theme.fonts.regular, fontSize: 11, lineHeight: 14, color: palette.muted },
  chargeAmount: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 20, color: palette.foreground },
  payNow: { borderRadius: theme.radii.pill, backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: theme.colors.primaryForeground, ...theme.shadows.shadowCard },
  settled: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, lineHeight: 16, color: theme.colors.success },
  emptyEmergency: { paddingVertical: 40, textAlign: "center", fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
  bookingsSection: { marginTop: 16, paddingHorizontal: 20 },
  bookingsEmptyState: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: palette.border, borderRadius: theme.radii.xxl, backgroundColor: palette.surface, paddingVertical: 56, paddingHorizontal: 20 },
  bookingsCopy: { maxWidth: 220, textAlign: "center", fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
});
