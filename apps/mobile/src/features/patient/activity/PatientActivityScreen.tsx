import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { BedDouble, RefreshCw, Siren } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import {
  getMedicalEvents,
  getReservations,
  type MedicalEvent,
  type Reservation,
} from "../../../services/patient-records";

const filters = ["Emergency", "Bookings"] as const;
type ActivityFilter = (typeof filters)[number];

export default function PatientActivityScreen() {
  const [tab, setTab] = useState<ActivityFilter>("Emergency");
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const palette = getPalette(isDark);
  const styles = createStyles(palette);
  const emergencyEvents = events.filter((event) => event.is_emergency);

  const loadActivity = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [eventRecords, reservationRecords] = await Promise.all([
        getMedicalEvents(),
        getReservations(),
      ]);

      setEvents(eventRecords);
      setReservations(reservationRecords);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load activity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [loadActivity]),
  );

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 128 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadActivity(true)}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>Your emergency SOS requests and hospital reservations</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh activity"
            onPress={() => loadActivity(true)}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshPressed]}
          >
            <RefreshCw size={17} color={palette.foreground} strokeWidth={2.2} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((filter) => {
            const isSelected = tab === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setTab(filter)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.filter,
                  isSelected ? styles.filterSelected : styles.filterDefault,
                  pressed && styles.filterPressed,
                ]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{filter}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <StatePanel palette={palette} title="Loading activity..." />
        ) : error ? (
          <StatePanel palette={palette} title={error} actionLabel="Try again" onAction={() => loadActivity()} />
        ) : tab === "Emergency" ? (
          <View style={styles.requestList}>
            {emergencyEvents.map((event) => (
              <EventCard key={event.id} event={event} palette={palette} />
            ))}
            {!emergencyEvents.length && (
              <StatePanel palette={palette} title="No emergency activity yet." />
            )}
          </View>
        ) : (
          <View style={styles.requestList}>
            {reservations.map((reservation) => (
              <ReservationActivityCard key={reservation.id} reservation={reservation} palette={palette} />
            ))}
            {!reservations.length && (
              <StatePanel palette={palette} title="No reservations yet." />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function EventCard({ event, palette }: { event: MedicalEvent; palette: ReturnType<typeof getPalette> }) {
  const styles = createStyles(palette);

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.requestIcon}>
          <Siren size={20} color={theme.colors.emergency} strokeWidth={2} />
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.kindLabel}>Emergency SOS</Text>
          <Text style={styles.requestTitle} numberOfLines={2}>
            {event.user_description?.trim() || "Emergency medical event"}
          </Text>
          <Text style={styles.hospital} numberOfLines={1}>
            {event.severity ? `${displayEnum(event.severity)} severity` : "Severity not specified"}
          </Text>
        </View>
      </View>

      <View style={styles.metadataRow}>
        <StatusPill label={displayEnum(event.event_status)} tone={getRecordTone(event.event_status)} palette={palette} />
        <Text style={styles.date}>{formatDate(event.created_at)}</Text>
      </View>
    </View>
  );
}

function ReservationActivityCard({ reservation, palette }: { reservation: Reservation; palette: ReturnType<typeof getPalette> }) {
  const styles = createStyles(palette);

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={[styles.requestIcon, styles.bookingIcon]}>
          <BedDouble size={20} color={theme.colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.kindLabel}>Hospital reservation</Text>
          <Text style={styles.requestTitle} numberOfLines={1}>{reservation.hospital_name}</Text>
          <Text style={styles.hospital} numberOfLines={1}>
            {reservation.ward_name ?? "Ward not assigned"} · Bed {reservation.bed_number ?? "not assigned"}
          </Text>
        </View>
      </View>

      <View style={styles.metadataRow}>
        <StatusPill
          label={displayEnum(reservation.reservation_status)}
          tone={getRecordTone(reservation.reservation_status)}
          palette={palette}
        />
        <StatusPill label={displayEnum(reservation.reservation_mode)} tone="info" palette={palette} />
        <Text style={styles.date}>{formatDate(reservation.requested_at ?? reservation.created_at)}</Text>
      </View>
    </View>
  );
}

function StatePanel({
  palette,
  title,
  actionLabel,
  onAction,
}: {
  palette: ReturnType<typeof getPalette>;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = createStyles(palette);

  return (
    <View style={styles.statePanel}>
      {!actionLabel && title.includes("Loading") && <ActivityIndicator color={theme.colors.primary} />}
      <Text style={styles.stateText}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.retryButton}>
          <Text style={styles.retryText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function StatusPill({
  label,
  tone,
  palette,
}: {
  label: string;
  tone: "primary" | "success" | "warning" | "info" | "emergency" | "muted";
  palette: ReturnType<typeof getPalette>;
}) {
  const styles = createStyles(palette);
  return <View style={[styles.statusPill, styles[`${tone}Pill`]]}><Text style={[styles.statusText, styles[`${tone}Text`]]}>{label}</Text></View>;
}

function getRecordTone(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED" || normalized === "APPROVED") {
    return "success";
  }

  if (normalized === "PENDING") {
    return "warning";
  }

  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "muted";
  }

  if (normalized === "EMERGENCY") {
    return "emergency";
  }

  return "primary";
}

function displayEnum(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 22, lineHeight: 26, letterSpacing: -0.44, color: palette.foreground },
  subtitle: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
  refreshButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.border, borderRadius: theme.radii.lg, backgroundColor: palette.surface },
  refreshPressed: { opacity: 0.78 },
  filters: { gap: 8, paddingHorizontal: 20, paddingTop: 4 },
  filter: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: theme.radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  filterSelected: { borderColor: theme.colors.transparent, backgroundColor: palette.foreground },
  filterDefault: { borderColor: palette.border, backgroundColor: palette.surface },
  filterPressed: { opacity: 0.84 },
  filterText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: palette.muted },
  filterTextSelected: { color: palette.background },
  requestList: { gap: 10, marginTop: 16, paddingHorizontal: 20 },
  requestCard: { borderWidth: 1, borderColor: palette.border, borderRadius: theme.radii.xxxl, backgroundColor: palette.surface, padding: 16, ...theme.shadows.shadowCard },
  requestTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  requestIcon: { width: 44, height: 44, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: theme.radii.lg, backgroundColor: theme.colors.emergencyLight },
  bookingIcon: { backgroundColor: theme.colors.primaryContainer },
  requestInfo: { flex: 1, minWidth: 0 },
  kindLabel: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 10.5, lineHeight: 14, letterSpacing: 1.5, textTransform: "uppercase", color: palette.muted },
  requestTitle: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 19, color: palette.foreground },
  hospital: { fontFamily: theme.fonts.regular, fontSize: 12.5, lineHeight: 17, color: palette.muted },
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
  statePanel: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: palette.border, borderRadius: theme.radii.xxl, backgroundColor: palette.surface, marginHorizontal: 20, marginTop: 16, paddingVertical: 46, paddingHorizontal: 20 },
  stateText: { marginTop: 10, textAlign: "center", fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
  retryButton: { marginTop: 14, borderRadius: theme.radii.pill, backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: theme.colors.primaryForeground },
});
