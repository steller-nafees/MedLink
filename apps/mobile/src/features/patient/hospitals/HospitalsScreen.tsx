import React, { useMemo, useState } from "react";
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
import { MapPin, Search, SlidersHorizontal, Star, Stethoscope } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { hospitals, type Hospital } from "../../sos/utils/data";

const chips = ["All", "Emergency", "Cardiology", "Trauma", "Pediatrics", "ICU"];

export default function HospitalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = getPalette(isDark);
  const styles = createStyles(palette);
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const visibleHospitals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      const matchesChip = active === "All" || hospital.departments.includes(active);
      const matchesQuery = !normalizedQuery || [hospital.name, hospital.address, ...hospital.departments]
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

        <View style={styles.mapMargin}><HospitalMap hospitals={hospitals} palette={palette} /></View>

        <View style={styles.list}>
          <Text style={styles.resultText}>{visibleHospitals.length} hospitals · sorted by distance</Text>
          {visibleHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} palette={palette} styles={styles} onPress={() => router.push({ pathname: "/(patient)/hospitals/[id]", params: { id: hospital.id } })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function HospitalCard({ hospital, onPress, palette, styles }: { hospital: Hospital; onPress: () => void; palette: ReturnType<typeof getPalette>; styles: ReturnType<typeof createStyles> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`View ${hospital.name}`}>
      <View style={styles.cardTop}>
        <View style={styles.hospitalIcon}><Stethoscope size={20} color={theme.colors.primaryForeground} strokeWidth={2} /></View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.hospitalName}>{hospital.name}</Text>
            <View style={styles.etaBadge}><Text style={styles.etaText}>{hospital.etaMin}m</Text></View>
          </View>
          <View style={styles.addressRow}><MapPin size={12} color={palette.muted} /><Text style={styles.address} numberOfLines={1}>{hospital.address}</Text></View>
          <View style={styles.ratingRow}>
            <View style={styles.starRow}><Star size={12} color={theme.colors.warning} fill={theme.colors.warning} /><Text style={styles.rating}>{hospital.rating}</Text></View>
            <Text style={styles.dot}>·</Text><Text style={styles.distance}>{hospital.distanceKm.toFixed(1)} km</Text>
          </View>
        </View>
      </View>
      <View style={styles.statsRow}>
        <MiniStat styles={styles} label="Beds" value={hospital.beds.available} total={hospital.beds.total} />
        <MiniStat styles={styles} label="ICU" value={hospital.icu.available} total={hospital.icu.total} tone="emergency" />
        <MiniStat styles={styles} label="ER" value={hospital.emergency ? "Open" : "—"} tone="success" />
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
    {list.map((hospital) => <View key={hospital.id} style={[mapStyles.marker, { left: `${hospital.coord.x}%`, top: `${hospital.coord.y}%` }]}><View style={[mapStyles.markerLabel, { backgroundColor: palette.surface }]}><Text style={[mapStyles.markerText, { color: palette.foreground }]}>{hospital.name.split(" ")[0]}</Text></View><View style={mapStyles.pin}><Text style={mapStyles.pinText}>+</Text></View></View>)}
    <View style={[mapStyles.patient, { left: "50%", top: "55%", borderColor: palette.surface }]}><View style={mapStyles.patientCore} /></View>
  </View>;
}

function getPalette(isDark: boolean) {
  return isDark ? { background: theme.colors.backgroundDark, surface: theme.colors.surfaceDark, variant: theme.colors.container, foreground: theme.colors.primaryForeground, muted: theme.colors.primaryLight, border: theme.colors.borderDark } : { background: theme.colors.background, surface: theme.colors.surface, variant: theme.colors.surfaceVariant, foreground: theme.colors.foreground, muted: theme.colors.mutedForeground, border: theme.colors.border };
}

