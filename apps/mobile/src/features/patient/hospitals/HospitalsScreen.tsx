import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Ellipse, Line, Path, Rect } from "react-native-svg";
import { MapPin, Search, SlidersHorizontal, Stethoscope } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { EmptyState, ErrorState, LoadingState } from "../../../components/ui/FeedbackStates";
import { getHospitals, type Hospital } from "../../../services/hospitals";

const chips = ["All", "Open", "Closed"];

export default function HospitalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = getPalette(isDark);
  const styles = createStyles(palette);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setHospitals(await getHospitals());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load hospitals right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const visibleHospitals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      const matchesChip = active === "All" || hospital.hospital_status === active.toUpperCase();
      const matchesQuery = !normalizedQuery || [hospital.hospital_name, hospital.address, hospital.description]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesChip && matchesQuery;
    });
  }, [active, query]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 132 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hospitals</Text>
          <Text style={styles.subtitle}>Live availability near you</Text>
        </View>

        <View style={styles.horizontal}>
          <View style={styles.searchRow}>
            <View style={styles.searchWrap}>
              <Search style={styles.searchIcon} size={16} color={palette.muted} strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search hospitals or specialty"
                placeholderTextColor={palette.muted}
                style={styles.searchInput}
                accessibilityLabel="Search hospitals or specialty"
              />
            </View>
            <Pressable style={styles.filterButton} accessibilityRole="button" accessibilityLabel="Filter hospitals">
              <SlidersHorizontal size={16} color={theme.colors.primaryForeground} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {chips.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => setActive(chip)}
                style={[styles.chip, active === chip && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active === chip }}
              >
                <Text style={[styles.chipText, active === chip && styles.chipTextActive]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {!isLoading && !error && hospitals.length > 0 ? <View style={styles.mapMargin}><HospitalMap hospitals={hospitals} palette={palette} /></View> : null}

        <View style={styles.list}>
          {!isLoading && !error ? <Text style={styles.resultText}>{visibleHospitals.length} hospitals · sorted by name</Text> : null}
          {isLoading ? <LoadingState message="Loading hospitals..." /> : null}
          {!isLoading && error ? <ErrorState title="Couldn’t load hospitals" message={error} onRetry={() => void loadHospitals()} /> : null}
          {!isLoading && !error && visibleHospitals.length === 0 ? <EmptyState title="No hospitals found" description="Try a different search or status filter." /> : null}
          {!isLoading && !error && visibleHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} palette={palette} styles={styles} onPress={() => router.push({ pathname: "/(patient)/hospitals/[id]", params: { id: hospital.id } })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function HospitalCard({ hospital, onPress, palette, styles }: { hospital: Hospital; onPress: () => void; palette: ReturnType<typeof getPalette>; styles: ReturnType<typeof createStyles> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`View ${hospital.hospital_name}`}>
      <View style={styles.cardTop}>
        <View style={styles.hospitalIcon}><Stethoscope size={20} color={theme.colors.primaryForeground} strokeWidth={2} /></View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.hospitalName}>{hospital.hospital_name}</Text>
            <View style={[styles.etaBadge, hospital.hospital_status !== "OPEN" && styles.closedBadge]}><Text style={[styles.etaText, hospital.hospital_status !== "OPEN" && styles.closedBadgeText]}>{hospital.hospital_status}</Text></View>
          </View>
          <View style={styles.addressRow}><MapPin size={12} color={palette.muted} /><Text style={styles.address} numberOfLines={1}>{hospital.address ?? "Address not available"}</Text></View>
          {hospital.description ? <Text style={styles.description} numberOfLines={2}>{hospital.description}</Text> : null}
        </View>
      </View>
      <View style={styles.statsRow}>
        <MiniStat styles={styles} label="Phone" value={hospital.phone ? "Available" : "—"} />
        <MiniStat styles={styles} label="Website" value={hospital.website ? "Available" : "—"} />
        <MiniStat styles={styles} label="Status" value={hospital.hospital_status} tone={hospital.hospital_status === "OPEN" ? "success" : "emergency"} />
      </View>
    </Pressable>
  );
}

