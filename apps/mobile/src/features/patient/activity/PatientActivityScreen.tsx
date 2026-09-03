import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { BedDouble, Download, RefreshCw, Siren, CalendarX, AlertTriangle } from "lucide-react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import {
  getMedicalEvents,
  getPayments,
  getReservations,
  type MedicalEvent,
  type PatientPayment,
  type Reservation,
} from "../../../services/patient-records";

const filters = ["Emergency", "Bookings"] as const;
type ActivityFilter = (typeof filters)[number];

export default function PatientActivityScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ActivityFilter>("Emergency");
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<PatientPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const palette = useMemo(() => getPalette(isDark), [isDark]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const emergencyEvents = useMemo(() => events.filter((event) => event.is_emergency), [events]);

  const handleCompleteEvent = useCallback((eventId: string) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === eventId ? { ...event, event_status: "COMPLETED" } : event,
      ),
    );
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
  }, []);

  const loadActivity = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [eventRecords, reservationRecords, paymentRecords] = await Promise.all([
        getMedicalEvents(),
        getReservations(),
        getPayments(),
      ]);

      setEvents(eventRecords);
      setReservations(reservationRecords);
      setPayments(paymentRecords);
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

  const activeList = tab === "Emergency" ? emergencyEvents : reservations;
  const isEmpty = !loading && !error && activeList.length === 0;

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your emergency SOS requests and hospital reservations</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh activity"
          onPress={() => loadActivity(true)}
          hitSlop={8}
          style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshPressed]}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={palette.foreground} />
          ) : (
            <RefreshCw size={17} color={palette.foreground} strokeWidth={2.2} />
          )}
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
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

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={[
          styles.content,
          isEmpty && styles.contentCentered,
          { paddingBottom: insets.bottom + 128 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadActivity(true)} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.stateText}>Loading activity…</Text>
          </View>
        ) : error ? (
          <EmptyState
            palette={palette}
            icon={<AlertTriangle size={24} color={theme.colors.warning} strokeWidth={2} />}
            iconTone="warning"
            title="Couldn't load activity"
            subtitle={error}
            actionLabel="Try again"
            onAction={() => loadActivity()}
          />
        ) : tab === "Emergency" ? (
          emergencyEvents.length ? (
            <View style={styles.requestList}>
              {emergencyEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  reservation={reservations.find((reservation) => reservation.medical_event_id === event.id)}
                  payment={payments.find((payment) => {
                    const reservation = reservations.find((record) => record.medical_event_id === event.id);
                    return reservation ? payment.reservation_id === reservation.id : false;
                  })}
                  palette={palette}
                  onComplete={handleCompleteEvent}
                  onDelete={handleDeleteEvent}
                  onResume={() =>
                    router.push({
                      pathname: "/sos",
                      params: {
                        resume: "1",
                        eventId: event.id,
                        eventText: event.user_description ?? "",
                        eventSeverity: event.severity ?? "LOW",
                      },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyState
              palette={palette}
              icon={<Siren size={24} color={theme.colors.emergency} strokeWidth={2} />}
              iconTone="emergency"
              title="No emergency activity"
              subtitle="Any SOS requests you send will show up here so you can track their status."
            />
          )
        ) : reservations.length ? (
          <View style={styles.requestList}>
            {reservations.map((reservation) => (
                <ReservationActivityCard
                  key={reservation.id}
                  reservation={reservation}
                  payment={payments.find((record) => record.reservation_id === reservation.id)}
                  palette={palette}
                />
            ))}
          </View>
        ) : (
          <EmptyState
            palette={palette}
            icon={<CalendarX size={24} color={theme.colors.primary} strokeWidth={2} />}
            iconTone="primary"
            title="No reservations yet"
            subtitle="Hospital beds you book will appear here with their status and details."
          />
        )}
      </ScrollView>
    </View>
  );
}

function EventCard({
  event,
  reservation,
  payment,
  palette,
  onResume,
  onComplete,
  onDelete,
}: {
  event: MedicalEvent;
  reservation?: Reservation;
  payment?: PatientPayment;
  palette: ReturnType<typeof getPalette>;
  onResume: () => void;
  onComplete: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}) {
  const styles = createStyles(palette);
  const [isDownloading, setIsDownloading] = useState(false);
  const normalizedStatus = event.event_status?.toUpperCase();
  const canShowPendingActions = normalizedStatus === "PENDING" || normalizedStatus === "IN_PROGRESS" || normalizedStatus === "ACTIVE";
  const canDownloadReceipt = normalizedStatus === "COMPLETED" && reservation && payment?.payment_status.toUpperCase() === "PAID";

  return (
    <Pressable
      onPress={onResume}
      accessibilityRole="button"
      accessibilityLabel={`Resume emergency activity ${event.user_description ?? "medical event"}`}
      style={({ pressed }) => [styles.requestCard, pressed && styles.requestCardPressed]}
    >
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

      {canShowPendingActions ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={(eventPress) => {
              eventPress.stopPropagation?.();
              onComplete(event.id);
            }}
            style={({ pressed }) => [styles.actionButton, styles.completeButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </Pressable>
          <Pressable
            onPress={(eventPress) => {
              eventPress.stopPropagation?.();
              onDelete(event.id);
            }}
            style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : normalizedStatus === "COMPLETED" ? (
        <View style={styles.actionRow}>
          {canDownloadReceipt ? (
            <Pressable
              onPress={(eventPress) => {
                eventPress.stopPropagation?.();
                setIsDownloading(true);
                downloadSosReceipt(event, reservation, payment)
                  .catch((requestError: unknown) => {
                    Alert.alert("Receipt unavailable", requestError instanceof Error ? requestError.message : "Could not prepare the receipt.");
                  })
                  .finally(() => setIsDownloading(false));
              }}
              disabled={isDownloading}
              style={({ pressed }) => [styles.actionButton, styles.receiptButton, pressed && styles.actionButtonPressed, isDownloading && styles.actionButtonDisabled]}
            >
              <Download size={15} color={theme.colors.primary} strokeWidth={2.2} />
              <Text style={styles.receiptButtonText}>{isDownloading ? "Preparing..." : "Download receipt"}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={(eventPress) => {
              eventPress.stopPropagation?.();
              onDelete(event.id);
            }}
            style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function ReservationActivityCard({
  reservation,
  payment,
  palette,
}: {
  reservation: Reservation;
  payment?: PatientPayment;
  palette: ReturnType<typeof getPalette>;
}) {
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
      {payment ? (
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment {displayEnum(payment.payment_status)}</Text>
          <Text style={styles.paymentAmount}>BDT {Number(payment.total_amount).toFixed(2)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({
  palette,
  icon,
  iconTone,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  palette: ReturnType<typeof getPalette>;
  icon: React.ReactNode;
  iconTone: "primary" | "emergency" | "warning";
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const styles = createStyles(palette);

  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconWrap, styles[`${iconTone}IconWrap`]]}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.retryButton, pressed && styles.filterPressed]}>
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
  return (
    <View style={[styles.statusPill, styles[`${tone}Pill`]]}>
      <Text style={[styles.statusText, styles[`${tone}Text`]]}>{label}</Text>
    </View>
  );
}

function getRecordTone(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED" || normalized === "APPROVED") return "success";
  if (normalized === "PENDING") return "warning";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "muted";
  if (normalized === "EMERGENCY") return "emergency";

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

async function downloadSosReceipt(event: MedicalEvent, reservation: Reservation, payment: PatientPayment) {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Receipt storage is unavailable on this device.");
  }

  const amount = Number(payment.total_amount);
  const receipt = [
    "MEDLINK SOS PAYMENT RECEIPT",
    "================================",
    `Receipt ID: ${payment.payment_id}`,
    `SOS event ID: ${event.id}`,
    "",
    `Hospital: ${reservation.hospital_name}`,
    `Service: ${displayEnum(reservation.reservation_mode)} reservation`,
    `Ward: ${reservation.ward_name ?? "Not assigned"}`,
    `Bed: ${reservation.bed_number ?? "Not assigned"}`,
    "",
    `SOS date: ${formatDate(event.created_at)}`,
    `Payment date: ${formatDate(payment.paid_at ?? payment.created_at)}`,
    `Payment method: ${displayEnum(payment.payment_method ?? "Not specified")}`,
    `Payment status: ${displayEnum(payment.payment_status)}`,
    "",
    `Total paid: BDT ${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`,
    "",
    "This receipt was generated from your MedLink activity records.",
  ].join("\n");
  const fileUri = `${FileSystem.cacheDirectory}medlink-sos-receipt-${event.id}.txt`;

  await FileSystem.writeAsStringAsync(fileUri, receipt, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is unavailable on this device.");
  }

  await Sharing.shareAsync(fileUri, {
    dialogTitle: "Save or share SOS receipt",
    mimeType: "text/plain",
    UTI: "public.plain-text",
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

const createStyles = (palette: ReturnType<typeof getPalette>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    title: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 22, lineHeight: 26, letterSpacing: -0.44, color: palette.foreground },
    subtitle: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
    refreshButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.border, borderRadius: theme.radii.lg, backgroundColor: palette.surface },
    refreshPressed: { opacity: 0.78 },

    // Fixed-height row — flexGrow: 0 stops it stretching to fill leftover space
    filtersScroll: { flexGrow: 0, flexShrink: 0 },
    filters: { gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
    filter: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: theme.radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
    filterSelected: { borderColor: theme.colors.transparent, backgroundColor: palette.foreground },
    filterDefault: { borderColor: palette.border, backgroundColor: palette.surface },
    filterPressed: { opacity: 0.84 },
    filterText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: palette.muted },
    filterTextSelected: { color: palette.background },

    // The list area owns the remaining space; content itself is NOT force-grown
    listScroll: { flex: 1 },
    content: { flexGrow: 1, paddingTop: 4 },
    contentCentered: { justifyContent: "center" },

    requestList: { gap: 10, paddingHorizontal: 20 },
    requestCard: { borderWidth: 1, borderColor: palette.border, borderRadius: theme.radii.xxxl, backgroundColor: palette.surface, padding: 16, ...theme.shadows.shadowCard },
    requestCardPressed: { opacity: 0.9 },
    requestTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    requestIcon: { width: 44, height: 44, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: theme.radii.lg, backgroundColor: theme.colors.emergencyLight },
    bookingIcon: { backgroundColor: theme.colors.primaryContainer },
    requestInfo: { flex: 1, minWidth: 0 },
    kindLabel: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 10.5, lineHeight: 14, letterSpacing: 1.5, textTransform: "uppercase", color: palette.muted },
    requestTitle: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 19, color: palette.foreground },
    hospital: { fontFamily: theme.fonts.regular, fontSize: 12.5, lineHeight: 17, color: palette.muted },
    metadataRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 12 },
    actionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
    actionButton: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: theme.radii.lg, paddingVertical: 10, borderWidth: 1 },
    actionButtonPressed: { opacity: 0.85 },
    actionButtonDisabled: { opacity: 0.55 },
    completeButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    deleteButton: { backgroundColor: palette.surface, borderColor: palette.border },
    receiptButton: { flexDirection: "row", gap: 6, backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary },
    completeButtonText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: theme.colors.primaryForeground },
    deleteButtonText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: palette.foreground },
    receiptButtonText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: theme.colors.primary },
    paymentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 12 },
    paymentLabel: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, lineHeight: 16, color: palette.foreground },
    paymentAmount: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 12, lineHeight: 16, color: theme.colors.success },
    statusPill: { alignSelf: "flex-start", borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 10.5, lineHeight: 13, letterSpacing: 0.5 },
    primaryPill: { backgroundColor: theme.colors.primaryContainer }, primaryText: { color: theme.colors.primary },
    successPill: { backgroundColor: theme.colors.successLight }, successText: { color: theme.colors.success },
    warningPill: { backgroundColor: theme.colors.warningLight }, warningText: { color: theme.colors.warning },
    infoPill: { backgroundColor: theme.colors.infoLight }, infoText: { color: theme.colors.info },
    emergencyPill: { backgroundColor: theme.colors.emergencyLight }, emergencyText: { color: theme.colors.emergency },
    mutedPill: { backgroundColor: theme.colors.muted }, mutedText: { color: palette.muted },
    date: { marginLeft: "auto", fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 15, color: palette.muted },

    loadingPanel: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 60 },

    // Compact, self-contained empty-state card — no longer stretches to fill the screen
    emptyState: {
      alignSelf: "center",
      alignItems: "center",
      maxWidth: 300,
      paddingHorizontal: 20,
    },
    emptyIconWrap: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radii.xl,
      marginBottom: 14,
    },
    primaryIconWrap: { backgroundColor: theme.colors.primaryContainer },
    emergencyIconWrap: { backgroundColor: theme.colors.emergencyLight },
    warningIconWrap: { backgroundColor: theme.colors.warningLight },
    emptyTitle: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15.5, lineHeight: 20, color: palette.foreground, textAlign: "center" },
    emptySubtitle: { marginTop: 6, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted, textAlign: "center" },

    stateText: { fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted },
    retryButton: { marginTop: 16, borderRadius: theme.radii.pill, backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 9 },
    retryText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12.5, lineHeight: 16, color: theme.colors.primaryForeground },
  });