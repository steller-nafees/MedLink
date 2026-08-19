import React, { useState } from "react";
import { Linking, Pressable, ScrollView, Share as NativeShare, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BedDouble, ChevronLeft, Clock, Droplet, Heart, Navigation, PhoneCall, Share2, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { hospitals } from "../../sos/utils/data";

export default function HospitalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? { background: theme.colors.backgroundDark, surface: theme.colors.surfaceDark, foreground: theme.colors.primaryForeground, muted: theme.colors.primaryLight, border: theme.colors.borderDark, variant: theme.colors.container } : { background: theme.colors.background, surface: theme.colors.surface, foreground: theme.colors.foreground, muted: theme.colors.mutedForeground, border: theme.colors.border, variant: theme.colors.surfaceVariant };
  const styles = createStyles(colors);
  const hospital = hospitals.find((item) => item.id === id);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!hospital) return <View style={styles.empty}><Text style={styles.muted}>Hospital not found.</Text></View>;

  const shareHospital = async () => {
    await NativeShare.share({
      message: `${hospital.name}\n${hospital.address}\n${hospital.phone}`,
    });
  };
  const openDirections = () => {
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`);
  };

  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 116 }} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <IconButton icon={ChevronLeft} label="Back" onPress={() => router.back()} styles={styles} colors={colors} />
        <View style={styles.topActions}><IconButton icon={Share2} label="Share" onPress={() => void shareHospital()} styles={styles} colors={colors} /><IconButton icon={Heart} label={isFavorite ? "Remove from favorites" : "Add to favorites"} onPress={() => setIsFavorite((value) => !value)} selected={isFavorite} styles={styles} colors={colors} /></View>
      </View>
      <View style={styles.content}>
        <View style={styles.badges}><Text style={styles.traumaBadge}>Level 1 Trauma</Text><Text style={styles.acceptingBadge}>Accepting</Text></View>
        <Text style={styles.name}>{hospital.name}</Text><Text style={styles.address}>{hospital.address}</Text>
        <View style={styles.statGrid}><InfoStat icon={Clock} label="ETA" value={`${hospital.etaMin} min`} styles={styles} colors={colors} /><InfoStat icon={Star} label="Rating" value={hospital.rating.toString()} styles={styles} colors={colors} warning /><InfoStat icon={Navigation} label="Distance" value={`${hospital.distanceKm} km`} styles={styles} colors={colors} onPress={openDirections} /></View>
        <Text style={styles.sectionTitle}>Live availability</Text>
        <View style={styles.statGrid}><Availability label="Beds" value={hospital.beds.available} total={hospital.beds.total} styles={styles} colors={colors} /><Availability label="ICU" value={hospital.icu.available} total={hospital.icu.total} styles={styles} colors={colors} emergency /><Availability label="ER Bays" value={4} total={8} styles={styles} colors={colors} success /></View>
        <Text style={styles.sectionTitle}>Departments</Text><View style={styles.departments}>{hospital.departments.map((department) => <Text key={department} style={styles.department}>{department}</Text>)}</View>
        <Text style={styles.sectionTitle}>Blood bank</Text><View style={styles.bloodCard}><View style={styles.bloodHeading}><Droplet size={14} color={theme.colors.emergency} /><Text style={styles.muted}>Available types</Text></View><View style={styles.departments}>{hospital.bloodBank.map((blood) => <Text key={blood} style={styles.bloodBadge}>{blood}</Text>)}</View></View>
      </View>
    </ScrollView>
    <View style={[styles.cta, { bottom: insets.bottom + 16 }]}><Pressable onPress={() => Linking.openURL(`tel:${hospital.phone}`)} style={styles.callButton}><PhoneCall size={16} color={colors.foreground} /><Text style={styles.callText}>Call</Text></Pressable><Pressable onPress={() => router.push("/(patient)/sos")} style={styles.reserveButton}><BedDouble size={16} color={theme.colors.primaryForeground} /><Text style={styles.reserveText}>Reserve bed</Text></Pressable></View>
  </View>;
}

function IconButton({ icon: Icon, label, onPress, selected, styles, colors }: any) { return <Pressable onPress={onPress} accessibilityLabel={label} accessibilityState={{ selected }} style={styles.iconButton}><Icon size={16} color={selected ? theme.colors.emergency : colors.foreground} fill={selected ? theme.colors.emergency : "none"} /></Pressable>; }
function InfoStat({ icon: Icon, label, value, warning, onPress, styles, colors }: any) { const content = <><Icon size={16} color={warning ? theme.colors.warning : colors.muted} fill={warning ? theme.colors.warning : "none"} /><Text style={styles.infoValue}>{value}</Text><Text style={styles.infoLabel}>{label}</Text></>; return onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Get directions" style={styles.infoStat}>{content}</Pressable> : <View style={styles.infoStat}>{content}</View>; }
function Availability({ label, value, total, emergency, success, styles, colors }: any) { const tone = emergency ? theme.colors.emergency : success ? theme.colors.success : theme.colors.primary; return <View style={styles.availability}><Text style={styles.availabilityValue}>{value}<Text style={styles.total}>/{total}</Text></Text><Text style={styles.infoLabel}>{label}</Text><View style={[styles.track, { backgroundColor: colors.variant }]}><View style={[styles.progress, { width: `${Math.round((value / total) * 100)}%`, backgroundColor: tone }]} /></View></View>; }

const createStyles = (colors: { background: string; surface: string; foreground: string; muted: string; border: string; variant: string }) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }, topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }, topActions: { flexDirection: "row", gap: 8 }, iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.surface, ...theme.shadows.shadowCard }, content: { paddingHorizontal: 20, paddingTop: 16 }, badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, traumaBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontFamily: theme.fonts.bold, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: theme.colors.primary, backgroundColor: theme.colors.primaryContainer }, acceptingBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontFamily: theme.fonts.bold, fontSize: 10.5, color: theme.colors.success, backgroundColor: theme.colors.successLight }, name: { marginTop: 8, fontFamily: theme.fonts.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.48, color: colors.foreground }, address: { marginTop: 4, fontFamily: theme.fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.muted }, statGrid: { flexDirection: "row", gap: 8, marginTop: 16 }, infoStat: { flex: 1, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: colors.surface, ...theme.shadows.shadowCard }, infoValue: { marginTop: 4, fontFamily: theme.fonts.bold, fontSize: 15, color: colors.foreground }, infoLabel: { marginTop: 2, fontFamily: theme.fonts.regular, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: colors.muted }, sectionTitle: { marginTop: 20, marginBottom: 8, fontFamily: theme.fonts.bold, fontSize: 13, color: colors.foreground }, availability: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: colors.surface, ...theme.shadows.shadowCard }, availabilityValue: { fontFamily: theme.fonts.bold, fontSize: 18, color: colors.foreground }, total: { fontFamily: theme.fonts.medium, fontSize: 11, color: colors.muted }, track: { height: 4, marginTop: 8, overflow: "hidden", borderRadius: 999 }, progress: { height: "100%", borderRadius: 999 }, departments: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, department: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, fontFamily: theme.fonts.medium, fontSize: 11.5, color: colors.foreground, backgroundColor: colors.surface }, bloodCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: colors.surface, ...theme.shadows.shadowCard }, bloodHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }, muted: { fontFamily: theme.fonts.regular, fontSize: 12, color: colors.muted }, bloodBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontFamily: theme.fonts.bold, fontSize: 11.5, color: theme.colors.emergency, backgroundColor: theme.colors.emergencyLight }, cta: { position: "absolute", left: 20, right: 20, flexDirection: "row", gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 999, padding: 8, backgroundColor: colors.surface, ...theme.shadows.shadowFloat }, callButton: { flex: 1, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999 }, callText: { fontFamily: theme.fonts.semiBold, fontSize: 13, color: colors.foreground }, reserveButton: { flex: 1, height: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 999, backgroundColor: theme.colors.primary }, reserveText: { fontFamily: theme.fonts.semiBold, fontSize: 13, color: theme.colors.primaryForeground },
});