function MiniStat({ label, value, total, tone, styles }: { label: string; value: number | string; total?: number; tone?: "emergency" | "success"; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.miniStat}><Text style={[styles.statValue, tone === "emergency" && styles.statEmergency, tone === "success" && styles.statSuccess]}>{value}{total ? <Text style={styles.statTotal}>/{total}</Text> : null}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function HospitalMap({ hospitals: list, palette }: { hospitals: Hospital[]; palette: ReturnType<typeof getPalette> }) {
  return <View style={[mapStyles.container, { backgroundColor: palette.variant, borderColor: palette.border }]}>
    <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Rect width="100" height="100" fill={palette.variant} />
      {Array.from({ length: 13 }, (_, index) => <Line key={`v${index}`} x1={index * 8} y1="0" x2={index * 8} y2="100" stroke={palette.border} strokeWidth="0.2" />)}
      {Array.from({ length: 13 }, (_, index) => <Line key={`h${index}`} x1="0" y1={index * 8} x2="100" y2={index * 8} stroke={palette.border} strokeWidth="0.2" />)}
      <Path d="M -5 62 Q 30 55 55 68 T 110 60" stroke={theme.colors.infoLight} strokeWidth="4" fill="none" />
      <Path d="M -5 62 Q 30 55 55 68 T 110 60" stroke={theme.colors.info} strokeWidth="1.2" fill="none" opacity={0.55} />
      <Ellipse cx="18" cy="24" rx="14" ry="10" fill={theme.colors.successLight} /><Ellipse cx="82" cy="82" rx="16" ry="8" fill={theme.colors.successLight} />
      {[['-5', '45', '105', '42', '2.6'], ['20', '-5', '25', '105', '2.4'], ['62', '-5', '70', '105', '2.4']].map(([x1, y1, x2, y2, width], index) => <Line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.colors.surface} strokeWidth={width} />)}
    </Svg>
    {list.map((hospital, index) => { const point = getMapPoint(hospital, list, index); return <View key={hospital.id} style={[mapStyles.marker, { left: `${point.x}%`, top: `${point.y}%` }]}><View style={[mapStyles.markerLabel, { backgroundColor: palette.surface }]}><Text style={[mapStyles.markerText, { color: palette.foreground }]}>{hospital.hospital_name.split(" ")[0]}</Text></View><View style={mapStyles.pin}><Text style={mapStyles.pinText}>+</Text></View></View>; })}
    <View style={[mapStyles.patient, { left: "50%", top: "55%", borderColor: palette.surface }]}><View style={mapStyles.patientCore} /></View>
  </View>;
}

function getMapPoint(hospital: Hospital, list: Hospital[], index: number) {
  const withCoordinates = list.filter((item) => item.latitude !== null && item.longitude !== null);
  if (hospital.latitude === null || hospital.longitude === null || withCoordinates.length < 2) return { x: 15 + ((index * 23) % 70), y: 20 + ((index * 31) % 60) };
  const latitudes = withCoordinates.map((item) => item.latitude as number);
  const longitudes = withCoordinates.map((item) => item.longitude as number);
  const latitudeRange = Math.max(...latitudes) - Math.min(...latitudes) || 1;
  const longitudeRange = Math.max(...longitudes) - Math.min(...longitudes) || 1;
  return { x: 12 + (((hospital.longitude - Math.min(...longitudes)) / longitudeRange) * 76), y: 12 + ((1 - ((hospital.latitude - Math.min(...latitudes)) / latitudeRange)) * 70) };
}

