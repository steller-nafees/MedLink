import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, useColorScheme, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, ChevronLeft, ChevronRight, Globe, HelpCircle, LogOut, Palette, ShieldCheck, Wifi, type LucideIcon } from "lucide-react-native";
import { theme } from "../../../theme";
import { clearAuthSession } from "../../../services/auth";
import { getNetworkOverride, setNetworkOverride, type NetworkOverride } from "../../sos/utils/offline-sync";
import { connectivityOptions, emergencyConnectivityCopy, languageOptions, settingsCopy, settingsVersion, type SettingsAppearance, type SettingsLanguage } from "./settingsMockData";

const LANGUAGE_KEY = "medlink.lang";
const APPEARANCE_KEY = "medlink.appearance";
type Palette = ReturnType<typeof createPalette>;
type ScreenStyles = ReturnType<typeof createStyles>;

export default function PatientSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [language, setLanguage] = useState<SettingsLanguage>("en");
  const [appearance, setAppearance] = useState<SettingsAppearance>("light");
  const [network, setNetwork] = useState<NetworkOverride>("auto");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => { void Promise.all([AsyncStorage.getItem(LANGUAGE_KEY), AsyncStorage.getItem(APPEARANCE_KEY), getNetworkOverride()]).then(([storedLanguage, storedAppearance, storedNetwork]) => { if (storedLanguage === "en" || storedLanguage === "bn") setLanguage(storedLanguage); if (storedAppearance === "light" || storedAppearance === "dark" || storedAppearance === "system") setAppearance(storedAppearance); setNetwork(storedNetwork); }); }, []);

  const isDark = appearance === "dark" || (appearance === "system" && systemScheme === "dark");
  const palette = useMemo(() => createPalette(isDark), [isDark]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const copy = settingsCopy[language];
  const selectLanguage = useCallback((value: SettingsLanguage) => { setLanguage(value); void AsyncStorage.setItem(LANGUAGE_KEY, value); }, []);
  const selectAppearance = useCallback((value: SettingsAppearance) => { setAppearance(value); void AsyncStorage.setItem(APPEARANCE_KEY, value); }, []);
  const selectNetwork = useCallback((value: NetworkOverride) => { setNetwork(value); void setNetworkOverride(value); }, []);

  return <View style={styles.screen}><StatusBar style={isDark ? "light" : "dark"} /><ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} onPress={() => router.back()} style={styles.backButton}><ChevronLeft size={16} color={palette.foreground} /></Pressable><Text style={styles.title}>{copy.settings}</Text></View>
    <View style={styles.body}><Text style={styles.sectionTitle}>{copy.settings}</Text><View style={styles.card}>
      <PreferenceBlock icon={Globe} title={copy.language} hint={copy.languageHint} palette={palette} styles={styles}><SegmentedControl value={language} onChange={selectLanguage} options={languageOptions} palette={palette} styles={styles} /></PreferenceBlock>
      <PreferenceBlock icon={Palette} title={copy.appearance} palette={palette} styles={styles} bordered><SegmentedControl value={appearance} onChange={selectAppearance} options={[{ value: "light", label: copy.light }, { value: "dark", label: copy.dark }, { value: "system", label: copy.system }]} palette={palette} styles={styles} /></PreferenceBlock>
      <PreferenceBlock icon={Wifi} title={emergencyConnectivityCopy.title} hint={emergencyConnectivityCopy.hint} palette={palette} styles={styles} bordered><SegmentedControl value={network} onChange={selectNetwork} options={connectivityOptions} palette={palette} styles={styles} /></PreferenceBlock>
      <SettingsRow icon={Bell} label={copy.notifications} palette={palette} styles={styles} right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: palette.border, true: palette.primary }} thumbColor={palette.surface} />} />
      <SettingsRow icon={ShieldCheck} label={copy.privacyPolicy} palette={palette} styles={styles} /><SettingsRow icon={HelpCircle} label={copy.helpSupport} palette={palette} styles={styles} /><SettingsRow icon={LogOut} label={copy.logout} palette={palette} styles={styles} emergency onPress={async () => { await clearAuthSession(); router.replace("/(auth)/login"); }} />
    </View><Text style={styles.version}>{settingsVersion}</Text></View>
  </ScrollView></View>;
}

