import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AlertCircle, ChevronRight, MapPin, Phone, RefreshCw, Search, X } from 'lucide-react-native';
import { BloodDrop, EligibilityPill } from '../../features/sos/components';
import { bloodGroups, getBloodDonors, type BloodDonor, type BloodGroup } from '../../services/blood';
import { eligibilityFrom, formatDate } from '../../features/sos/utils/blood';
import { theme } from '../../theme';

const PAGE_SIZE = 20;
const donorName = (donor: BloodDonor) => [donor.first_name, donor.last_name].filter(Boolean).join(' ') || 'MedLink donor';

function DonorRow({ donor, onPress }: { donor: BloodDonor; onPress: () => void }) {
  const eligibility = eligibilityFrom(donor.last_donation_date);
  return <Pressable onPress={onPress} style={styles.donorCard} accessibilityRole="button">
    <BloodDrop group={donor.blood_group} tone="muted" />
    <View style={styles.donorContent}>
      <View style={styles.rowBetween}><Text style={styles.donorName} numberOfLines={1}>{donorName(donor)}</Text><ChevronRight size={18} color={theme.colors.mutedForeground} /></View>
      <View style={styles.pills}><EligibilityPill eligible={eligibility.eligible} daysLeft={eligibility.daysLeft} /></View>
      <View style={styles.metaRow}><MapPin size={13} color={theme.colors.mutedForeground} /><Text style={styles.meta}>{donor.distance_km == null ? 'Distance unavailable' : `${Number(donor.distance_km).toFixed(1)} km away`}</Text></View>
    </View>
  </Pressable>;
}

