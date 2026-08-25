import { useState, type ComponentProps } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../theme";
import { completeMyProfile, type CompleteProfileRequest } from "../../../services/profile";

const bloodGroups: CompleteProfileRequest["bloodGroup"][] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
type Gender = CompleteProfileRequest["gender"];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ firstName: "", lastName: "", gender: "MALE" as Gender, dateOfBirth: "", nationalId: "", address: "", emergencyContactName: "", emergencyPhone: "", bloodGroup: "A+" as CompleteProfileRequest["bloodGroup"] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [key]: value })); setError(""); };

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) || !form.nationalId.trim() || form.address.trim().length < 5 || !form.emergencyContactName.trim() || !/^1[3-9]\d{8}$/.test(form.emergencyPhone)) {
      setError("Please complete every field. Use YYYY-MM-DD for date of birth and a valid 10-digit emergency number.");
      return;
    }
    setSaving(true);
    try {
      await completeMyProfile({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), gender: form.gender, dateOfBirth: form.dateOfBirth.trim(), nationalId: form.nationalId.trim(), address: form.address.trim(), emergencyContactName: form.emergencyContactName.trim(), emergencyContactPhone: `+880${form.emergencyPhone}`, bloodGroup: form.bloodGroup });
      router.replace("/(patient)");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save your profile.");
    } finally { setSaving(false); }
  };

  return <View style={[styles.screen, { paddingTop: insets.top }]}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
    <Text style={styles.eyebrow}>ONE LAST STEP</Text><Text style={styles.title}>Complete your profile</Text><Text style={styles.subtitle}>This health information helps Medlink provide safer care and emergency support.</Text>
    <View style={styles.card}>
      <View style={styles.row}><Field label="First name" value={form.firstName} onChangeText={(v) => update("firstName", v)} style={styles.flex}/><Field label="Last name" value={form.lastName} onChangeText={(v) => update("lastName", v)} style={styles.flex}/></View>
      <Text style={styles.label}>Gender</Text><View style={styles.options}>{(["MALE", "FEMALE", "OTHER"] as Gender[]).map((value) => <Choice key={value} label={value[0] + value.slice(1).toLowerCase()} selected={form.gender === value} onPress={() => update("gender", value)} />)}</View>
      <Field label="Date of birth" placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChangeText={(v) => update("dateOfBirth", v)} keyboardType="numbers-and-punctuation" />
      <Field label="National ID number" value={form.nationalId} onChangeText={(v) => update("nationalId", v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
      <Field label="Address" value={form.address} onChangeText={(v) => update("address", v)} multiline />
      <Text style={styles.section}>EMERGENCY CONTACT</Text><Field label="Contact name" value={form.emergencyContactName} onChangeText={(v) => update("emergencyContactName", v)} /><Field label="Contact phone" prefix="+880" placeholder="1XXXXXXXXX" value={form.emergencyPhone} onChangeText={(v) => update("emergencyPhone", v.replace(/[^0-9]/g, "").slice(0, 10))} keyboardType="number-pad" />
      <Text style={styles.label}>Blood group</Text><View style={styles.bloodGrid}>{bloodGroups.map((value) => <Choice key={value} label={value} selected={form.bloodGroup === value} onPress={() => update("bloodGroup", value)} compact />)}</View>
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} style={styles.button}><Pressable onPress={submit} disabled={saving} style={styles.buttonInner}>{saving ? <ActivityIndicator color={theme.colors.primaryForeground} /> : <Text style={styles.buttonText}>Complete profile</Text>}</Pressable></LinearGradient>
  </ScrollView></KeyboardAvoidingView></View>;
}

function Field({ label, prefix, style, ...props }: { label: string; prefix?: string; style?: any } & ComponentProps<typeof TextInput>) { return <View style={[styles.field, style]}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, props.multiline && styles.multi]}>{prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}<TextInput {...props} style={[styles.input, props.multiline && styles.inputMulti]} placeholderTextColor={theme.colors.mutedForeground} /></View></View>; }
function Choice({ label, selected, onPress, compact }: { label: string; selected: boolean; onPress: () => void; compact?: boolean }) { return <Pressable onPress={onPress} style={[styles.choice, compact && styles.blood, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.colors.background }, flex: { flex: 1 }, content: { padding: 24 }, eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, title: { marginTop: 8, fontSize: 28, fontWeight: "800", color: theme.colors.foreground }, subtitle: { marginTop: 8, marginBottom: 24, fontSize: 14, lineHeight: 20, color: theme.colors.mutedForeground }, card: { gap: 14, padding: 18, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, row: { flexDirection: "row", gap: 12 }, field: { gap: 6 }, label: { fontSize: 12, fontWeight: "700", color: theme.colors.mutedForeground }, inputWrap: { minHeight: 50, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 12 }, multi: { minHeight: 82, alignItems: "flex-start", paddingVertical: 10 }, input: { flex: 1, fontSize: 14, color: theme.colors.foreground }, inputMulti: { textAlignVertical: "top" }, prefix: { marginRight: 8, fontWeight: "700", color: theme.colors.foreground }, options: { flexDirection: "row", gap: 8 }, choice: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingVertical: 10 }, choiceSelected: { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary }, choiceText: { fontSize: 12, fontWeight: "700", color: theme.colors.foreground }, choiceTextSelected: { color: theme.colors.primary }, section: { marginTop: 4, fontSize: 11, fontWeight: "800", letterSpacing: 1, color: theme.colors.primary }, bloodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, blood: { flexGrow: 0, flexBasis: "22%" }, error: { marginTop: 14, color: theme.colors.destructive, fontSize: 13, lineHeight: 18 }, button: { marginTop: 20, borderRadius: 999, overflow: "hidden" }, buttonInner: { minHeight: 54, alignItems: "center", justifyContent: "center" }, buttonText: { color: theme.colors.primaryForeground, fontWeight: "800", fontSize: 15 } });