function PreferenceBlock({ icon: Icon, title, hint, children, palette, styles, bordered = false }: { icon: LucideIcon; title: string; hint?: string; children: ReactNode; palette: Palette; styles: ScreenStyles; bordered?: boolean }) { return <View style={[styles.preferenceBlock, bordered && styles.bordered]}><View style={styles.preferenceHeading}><View style={[styles.icon, styles.primaryIcon]}><Icon size={17} color={palette.primary} strokeWidth={2.3} /></View><View style={styles.flex}><Text style={styles.rowLabel}>{title}</Text>{hint ? <Text style={styles.hint}>{hint}</Text> : null}</View></View>{children}</View>; }
function SegmentedControl<T extends string>({ value, onChange, options, palette, styles }: { value: T; onChange: (value: T) => void; options: readonly { value: T; label: string }[]; palette: Palette; styles: ScreenStyles }) { return <View style={styles.segmentedControl}>{options.map((option) => { const selected = option.value === value; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onChange(option.value)} style={[styles.segment, selected && styles.segmentSelected]}><Text style={[styles.segmentText, { color: selected ? palette.primary : palette.mutedForeground }]}>{option.label}</Text></Pressable>; })}</View>; }
function SettingsRow({ icon: Icon, label, right, palette, styles, emergency = false, onPress }: { icon: LucideIcon; label: string; right?: ReactNode; palette: Palette; styles: ScreenStyles; emergency?: boolean; onPress?: () => void | Promise<void> }) { return <Pressable accessibilityRole={right ? undefined : "button"} onPress={onPress} style={styles.settingsRow}><View style={[styles.icon, emergency ? styles.emergencyIcon : styles.primaryIcon]}><Icon size={17} color={emergency ? palette.emergency : palette.primary} strokeWidth={2.3} /></View><Text style={[styles.rowLabel, styles.flex, emergency && { color: palette.emergency }]}>{label}</Text>{right ?? <ChevronRight size={16} color={palette.chevron} />}</Pressable>; }

function createPalette(dark: boolean) { return dark ? { background: theme.colors.backgroundDark, surface: theme.colors.surfaceDark, surfaceVariant: theme.colors.container, foreground: theme.colors.primaryForeground, mutedForeground: theme.colors.mutedForeground, border: theme.colors.borderDark, primary: theme.colors.secondary, primaryContainer: theme.colors.primaryContainer, emergency: theme.colors.emergency, chevron: theme.colors.mutedForeground } : { background: theme.colors.background, surface: theme.colors.surface, surfaceVariant: theme.colors.surfaceVariant, foreground: theme.colors.foreground, mutedForeground: theme.colors.mutedForeground, border: theme.colors.border, primary: theme.colors.primary, primaryContainer: theme.colors.primaryContainer, emergency: theme.colors.emergency, chevron: theme.colors.mutedForeground }; }
function createStyles(palette: Palette) { return StyleSheet.create({ screen: { flex: 1, backgroundColor: palette.background }, content: { flexGrow: 1 }, header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 12 }, backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: palette.border, borderRadius: 18, backgroundColor: palette.surface, ...theme.shadows.shadowCard }, title: { flex: 1, color: palette.foreground, fontFamily: theme.fonts.extraBold, fontSize: 26, lineHeight: 31, letterSpacing: -0.52 }, body: { paddingHorizontal: 16 }, sectionTitle: { marginBottom: 10, paddingHorizontal: 6, color: palette.mutedForeground, fontFamily: theme.fonts.extraBold, fontSize: 13, lineHeight: 16, letterSpacing: 1.56, textTransform: "uppercase" }, card: { overflow: "hidden", borderWidth: 1, borderColor: palette.border, borderRadius: 28, backgroundColor: palette.surface, ...theme.shadows.shadowCard }, preferenceBlock: { gap: 12, paddingHorizontal: 20, paddingVertical: 16 }, bordered: { borderTopWidth: 1, borderTopColor: palette.border }, preferenceHeading: { flexDirection: "row", alignItems: "center", gap: 14 }, icon: { width: 36, height: 36, borderRadius: 16, alignItems: "center", justifyContent: "center" }, primaryIcon: { backgroundColor: palette.primaryContainer }, emergencyIcon: { backgroundColor: theme.colors.emergencyLight }, flex: { flex: 1 }, rowLabel: { color: palette.foreground, fontFamily: theme.fonts.bold, fontSize: 14, lineHeight: 17 }, hint: { marginTop: 2, color: palette.mutedForeground, fontFamily: theme.fonts.regular, fontSize: 11.5, lineHeight: 16 }, segmentedControl: { flexDirection: "row", borderRadius: 999, backgroundColor: palette.surfaceVariant, padding: 4 }, segment: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 36, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 8 }, segmentSelected: { backgroundColor: palette.surface, ...theme.shadows.shadowCard }, segmentText: { fontFamily: theme.fonts.bold, fontSize: 12, lineHeight: 16 }, settingsRow: { flexDirection: "row", alignItems: "center", gap: 14, borderTopWidth: 1, borderTopColor: palette.border, paddingHorizontal: 20, paddingVertical: 16 }, version: { paddingBottom: 8, paddingTop: 28, color: palette.mutedForeground, fontFamily: theme.fonts.regular, fontSize: 10.5, lineHeight: 14, textAlign: "center" } }); }
