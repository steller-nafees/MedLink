import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, Pencil, Phone, Pill, Plus, ShieldAlert, Trash2, X } from "lucide-react-native";
import { theme } from "../../../theme";
import { eligibilityFrom, formatDate } from "../../../lib/blood";
import { getMyProfile } from "../../../services/profile";
import type { ProfileContact } from "./profileMockData";

type MedicalKind = "allergies" | "conditions" | "medications";
type Personal = {
  fullName: string;
  dob: string;
  gender: string;
  blood: string;
  address: string;
};

const emptyPersonal: Personal = {
  fullName: "Not provided",
  dob: "Not provided",
  gender: "Not provided",
  blood: "Not provided",
  address: "Not provided",
};

export default function PatientProfileScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const palette = getPalette(isDark);
  const styles = createStyles(palette);
  const [personal, setPersonal] = useState<Personal>(emptyPersonal);
  const [email, setEmail] = useState<string>("Not provided");
  const [phone, setPhone] = useState<string>("Not provided");
  const [initials, setInitials] = useState<string>("?");
  const [lastDonation, setLastDonation] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [contacts, setContacts] = useState<ProfileContact[]>([]);
  const [editingContact, setEditingContact] = useState<ProfileContact | null>(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [draft, setDraft] = useState<Personal>(emptyPersonal);
  const [adding, setAdding] = useState<MedicalKind | null>(null);
  const [item, setItem] = useState("");
  const [donorAvailable, setDonorAvailable] = useState<boolean>(false);
  const donationEligibility = eligibilityFrom(lastDonation);

  useEffect(() => {
    let isMounted = true;

    void getMyProfile()
      .then((profile) => {
        if (!isMounted) return;

        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Not provided";
        setPersonal({
          fullName,
          dob: formatProfileDate(profile.date_of_birth),
          gender: formatGender(profile.gender),
          blood: profile.blood_group ?? "Not provided",
          address: profile.address ?? "Not provided",
        });
        setEmail(profile.email ?? "Not provided");
        setPhone(profile.phone ?? "Not provided");
        setInitials(getInitials(fullName));
        setLastDonation(profile.last_donation_date);
        setDonorAvailable(profile.is_available_for_donation ?? false);
        setContacts(
          profile.emergency_contact_name || profile.emergency_contact_phone
            ? [{ id: "primary", name: profile.emergency_contact_name ?? "Emergency contact", relation: "Emergency contact", phone: profile.emergency_contact_phone ?? "Not provided" }]
            : [],
        );
      })
      .catch((error) => {
        if (isMounted) setProfileError(error instanceof Error ? error.message : "Unable to load your profile.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const savePersonal = () => { setPersonal(draft); setEditingPersonal(false); };
  const updateList = (kind: MedicalKind, next: string[]) => {
    if (kind === "allergies") setAllergies(next);
    if (kind === "conditions") setConditions(next);
    if (kind === "medications") setMedications(next);
  };
  const addItem = () => {
    if (!adding || !item.trim()) return;
    const current = adding === "allergies" ? allergies : adding === "conditions" ? conditions : medications;
    updateList(adding, [...current, item.trim()]);
    setItem(""); setAdding(null);
  };
  const removeContact = (id: string) => setContacts((list) => list.filter((contact) => contact.id !== id));
  const saveContact = () => {
    if (!editingContact) return;
    setContacts((list) => list.some((contact) => contact.id === editingContact.id) ? list.map((contact) => contact.id === editingContact.id ? editingContact : contact) : [...list, editingContact]);
    setEditingContact(null);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 128 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><Text style={styles.title}>Profile</Text><Text style={styles.subtitle}>Your personal health information, all in one place</Text></View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.identity}><Text style={styles.name}>{personal.fullName}</Text><Text style={styles.identityDetail}>{email}</Text><Text style={styles.identityDetail}>{phone}</Text></View>
          <Pressable onPress={() => setEditingPersonal(true)} style={styles.editProfile}><Pencil size={14} color={palette.primaryForeground} /><Text style={styles.editProfileText}>Edit profile</Text></Pressable>
        </View>

        <SectionTitle title="Personal information" palette={palette} />
        {profileError ? <Text style={styles.profileError}>{profileError}</Text> : null}
        <View style={styles.card}>
          <View style={styles.personalAction}>{editingPersonal ? <><Pressable onPress={() => { setDraft(personal); setEditingPersonal(false); }} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={savePersonal} style={styles.save}><Text style={styles.saveText}>Save</Text></Pressable></> : <Pressable onPress={() => { setDraft(personal); setEditingPersonal(true); }} style={styles.editSmall}><Pencil size={12} color={palette.primary} /><Text style={styles.editSmallText}>Edit profile</Text></Pressable>}</View>
          {(Object.entries(personal) as [keyof Personal, string][]).map(([key, value]) => <View key={key} style={styles.infoRow}><Text style={styles.infoLabel}>{labels[key]}</Text>{editingPersonal ? <TextInput value={draft[key]} onChangeText={(text) => setDraft((current) => ({ ...current, [key]: text }))} style={styles.infoInput} placeholderTextColor={palette.muted} /> : <Text style={styles.infoValue}>{value}</Text>}</View>)}
        </View>

        <SectionTitle title="Medical information" palette={palette} />
        <MedicalCard kind="allergies" title="Allergies" items={allergies} Icon={ShieldAlert} tone="emergency" palette={palette} styles={styles} adding={adding} item={item} setAdding={setAdding} setItem={setItem} onAdd={addItem} onRemove={(value: string) => updateList("allergies", allergies.filter((entry) => entry !== value))} />
        <MedicalCard kind="conditions" title="Conditions" items={conditions} Icon={Heart} tone="warning" palette={palette} styles={styles} adding={adding} item={item} setAdding={setAdding} setItem={setItem} onAdd={addItem} onRemove={(value: string) => updateList("conditions", conditions.filter((entry) => entry !== value))} />
        <MedicalCard kind="medications" title="Medications" items={medications} Icon={Pill} tone="info" palette={palette} styles={styles} adding={adding} item={item} setAdding={setAdding} setItem={setItem} onAdd={addItem} onRemove={(value: string) => updateList("medications", medications.filter((entry) => entry !== value))} />

        <SectionTitle title="Blood donation" palette={palette} />
        <View style={styles.card}>
          <View style={styles.bloodTop}><View style={styles.bloodGroup}><Text style={styles.bloodGroupText}>{personal.blood}</Text></View><View style={styles.flex}><Text style={styles.overline}>Blood group</Text><Text style={styles.bloodValue}>{personal.blood}</Text></View><View style={styles.eligibility}><Text style={styles.eligibilityText}>{donationEligibility.label}</Text></View></View>
          <View style={styles.dividerRow}><View><Text style={styles.rowTitle}>Last donation</Text><Text style={styles.rowCopy}>{formatDate(lastDonation)}</Text></View><View style={styles.ready}><Text style={styles.readyText}>{donationEligibility.eligible ? "Ready" : `${donationEligibility.daysLeft} days left`}</Text></View></View>
          <View style={styles.dividerRow}><View style={styles.flex}><Text style={styles.rowTitle}>Donation availability</Text><Text style={styles.rowCopy}>{donorAvailable ? "You may receive emergency donation requests." : "You won't receive donation requests."}</Text></View><Switch value={donorAvailable} onValueChange={setDonorAvailable} trackColor={{ false: palette.border, true: palette.primary }} thumbColor={palette.surface} accessibilityLabel="Donation availability" /></View>
        </View>

        <View style={styles.contactHeading}><SectionTitle title="Emergency contacts" palette={palette} compact /><Pressable onPress={() => setEditingContact({ id: `c${Date.now()}`, name: "", relation: "", phone: "" })} style={styles.addContact}><Plus size={12} color={palette.primary} /><Text style={styles.addContactText}>Add contact</Text></Pressable></View>
        {contacts.map((contact) => <View key={contact.id} style={styles.contactCard}><View style={styles.contactAvatar}><Text style={styles.contactAvatarText}>{contact.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</Text></View><View style={styles.contactInfo}><Text style={styles.contactName}>{contact.name}</Text><Text style={styles.contactRelation}>{contact.relation}</Text><View style={styles.phoneRow}><Phone size={12} color={palette.primary} /><Text style={styles.phone}>{contact.phone}</Text></View></View><View style={styles.contactActions}><Pressable onPress={() => setEditingContact(contact)} style={styles.contactButton}><Pencil size={14} color={palette.muted} /></Pressable><Pressable onPress={() => removeContact(contact.id)} style={styles.removeButton}><Trash2 size={14} color={theme.colors.emergency} /></Pressable></View></View>)}
        {editingContact && <View style={styles.contactEditor}>{(["name", "relation", "phone"] as const).map((field) => <View key={field}><Text style={styles.editorLabel}>{field === "name" ? "Full name" : field === "relation" ? "Relationship" : "Phone"}</Text><TextInput value={editingContact[field]} onChangeText={(text) => setEditingContact((contact) => contact ? { ...contact, [field]: text } : contact)} style={styles.editorInput} placeholderTextColor={palette.muted} /></View>)}<View style={styles.editorActions}><Pressable onPress={() => setEditingContact(null)} style={styles.editorCancel}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={saveContact} style={styles.editorSave}><Text style={styles.saveText}>Save</Text></Pressable></View></View>}
        <Text style={styles.footer}>MedLink · v2.4.0</Text>
      </ScrollView>
    </View>
  );
}

const labels: Record<keyof Personal, string> = { fullName: "Full name", dob: "Date of birth", gender: "Gender", blood: "Blood group", address: "Address" };

function formatProfileDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "Not provided";
}

function formatGender(value: string | null) {
  return value ? `${value.slice(0, 1)}${value.slice(1).toLowerCase()}` : "Not provided";
}

function getInitials(name: string) {
  return name === "Not provided" ? "?" : name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function SectionTitle({ title, palette, compact = false }: { title: string; palette: Palette; compact?: boolean }) { return <View style={[sectionStyles.wrap, compact && sectionStyles.compact]}><Text style={[sectionStyles.text, { color: palette.muted }]}>{title}</Text></View>; }

function MedicalCard({ kind, title, items, Icon, tone, palette, styles, adding, item, setAdding, setItem, onAdd, onRemove }: any) {
  const toneStyle = tone === "emergency" ? styles.emergencyIcon : tone === "warning" ? styles.warningIcon : styles.infoIcon;
  const iconStyle = { width: 40, height: 40, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 16 };
  return <View style={styles.medicalCard}><View style={styles.medicalTop}><View style={[iconStyle, toneStyle]}><Icon size={18} color={tone === "emergency" ? theme.colors.emergency : tone === "warning" ? theme.colors.warning : theme.colors.info} strokeWidth={2.3} /></View><Text style={styles.medicalTitle}>{title}</Text><Pressable onPress={() => { setAdding(adding === kind ? null : kind); setItem(""); }} style={styles.plusButton}>{adding === kind ? <X size={16} color={palette.muted} /> : <Plus size={16} color={palette.muted} />}</Pressable></View>{adding === kind && <View style={styles.addRow}><TextInput autoFocus value={item} onChangeText={setItem} onSubmitEditing={onAdd} placeholder={title} placeholderTextColor={palette.muted} style={styles.addInput} /><Pressable onPress={onAdd} style={styles.addItem}><Text style={styles.addItemText}>Add item</Text></Pressable></View>}<View style={styles.chips}>{items.length === 0 && <Text style={styles.empty}>None</Text>}{items.map((entry: string) => <View key={entry} style={styles.chip}><Text style={styles.chipText}>{entry}</Text><Pressable onPress={() => onRemove(entry)} hitSlop={6}><X size={12} color={palette.muted} /></Pressable></View>)}</View></View>;
}

type Palette = ReturnType<typeof getPalette>;
function getPalette(dark: boolean) { return dark ? { background: theme.colors.backgroundDark, surface: theme.colors.surfaceDark, variant: theme.colors.container, foreground: theme.colors.primaryForeground, muted: theme.colors.mutedForeground, border: theme.colors.borderDark, primary: theme.colors.secondary, primaryContainer: theme.colors.primaryContainer, primaryForeground: theme.colors.backgroundDark } : { background: theme.colors.background, surface: theme.colors.surface, variant: theme.colors.surfaceVariant, foreground: theme.colors.foreground, muted: theme.colors.mutedForeground, border: theme.colors.border, primary: theme.colors.primary, primaryContainer: theme.colors.primaryContainer, primaryForeground: theme.colors.primaryForeground }; }

const sectionStyles = StyleSheet.create({ wrap: { marginTop: 28, marginBottom: 10, paddingHorizontal: 6 }, compact: { marginTop: 0, marginBottom: 0, paddingHorizontal: 0 }, text: { fontFamily: theme.fonts.extraBold, fontSize: 13, lineHeight: 16, letterSpacing: 1.56, textTransform: "uppercase" } });
const createStyles = (p: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: p.background }, content: { paddingHorizontal: 16 }, header: { paddingHorizontal: 4, paddingBottom: 12 }, profileError: { marginBottom: 10, borderRadius: 12, backgroundColor: theme.colors.emergencyLight, padding: 12, color: theme.colors.emergency, fontFamily: theme.fonts.medium, fontSize: 12 }, title: { fontFamily: theme.fonts.extraBold, fontWeight: "800", fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: p.foreground }, subtitle: { fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: p.muted }, card: { borderWidth: 1, borderColor: p.border, borderRadius: 28, backgroundColor: p.surface, padding: 20, ...theme.shadows.shadowCard }, profileCard: { alignItems: "center", gap: 12, borderWidth: 1, borderColor: p.border, borderRadius: 28, backgroundColor: p.surface, paddingHorizontal: 20, paddingVertical: 28, ...theme.shadows.shadowCard }, avatar: { width: 86, height: 86, alignItems: "center", justifyContent: "center", borderRadius: 43, backgroundColor: p.primaryContainer }, avatarText: { fontFamily: theme.fonts.extraBold, fontSize: 26, color: p.primary }, identity: { alignItems: "center", gap: 2 }, name: { fontFamily: theme.fonts.extraBold, fontSize: 21, lineHeight: 25, letterSpacing: -0.42, color: p.foreground }, identityDetail: { fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 17, color: p.muted }, editProfile: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, borderRadius: 999, backgroundColor: p.primary, paddingHorizontal: 20, paddingVertical: 10, ...theme.shadows.shadowFloat }, editProfileText: { fontFamily: theme.fonts.bold, fontSize: 13, lineHeight: 16, color: p.primaryForeground }, personalAction: { minHeight: 34, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8, marginBottom: 2 }, editSmall: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: p.primaryContainer, paddingHorizontal: 12, paddingVertical: 6 }, editSmallText: { fontFamily: theme.fonts.bold, fontSize: 12, color: p.primary }, cancel: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }, cancelText: { fontFamily: theme.fonts.bold, fontSize: 12, color: p.muted }, save: { borderRadius: 999, backgroundColor: p.primary, paddingHorizontal: 14, paddingVertical: 6 }, saveText: { fontFamily: theme.fonts.bold, fontSize: 12, color: p.primaryForeground }, infoRow: { flexDirection: "row", alignItems: "center", gap: 16, borderTopWidth: 1, borderTopColor: p.border, paddingVertical: 14 }, infoLabel: { width: "38%", fontFamily: theme.fonts.semiBold, fontSize: 12.5, color: p.muted }, infoValue: { flex: 1, textAlign: "right", fontFamily: theme.fonts.bold, fontSize: 13.5, lineHeight: 18, color: p.foreground }, infoInput: { flex: 1, borderRadius: 12, backgroundColor: p.variant, paddingHorizontal: 12, paddingVertical: 8, fontFamily: theme.fonts.semiBold, fontSize: 13.5, color: p.foreground }, medicalCard: { marginBottom: 12, borderWidth: 1, borderColor: p.border, borderRadius: 28, backgroundColor: p.surface, padding: 20, ...theme.shadows.shadowCard }, medicalTop: { flexDirection: "row", alignItems: "center", gap: 12 }, emergencyIcon: { backgroundColor: theme.colors.emergencyLight }, warningIcon: { backgroundColor: theme.colors.warningLight }, infoIcon: { backgroundColor: theme.colors.infoLight }, medicalTitle: { flex: 1, fontFamily: theme.fonts.extraBold, fontSize: 15, color: p.foreground }, plusButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: p.variant }, addRow: { flexDirection: "row", gap: 8, marginTop: 12 }, addInput: { flex: 1, borderRadius: 12, backgroundColor: p.variant, paddingHorizontal: 12, paddingVertical: 8, fontFamily: theme.fonts.semiBold, fontSize: 13, color: p.foreground }, addItem: { justifyContent: "center", borderRadius: 12, backgroundColor: p.primary, paddingHorizontal: 14 }, addItemText: { fontFamily: theme.fonts.bold, fontSize: 12.5, color: p.primaryForeground }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: p.border, borderRadius: 999, backgroundColor: p.variant, paddingHorizontal: 12, paddingVertical: 6 }, chipText: { fontFamily: theme.fonts.semiBold, fontSize: 12.5, color: p.foreground }, empty: { fontFamily: theme.fonts.regular, fontSize: 12.5, color: p.muted }, bloodTop: { flexDirection: "row", alignItems: "center", gap: 12 }, bloodGroup: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: theme.colors.emergencyLight }, bloodGroupText: { fontFamily: theme.fonts.extraBold, fontSize: 15, color: theme.colors.emergency }, flex: { flex: 1 }, overline: { fontFamily: theme.fonts.bold, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: p.muted }, bloodValue: { fontFamily: theme.fonts.bold, fontSize: 15, color: p.foreground }, eligibility: { borderRadius: 999, backgroundColor: theme.colors.successLight, paddingHorizontal: 8, paddingVertical: 4 }, eligibilityText: { fontFamily: theme.fonts.bold, fontSize: 10.5, color: theme.colors.success }, dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, borderTopWidth: 1, borderTopColor: p.border, paddingTop: 14 }, rowTitle: { fontFamily: theme.fonts.semiBold, fontSize: 13.5, color: p.foreground }, rowCopy: { marginTop: 1, fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 16, color: p.muted }, ready: { borderRadius: 999, backgroundColor: p.variant, paddingHorizontal: 12, paddingVertical: 6 }, readyText: { fontFamily: theme.fonts.bold, fontSize: 11.5, color: p.foreground }, contactHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 28, marginBottom: 10, paddingHorizontal: 6 }, addContact: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: p.primaryContainer, paddingHorizontal: 12, paddingVertical: 6 }, addContactText: { fontFamily: theme.fonts.bold, fontSize: 11.5, color: p.primary }, contactCard: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12, borderWidth: 1, borderColor: p.border, borderRadius: 28, backgroundColor: p.surface, padding: 16, ...theme.shadows.shadowCard }, contactAvatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: p.primaryContainer }, contactAvatarText: { fontFamily: theme.fonts.extraBold, fontSize: 13, color: p.primary }, contactInfo: { flex: 1 }, contactName: { fontFamily: theme.fonts.extraBold, fontSize: 14.5, lineHeight: 18, color: p.foreground }, contactRelation: { fontFamily: theme.fonts.semiBold, fontSize: 11.5, color: p.muted }, phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }, phone: { fontFamily: theme.fonts.semiBold, fontSize: 12, color: p.primary }, contactActions: { gap: 6 }, contactButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: p.variant }, removeButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: theme.colors.emergencyLight }, contactEditor: { gap: 12, marginBottom: 12, borderWidth: 1, borderColor: p.border, borderRadius: 28, backgroundColor: p.surface, padding: 20, ...theme.shadows.shadowCard }, editorLabel: { marginBottom: 4, fontFamily: theme.fonts.bold, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: p.muted }, editorInput: { borderRadius: 12, backgroundColor: p.variant, paddingHorizontal: 12, paddingVertical: 10, fontFamily: theme.fonts.semiBold, fontSize: 13.5, color: p.foreground }, editorActions: { flexDirection: "row", gap: 8, marginTop: 4 }, editorCancel: { flex: 1, alignItems: "center", borderRadius: 999, backgroundColor: p.variant, paddingVertical: 10 }, editorSave: { flex: 1, alignItems: "center", borderRadius: 999, backgroundColor: p.primary, paddingVertical: 10 }, footer: { paddingTop: 8, paddingBottom: 8, textAlign: "center", fontFamily: theme.fonts.regular, fontSize: 10.5, color: p.muted },
});
