import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ambulance, Phone, Pencil, User, Check, X, ShieldCheck, LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";

import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { BigButton } from "../../../components/ui/BigButton";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";
import { clearAuthSession } from "../../../services/auth";

export function AmbulanceProfileScreen() {
  const { t, lang } = useLang();
  const en = lang === "en";
  const router = useRouter();

  const [driverName, setDriverName] = useState(mockData.driverName[lang]);
  const [driverPhone, setDriverPhone] = useState(mockData.driverPhone);
  const [editingDriver, setEditingDriver] = useState(false);

  const handleCall = () => {
    Linking.openURL(`tel:${driverPhone}`);
  };

  return (
    <DriverShell showLanguage={false} hideNav={false}>
      <DriverHeader title={t("profile")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={[styles.section, styles.profileHeader]}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary]} // equivalent to primary to primary-glow if not defined
              style={styles.avatar}
            >
              <User size={40} color={theme.colors.white} strokeWidth={2.2} />
            </LinearGradient>
            <View style={styles.shieldBadge}>
              <ShieldCheck size={16} color={theme.colors.white} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.driverName}>{driverName}</Text>
          <Pressable onPress={handleCall} style={styles.phoneButton}>
            <Phone size={16} color={theme.colors.primary} strokeWidth={2.3} />
            <Text style={styles.phoneText}>{driverPhone}</Text>
          </Pressable>

          <View style={styles.editProfileBtnWrapper}>
            <Pressable
              style={styles.editProfileBtn}
              onPress={() => setEditingDriver(true)}
            >
              <Pencil size={16} color={theme.colors.primary} strokeWidth={2.4} />
              <Text style={styles.editProfileBtnText}>{t("editProfile")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Driver information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("driverInfo")}</Text>
          <View style={styles.card}>
            {editingDriver ? (
              <View style={styles.editForm}>
                <Field
                  label={t("fullName")}
                  value={driverName}
                  onChange={setDriverName}
                  placeholder={t("fullName")}
                />
                <Field
                  label={t("phone")}
                  value={driverPhone}
                  onChange={setDriverPhone}
                  placeholder={t("phone")}
                  type="tel"
                />
                <View style={styles.editActions}>
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnCancel]}
                    onPress={() => setEditingDriver(false)}
                  >
                    <X size={16} color={theme.colors.foreground} strokeWidth={2.4} />
                    <Text style={styles.actionBtnCancelText}>{t("cancel")}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnSave]}
                    onPress={() => setEditingDriver(false)}
                  >
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primary]}
                      style={styles.actionBtnSaveGradient}
                    >
                      <Check size={16} color={theme.colors.white} strokeWidth={2.4} />
                      <Text style={styles.actionBtnSaveText}>{t("save")}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <ReadOnlyRow label={t("fullName")} value={driverName} />
                <View style={styles.divider} />
                <ReadOnlyRow label={t("phone")} value={driverPhone} />
                <Pressable
                  style={styles.editInfoBtn}
                  onPress={() => setEditingDriver(true)}
                >
                  <Pencil size={16} color={theme.colors.foreground} strokeWidth={2.4} />
                  <Text style={styles.editInfoBtnText}>{t("editInformation")}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Ambulance information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("ambulanceInfo")}</Text>
          <View style={styles.card}>
            {/* Registration plate */}
            <View style={styles.regPlate}>
              <Ambulance size={24} color={theme.colors.success} strokeWidth={2.2} />
              <View style={styles.regContent}>
                <Text style={styles.regLabel}>{t("vehicleRegistration")}</Text>
                <Text style={styles.regValue}>{mockData.ambulanceReg}</Text>
              </View>
            </View>

            <ReadOnlyRow
              label={t("ambulanceType")}
              value={`${mockData.ambulanceType[lang]} · ${mockData.ambulanceTypeLabel[lang]}`}
            />
            <View style={styles.divider} />
            <ReadOnlyRow label={t("provider")} value={mockData.ambulanceProvider[lang]} />
            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t("vehicleStatus")}</Text>
              <StatusBadge tone="success" dot>
                {t("active")}
              </StatusBadge>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.sectionContainer, styles.logoutContainer]}>
          <BigButton
            icon={LogOut}
            variant="outline"
            onClick={async () => {
              await clearAuthSession();
              router.replace("/(auth)/login");
            }}
          >
            {t("logout")}
          </BigButton>
        </View>
      </ScrollView>
    </DriverShell>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readOnlyRow}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue}>{value}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        keyboardType={type === "tel" ? "phone-pad" : "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)", // border-border/70
    backgroundColor: theme.colors.surface,
    padding: 24,
    ...theme.shadows.shadowCard,
  },
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.colors.primary + "1A", // ring-primary/10
    ...theme.shadows.shadowFloat,
  },
  shieldBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.success,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  driverName: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  phoneButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phoneText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  editProfileBtnWrapper: {
    marginTop: 16,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + "1A", // bg-primary-container approx
  },
  editProfileBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutContainer: {
    marginTop: 8,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1, // tracking-widest approx
    color: theme.colors.mutedForeground,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)",
    backgroundColor: theme.colors.surface,
    padding: 20,
    ...theme.shadows.shadowCard,
  },
  editForm: {
    gap: 16,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: theme.colors.mutedForeground,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    fontSize: 15.5,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
  },
  actionBtnCancel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionBtnCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  actionBtnSave: {
    overflow: "hidden",
    ...theme.shadows.shadowFloat,
  },
  actionBtnSaveGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnSaveText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.white,
  },
  readOnlyRow: {
    paddingVertical: 4,
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: theme.colors.mutedForeground,
  },
  readOnlyValue: {
    fontSize: 15.5,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    opacity: 0.6,
  },
  editInfoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(202, 212, 224, 0.7)",
    backgroundColor: theme.colors.surface,
  },
  editInfoBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  regPlate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.success + "59", // ~35% opacity
    backgroundColor: theme.colors.success + "0D", // ~5% opacity
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  regContent: {
    flex: 1,
  },
  regLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: theme.colors.success, // success/80 approx
    opacity: 0.8,
  },
  regValue: {
    fontSize: 17,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: theme.colors.foreground,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: theme.colors.mutedForeground,
  },
});
