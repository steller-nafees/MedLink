import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Loader2,
  LocateFixed,
  Phone,
  Siren,
  UserRound,
  X,
} from "lucide-react-native";
import { theme } from "../../theme";
import { AuthRequestError, saveAuthToken, startEmergencySession } from "../../services/auth";

export function GuestSosModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const detect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn't available on this device. Enter it manually.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setLocating(false);
      },
      () => {
        setError("We couldn't detect your location. Allow access or enter it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const canSubmit = name.trim().length >= 2 && phone.trim().length > 0 && !!coords && !submitting;

  const activate = async () => {
    if (!canSubmit || !coords) return;

    setSubmitting(true);
    setError("");

    try {
      const emergencySession = await startEmergencySession({
        name: name.trim(),
        phone: phone.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
      });

      await saveAuthToken(emergencySession.token.accessToken, emergencySession.data.userId);
      router.replace({
        pathname: "/(patient)/sos",
        params: {
          guest: "1",
          name: emergencySession.data.name,
          phone: emergencySession.data.phone,
          temporaryPassword: emergencySession.data.temporaryPassword ?? "",
          lat: String(emergencySession.data.latitude),
          lng: String(emergencySession.data.longitude),
        },
      });
    } catch (requestError) {
      setError(
        requestError instanceof AuthRequestError
          ? requestError.message
          : "Unable to activate Emergency SOS. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.modalBackdrop}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalWrapper}
      >
        <View style={[styles.modalCard, theme.shadows.shadowDialog]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <View style={[styles.modalIcon, theme.shadows.shadowFloat]}>
                <Siren size={20} color={theme.colors.primaryForeground} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Emergency SOS</Text>
                <Text style={styles.modalSubtitle}>Quick details so help can reach you.</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={16} color={theme.colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full name</Text>
              <View style={[styles.inputWrap, theme.shadows.shadowCard]}>
                <UserRound size={16} color={theme.colors.mutedForeground} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Name of patient or caller"
                  placeholderTextColor={theme.colors.mutedForeground}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone number</Text>
              <View style={[styles.inputWrap, theme.shadows.shadowCard]}>
                <Phone size={16} color={theme.colors.mutedForeground} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+880 17XX-XXXXXX"
                  placeholderTextColor={theme.colors.mutedForeground}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current location</Text>
              <View style={[styles.locationBox, theme.shadows.shadowCard]}>
                {coords ? (
                  <Text style={styles.locationText}>
                    <LocateFixed size={14} color={theme.colors.primary} /> Location detected ({coords.lat.toFixed(3)}, {coords.lng.toFixed(3)})
                  </Text>
                ) : (
                  <Pressable onPress={detect} disabled={locating} style={styles.locationAction}>
                    {locating ? (
                      <Loader2 size={16} color={theme.colors.primary} style={styles.spin} />
                    ) : (
                      <LocateFixed size={16} color={theme.colors.primary} />
                    )}
                    <Text style={styles.locationActionText}>
                      {locating ? "Detecting your location…" : "Tap to detect my location"}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.locationHint}>Your location is required so the emergency team can find you.</Text>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </ScrollView>

          <Pressable disabled={!canSubmit} onPress={activate} style={styles.submitButtonWrap}>
            <LinearGradient
              colors={[theme.colors.destructive, theme.colors.emergency]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.submitButton, !canSubmit && styles.disabledButton]}
            >
              <View style={styles.buttonInner}>
                {submitting ? <Loader2 size={18} color={theme.colors.primaryForeground} style={styles.spin} /> : <Siren size={18} color={theme.colors.primaryForeground} />}
                <Text style={styles.buttonText}>{submitting ? "Starting emergency session…" : "Activate Emergency SOS"}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.foreground + "73",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  modalWrapper: {
    justifyContent: "flex-end",
  },
  modalCard: {
    width: "100%",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.border + "B3",
    backgroundColor: theme.colors.surface,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceVariant,
  },
  formScroll: {
    marginTop: 20,
    maxHeight: 420,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: theme.colors.foreground,
  },
  locationBox: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.foreground,
    fontWeight: "600",
  },
  locationAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationActionText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  locationHint: {
    marginTop: 8,
    paddingHorizontal: 4,
    fontSize: 11.5,
    color: theme.colors.mutedForeground,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.destructive,
  },
  submitButtonWrap: {
    marginTop: 16,
  },
  submitButton: {
    width: "100%",
    borderRadius: theme.radii.pill,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.4,
  },
  spin: {
    transform: [{ rotate: "360deg" }],
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
  },
  buttonText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "600",
  },
});
