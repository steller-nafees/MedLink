import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View, Text, ScrollView, Pressable, Linking, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Phone, User, ShieldCheck, LogOut, Pencil, Save, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";

import { DriverShell } from "../components/DriverShell";
import { DriverHeader } from "../components/DriverHeader";
import { BigButton } from "../../../components/ui/BigButton";
import { useLang } from "../context/DriverLangContext";
import { mockData } from "../data/mockData";
import { theme } from "../../../theme";
import { clearAuthSession } from "../../../services/auth";
import { getCurrentUserId } from "../../../services/auth";
import {
  deleteMyAccount,
  getMyAmbulanceProvider,
  updateAmbulanceProvider,
  type AmbulanceProvider,
} from "../../../services/ambulance";

export function AmbulanceProfileScreen() {
  const { t, lang } = useLang();
  const router = useRouter();

  const [provider, setProvider] = useState<AmbulanceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState(mockData.driverPhone);
  const [providerName, setProviderName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getMyAmbulanceProvider()
      .then((assignedProvider) => {
        setProvider(assignedProvider);
        setDriverName(mockData.driverName[lang]);
        setProviderName(assignedProvider.provider_name ?? "");
        setPhone(assignedProvider.phone ?? "");
        setAddress(assignedProvider.address ?? "");
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Unable to load your profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveChanges = async () => {
    if (!provider) {
      setMessage("Ambulance provider information is not available yet.");
      return;
    }

    if (!providerName.trim() || !phone.trim() || !address.trim()) {
      setMessage("Enter a provider name, phone number, and address.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const updatedProvider = await updateAmbulanceProvider(provider.id, {
        providerName: providerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        latitude: provider.latitude ?? 0,
        longitude: provider.longitude ?? 0,
        isActive: provider.is_active,
      });
      setProvider(updatedProvider);

      setEditing(false);
      setMessage("Provider information updated successfully.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Unable to update your information.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setMessage("Your account identifier is unavailable.");
      return;
    }

    Alert.alert("Delete account", "This permanently deletes your account. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMyAccount(userId);
            await clearAuthSession();
            router.replace("/(auth)/login");
          } catch (error: unknown) {
            setMessage(error instanceof Error ? error.message : "Unable to delete your account.");
          }
        },
      },
    ]);
  };

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

          <Text style={styles.driverName}>{driverName || mockData.driverName[lang]}</Text>
          <Pressable onPress={handleCall} style={styles.phoneButton}>
            <Phone size={16} color={theme.colors.primary} strokeWidth={2.3} />
            <Text style={styles.phoneText}>{driverPhone}</Text>
          </Pressable>

        </View>

        {/* Driver information */}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t("provider")}</Text>
          <View style={styles.card}>
            {editing ? <>
              <TextInput value={providerName} onChangeText={setProviderName} style={styles.input} placeholder="Provider name" />
              <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" placeholder="Provider phone number" />
              <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Address" multiline />
            </> : <>
              <ReadOnlyRow label={t("provider")} value={providerName || "Not available"} />
              <View style={styles.divider} />
              <ReadOnlyRow label={t("address")} value={address || "Not available"} />
            </>}
            <Pressable style={styles.editButton} onPress={editing ? saveChanges : () => setEditing(true)} disabled={saving}>
              {saving ? <ActivityIndicator color={theme.colors.primary} /> : editing ? <Save size={16} color={theme.colors.primary} /> : <Pencil size={16} color={theme.colors.primary} />}
              <Text style={styles.editButtonText}>{saving ? "Saving..." : editing ? "Save changes" : "Edit information"}</Text>
            </Pressable>
            {message ? <Text style={styles.message}>{message}</Text> : null}
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
          <BigButton icon={Trash2} variant="outline" onClick={handleDeleteAccount} style={styles.deleteButton}>
            Delete account
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
  sectionTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 16,
    ...theme.shadows.shadowCard,
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
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutContainer: {
    marginTop: 8,
    paddingBottom: 24,
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
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 15,
    color: theme.colors.foreground,
  },
  editButton: {
    minHeight: 44,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  message: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  deleteButton: {
    marginTop: 12,
    borderColor: theme.colors.emergency,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    opacity: 0.6,
  },
});