const createStyles = (palette: ReturnType<typeof getPalette>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background }, content: { paddingBottom: 132 }, horizontal: { paddingHorizontal: 20 }, header: { paddingHorizontal: 20, paddingBottom: 16 }, title: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 22, lineHeight: 26, letterSpacing: -0.44, color: palette.foreground }, subtitle: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: palette.muted }, searchRow: { flexDirection: "row", alignItems: "center", gap: 8 }, searchWrap: { position: "relative", flex: 1, height: 44, justifyContent: "center", borderWidth: 1, borderColor: palette.border, borderRadius: 999, backgroundColor: palette.surface }, searchIcon: { position: "absolute", left: 12, zIndex: 1 }, searchInput: { height: 44, paddingLeft: 36, paddingRight: 16, fontFamily: theme.fonts.regular, fontSize: 13, color: palette.foreground }, filterButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: theme.colors.primary, ...theme.shadows.shadowFloat }, chips: { gap: 8, paddingTop: 12 }, chip: { borderWidth: 1, borderColor: palette.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: palette.surface }, chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }, chipText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, color: palette.foreground }, chipTextActive: { color: theme.colors.primaryForeground }, mapMargin: { marginTop: 16, marginHorizontal: 20 }, list: { marginTop: 16, gap: 12, paddingHorizontal: 20 }, resultText: { fontFamily: theme.fonts.semiBold, fontWeight: "600", fontSize: 12, color: palette.muted }, card: { overflow: "hidden", borderWidth: 1, borderColor: palette.border, borderRadius: 24, backgroundColor: palette.surface, ...theme.shadows.shadowCard }, pressed: { opacity: 0.92 }, cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16 }, hospitalIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: theme.colors.primary }, cardInfo: { flex: 1, minWidth: 0 }, nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, hospitalName: { flex: 1, fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 15, lineHeight: 18, color: palette.foreground }, etaBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: theme.colors.primaryContainer }, etaText: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 10.5, lineHeight: 12, color: theme.colors.primary }, addressRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }, address: { flex: 1, fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 16, color: palette.muted }, ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }, starRow: { flexDirection: "row", alignItems: "center", gap: 4 }, rating: { fontFamily: theme.fonts.regular, fontSize: 11.5, color: theme.colors.warning }, dot: { fontFamily: theme.fonts.regular, fontSize: 11.5, color: palette.muted }, distance: { fontFamily: theme.fonts.regular, fontSize: 11.5, color: palette.muted }, statsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.variant }, miniStat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10 }, statValue: { fontFamily: theme.fonts.bold, fontWeight: "700", fontSize: 14, lineHeight: 18, color: palette.foreground }, statTotal: { fontFamily: theme.fonts.medium, fontWeight: "500", fontSize: 10, color: palette.muted }, statEmergency: { color: theme.colors.emergency }, statSuccess: { color: theme.colors.success }, statLabel: { fontFamily: theme.fonts.regular, fontSize: 10, lineHeight: 12, letterSpacing: 1, textTransform: "uppercase", color: palette.muted },
});

const mapStyles = StyleSheet.create({ container: { height: 160, overflow: "hidden", borderWidth: 1, borderRadius: 16 }, marker: { position: "absolute", alignItems: "center", transform: [{ translateX: -22 }, { translateY: -35 }] }, markerLabel: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, ...theme.shadows.shadowCard }, markerText: { fontFamily: theme.fonts.semiBold, fontSize: 8, lineHeight: 10 }, pin: { width: 28, height: 28, marginTop: 4, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: theme.colors.primary, ...theme.shadows.shadowFloat }, pinText: { fontFamily: theme.fonts.bold, fontSize: 16, lineHeight: 18, color: theme.colors.primaryForeground }, patient: { position: "absolute", width: 24, height: 24, marginLeft: -12, marginTop: -12, alignItems: "center", justifyContent: "center", borderWidth: 4, borderRadius: 12, backgroundColor: theme.colors.emergency, ...theme.shadows.shadowFloat }, patientCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primaryForeground } });