export default function BloodScreen() {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | undefined>();
  const [radiusText, setRadiusText] = useState('');
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null);

  const load = useCallback(async (nextOffset = 0, append = false) => {
    const radius = radiusText.trim() ? Number(radiusText) : undefined;
    if (radius !== undefined && (!Number.isFinite(radius) || radius <= 0 || radius > 100)) {
      setError('Enter a search radius between 0 and 100 km.');
      return;
    }
    setError('');
    setLoading(true);
    if (!append) setRefreshing(nextOffset === 0 && donors.length > 0);
    try {
      const result = await getBloodDonors({ bloodGroup: selectedGroup, radius, limit: PAGE_SIZE, offset: nextOffset });
      setDonors((current) => append ? [...current, ...result.donors] : result.donors);
      setTotal(result.pagination.total);
      setOffset(nextOffset);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load blood donors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [donors.length, radiusText, selectedGroup]);

  useEffect(() => { void load(); }, [load]);
  const hasMore = donors.length < total;

  return <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} tintColor={theme.colors.primary} />}>
      <View style={styles.headerRow}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>BLOOD SUPPORT</Text><Text style={styles.title}>Find a donor</Text><Text style={styles.subtitle}>Browse eligible donors who are currently available to help.</Text></View><View style={styles.headerIcon}><Search size={22} color={theme.colors.emergency} /></View></View>
      <Text style={styles.sectionLabel}>Blood group</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupList}>
        <Pressable onPress={() => setSelectedGroup(undefined)} style={[styles.groupChip, !selectedGroup && styles.groupChipActive]}><Text style={[styles.groupText, !selectedGroup && styles.groupTextActive]}>All</Text></Pressable>
        {bloodGroups.map((group) => <Pressable key={group} onPress={() => setSelectedGroup(group)} style={[styles.groupChip, selectedGroup === group && styles.groupChipActive]}><Text style={[styles.groupText, selectedGroup === group && styles.groupTextActive]}>{group}</Text></Pressable>)}
      </ScrollView>
      <View style={styles.searchRow}><View style={styles.radiusInput}><MapPin size={16} color={theme.colors.mutedForeground} /><TextInput value={radiusText} onChangeText={setRadiusText} keyboardType="decimal-pad" placeholder="Radius in km" placeholderTextColor={theme.colors.mutedForeground} style={styles.input} /></View><Pressable onPress={() => void load(0)} style={styles.searchButton}><Search size={17} color={theme.colors.white} /><Text style={styles.searchButtonText}>Search</Text></Pressable></View>
      {error ? <View style={styles.errorBox}><AlertCircle size={18} color={theme.colors.error} /><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void load(offset)}><RefreshCw size={17} color={theme.colors.error} /></Pressable></View> : null}
      <View style={styles.resultsHeader}><Text style={styles.sectionLabel}>Available donors</Text>{!loading && <Text style={styles.count}>{total} found</Text>}</View>
      {loading && donors.length === 0 ? <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} /> : donors.length === 0 ? <View style={styles.empty}><BloodDrop group="?" tone="muted" /><Text style={styles.emptyTitle}>No donors found</Text><Text style={styles.meta}>Try a different blood group or remove the radius filter.</Text></View> : donors.map((donor) => <DonorRow key={donor.donor_id} donor={donor} onPress={() => setSelectedDonor(donor)} />)}
      {hasMore ? <Pressable onPress={() => void load(offset + PAGE_SIZE, true)} style={styles.loadMore}><Text style={styles.loadMoreText}>Load more donors</Text></Pressable> : null}
    </ScrollView>
    <Modal visible={!!selectedDonor} transparent animationType="slide" onRequestClose={() => setSelectedDonor(null)}>{selectedDonor && <View style={styles.modalBackdrop}><View style={styles.modalCard}><Pressable onPress={() => setSelectedDonor(null)} style={styles.close}><X size={20} color={theme.colors.foreground} /></Pressable><BloodDrop group={selectedDonor.blood_group} /><Text style={styles.modalTitle}>{donorName(selectedDonor)}</Text><Text style={styles.modalSubtitle}>Eligible {selectedDonor.blood_group} donor</Text><View style={styles.detailList}><Detail label="Last donation" value={formatDate(selectedDonor.last_donation_date)} /><Detail label="Next available" value={formatDate(selectedDonor.next_available_date)} /><Detail label="Location" value={selectedDonor.address || 'Location not shared'} /></View>{selectedDonor.phone ? <Pressable onPress={() => void Linking.openURL(`tel:${selectedDonor.phone}`)} style={styles.callButton}><Phone size={17} color={theme.colors.white} /><Text style={styles.callText}>Call donor</Text></Pressable> : <Text style={styles.meta}>This donor has not shared a phone number.</Text>}</View></View>}</Modal>
  </View>;
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.meta}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background }, content: { padding: 20, paddingBottom: 40, gap: 14 }, headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, headerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.emergencyLight }, eyebrow: { color: theme.colors.emergency, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, title: { color: theme.colors.foreground, fontSize: 28, fontWeight: '800', marginTop: 3 }, subtitle: { color: theme.colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 4 }, sectionLabel: { color: theme.colors.foreground, fontSize: 14, fontWeight: '800' }, groupList: { gap: 8, paddingVertical: 2 }, groupChip: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: theme.colors.surface }, groupChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, groupText: { color: theme.colors.foreground, fontSize: 13, fontWeight: '700' }, groupTextActive: { color: theme.colors.white }, searchRow: { flexDirection: 'row', gap: 8 }, radiusInput: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, backgroundColor: theme.colors.surface, paddingHorizontal: 12 }, input: { flex: 1, color: theme.colors.foreground, fontSize: 13, paddingVertical: 11 }, searchButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, backgroundColor: theme.colors.primary, paddingHorizontal: 15 }, searchButtonText: { color: theme.colors.white, fontSize: 13, fontWeight: '800' }, resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }, count: { color: theme.colors.mutedForeground, fontSize: 12 }, donorCard: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.shadowCard }, donorContent: { flex: 1, gap: 7 }, rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, donorName: { flex: 1, color: theme.colors.foreground, fontSize: 15, fontWeight: '800' }, pills: { alignSelf: 'flex-start' }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, meta: { color: theme.colors.mutedForeground, fontSize: 12, lineHeight: 18 }, loader: { marginVertical: 40 }, empty: { alignItems: 'center', gap: 8, paddingVertical: 42 }, emptyTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: '800' }, errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: theme.colors.errorLight }, errorText: { flex: 1, color: theme.colors.error, fontSize: 12, lineHeight: 17 }, loadMore: { alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 999, paddingVertical: 12, marginTop: 2 }, loadMoreText: { color: theme.colors.primaryDark, fontSize: 13, fontWeight: '800' }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,37,47,0.48)' }, modalCard: { gap: 10, padding: 24, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: theme.colors.surface }, close: { position: 'absolute', top: 16, right: 16, padding: 5 }, modalTitle: { color: theme.colors.foreground, fontSize: 22, fontWeight: '800', marginTop: 6 }, modalSubtitle: { color: theme.colors.mutedForeground, fontSize: 13 }, detailList: { gap: 10, marginTop: 8, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 18 }, detailValue: { flex: 1, textAlign: 'right', color: theme.colors.foreground, fontSize: 13, fontWeight: '700' }, callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: theme.colors.emergency, paddingVertical: 14, marginTop: 4 }, callText: { color: theme.colors.white, fontSize: 14, fontWeight: '800' },
});