function getPalette(isDark: boolean) {
  return isDark ? { background: theme.colors.backgroundDark, surface: theme.colors.surfaceDark, variant: theme.colors.container, foreground: theme.colors.primaryForeground, muted: theme.colors.primaryLight, border: theme.colors.borderDark } : { background: theme.colors.background, surface: theme.colors.surface, variant: theme.colors.surfaceVariant, foreground: theme.colors.foreground, muted: theme.colors.mutedForeground, border: theme.colors.border };
}

const createStyles = (palette: ReturnType<typeof getPalette>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background }, content: { paddingBottom: 132 }, horizontal: { paddingHorizontal: 20 }, header: { paddingHorizontal: 20, paddingBottom: 16 }, title: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 22, lineHeight: 26, letterSpacing: -0.44, color: palette.foreground }, subtitle: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted }, searchRow: { flexDirection: "row", alignItems: "center", gap: 8 }, searchWrap: { position: "relative", flex: 1, height: 44, justifyContent: "center", borderWidth: 1, borderColor: palette.border, borderRadius: 999, backgroundColor: palette.surface }, searchIcon: { position: "absolute", left: 12, zIndex: 1 }, searchInput: { height: 44, paddingLeft: 36, paddingRight: 16, fontFamily: theme.fonts.regular, fontSize: 13, color: palette.foreground }, filterButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: theme.colors.primary, ...theme.shadows.shadowFloat }, chips: { gap: 8, paddingTop: 12 }, chip: { borderWidth: 1, borderColor: palette.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: palette.surface }, chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }, chipText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, color: palette.foreground }, chipTextActive: { color: theme.colors.primaryForeground }, mapMargin: { marginTop: 16, marginHorizontal: 20 }, list: { marginTop: 16, gap: 12, paddingHorizontal: 20 }, resultText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, color: palette.muted }, card: { overflow: "hidden", borderWidth: 1, borderColor: palette.border, borderRadius: 24, backgroundColor: palette.surface, ...theme.shadows.shadowCard }, pressed: { opacity: 0.92 }, cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 }, hospitalIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: theme.colors.primary }, cardInfo: { flex: 1, minWidth: 0 }, nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, hospitalName: { flex: 1, fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 18, color: palette.foreground }, etaBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: theme.colors.primaryContainer }, etaText: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 10.5, lineHeight: 12, color: theme.colors.primary }, closedBadge: { backgroundColor: theme.colors.emergencyLight }, closedBadgeText: { color: theme.colors.emergency }, addressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }, address: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 16, color: palette.muted }, description: { marginTop: 6, fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 16, color: palette.muted }, statsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.variant }, miniStat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10 }, statValue: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 12, lineHeight: 18, color: palette.foreground }, statTotal: { fontFamily: theme.fonts.medium, fontWeight: "500", fontSize: 10, color: palette.muted }, statEmergency: { color: theme.colors.emergency }, statSuccess: { color: theme.colors.success }, statLabel: { fontFamily: theme.fonts.regular, fontSize: 10, lineHeight: 12, letterSpacing: 1, textTransform: "uppercase", color: palette.muted },
});

const mapStyles = StyleSheet.create({ container: { height: 160, overflow: "hidden", borderWidth: 1, borderRadius: 16 }, marker: { position: "absolute", alignItems: "center", transform: [{ translateX: -22 }, { translateY: -35 }] }, markerLabel: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, ...theme.shadows.shadowCard }, markerText: { fontFamily: theme.fonts.semiBold, fontSize: 8, lineHeight: 10 }, pin: { width: 28, height: 28, marginTop: 4, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: theme.colors.primary, ...theme.shadows.shadowFloat }, pinText: { fontFamily: theme.fonts.bold, fontSize: 16, lineHeight: 18, color: theme.colors.primaryForeground }, patient: { position: "absolute", width: 24, height: 24, marginLeft: -12, marginTop: -12, alignItems: "center", justifyContent: "center", borderWidth: 4, borderRadius: 12, backgroundColor: theme.colors.emergency, ...theme.shadows.shadowFloat }, patientCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primaryForeground } });
