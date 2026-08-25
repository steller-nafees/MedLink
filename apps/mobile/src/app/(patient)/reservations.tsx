import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BedDouble, RefreshCw } from "lucide-react-native";

import { getReservations, type Reservation } from "@/services/patient-records";

const COLORS = {
  bg: "#F4F8FA",
  card: "#FFFFFF",
  ink: "#12324A",
  muted: "#6D7F8B",
  border: "#DDE8EE",
  accent: "#168AAD",
  danger: "#B42318",
};

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const records = await getReservations();
      setReservations(records);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load reservations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [loadReservations]),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Hospital booking</Text>
          <Text style={styles.title}>Reservations</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh reservations"
          onPress={() => loadReservations(true)}
          style={styles.iconButton}
        >
          <RefreshCw size={18} color={COLORS.accent} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.stateText}>Loading reservations...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => loadReservations()} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => loadReservations(true)}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>No reservations yet</Text>
              <Text style={styles.stateText}>Hospital reservations connected to your account will appear here.</Text>
            </View>
          }
          renderItem={({ item }) => <ReservationCard reservation={item} />}
        />
      )}
    </View>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <BedDouble size={20} color={COLORS.accent} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{reservation.hospital_name}</Text>
          <Text style={styles.cardSubtitle}>{formatDate(reservation.requested_at ?? reservation.created_at)}</Text>
        </View>
        <StatusBadge status={reservation.reservation_status} />
      </View>

      <View style={styles.detailsGrid}>
        <Detail label="Ward" value={reservation.ward_name ?? "Not assigned"} />
        <Detail label="Bed" value={reservation.bed_number ?? "Not assigned"} />
        <Detail label="Mode" value={displayEnum(reservation.reservation_mode)} />
        <Detail label="Approved" value={reservation.approved_at ? formatDate(reservation.approved_at) : "Pending"} />
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const color = normalized === "CANCELLED" ? COLORS.danger : normalized === "APPROVED" ? "#047857" : COLORS.accent;

  return (
    <View style={[styles.statusBadge, { borderColor: color }]}>
      <Text style={[styles.statusText, { color }]}>{displayEnum(status)}</Text>
    </View>
  );
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  list: {
    gap: 12,
    paddingBottom: 128,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: "#E8F6FA",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  detail: {
    backgroundColor: "#F7FAFC",
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    padding: 10,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailValue: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  centerState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  stateText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
