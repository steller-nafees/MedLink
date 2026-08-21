import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { theme } from "../../../theme";

export interface AuthVerificationPanelProps {
  title: string;
  description: string;
  initialCode: string;
  length: number;
  action: React.ReactNode;
}

export function AuthVerificationPanel({ title, description, initialCode, length, action }: AuthVerificationPanelProps) {
  const [code, setCode] = useState(initialCode);
  const isDark = useColorScheme() === "dark";
  const palette = {
    surface: isDark ? theme.colors.surfaceDark : theme.colors.surface,
    foreground: isDark ? theme.colors.primaryForeground : theme.colors.foreground,
    muted: isDark ? theme.colors.primaryForeground : theme.colors.mutedForeground,
    border: isDark ? theme.colors.borderDark : theme.colors.border,
    primary: isDark ? theme.colors.secondary : theme.colors.primary,
  };

  return (
    <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.header}>
        <View style={styles.iconBox}><ShieldCheck size={20} color={palette.primary} /></View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: palette.foreground }]}>{title}</Text>
          <Text style={[styles.description, { color: palette.muted }]}>{description}</Text>
        </View>
      </View>
      <Pressable style={styles.otpRow} accessibilityRole="button" accessibilityLabel="Verification code">
        {Array.from({ length }, (_, index) => {
          const active = code.length === index;
          return (
            <View key={index} style={[styles.otpCell, { backgroundColor: palette.surface, borderColor: active ? palette.primary : palette.border }, active && styles.otpCellActive]}>
              <Text style={[styles.otpText, { color: code[index] ? palette.foreground : palette.muted }]}>{code[index] ?? "·"}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        accessibilityLabel="Verification code"
        style={styles.hiddenInput}
      />
      <View style={styles.action}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 28, borderWidth: 1, padding: 20, ...theme.shadows.shadowCard },
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
  iconBox: { alignItems: "center", backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radii.lg, height: 44, justifyContent: "center", width: 44 },
  copy: { flex: 1 },
  title: { fontFamily: theme.fonts.bold, fontSize: 15, fontWeight: "700", lineHeight: 20 },
  description: { fontFamily: theme.fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 2, opacity: 0.8 },
  otpRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  otpCell: { alignItems: "center", borderRadius: theme.radii.lg, borderWidth: 1, flex: 1, height: 58, justifyContent: "center", ...theme.shadows.shadowCard },
  otpCellActive: { shadowColor: theme.colors.primary, shadowOpacity: 0.15, shadowRadius: 4 },
  otpText: { fontFamily: theme.fonts.bold, fontSize: 22, fontWeight: "700", lineHeight: 26 },
  hiddenInput: { height: 1, opacity: 0, position: "absolute", width: 1 },
  action: { marginTop: 16 },
});
