import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Siren } from "lucide-react-native";
import { Screen } from "../../../components/ui/Screen";
import { Button } from "../../../components/ui/Button";
import { theme } from "../../../theme";
import { AuthStatePanel } from "./AuthStatePanel";
import { AuthVerificationPanel } from "./AuthVerificationPanel";
import { authStatesGalleryCopy, authStatesMockData, authVerificationMockData } from "./authStateMockData";

export interface AuthFeedbackStatesProps {
  onVerify?: () => void;
  onTryAgain?: () => void;
  onEmergencySos?: () => void;
  onRetry?: () => void;
  onCreateAccount?: () => void;
}

/** Reusable reference composition for the auth loading, offline, error and empty states. */
export function AuthFeedbackStates({ onVerify, onTryAgain, onEmergencySos, onRetry, onCreateAccount }: AuthFeedbackStatesProps) {
  const isDark = useColorScheme() === "dark";
  const foreground = isDark ? theme.colors.primaryForeground : theme.colors.foreground;
  const muted = isDark ? theme.colors.primaryForeground : theme.colors.mutedForeground;

  return (
    <Screen scrollable backgroundColor={isDark ? theme.colors.backgroundDark : theme.colors.background} contentContainerStyle={styles.content}>
      <Text style={[styles.heading, { color: foreground }]}>{authStatesGalleryCopy.title}</Text>
      <Text style={[styles.subheading, { color: muted }]}>{authStatesGalleryCopy.description}</Text>
      <View style={styles.states}>
        {authStatesMockData.map((state) => {
          if (state.id === "loading") return <AuthStatePanel key={state.id} {...state} spinning />;
          if (state.id === "offline") return null;
          if (state.id === "error") return null;
          return null;
        })}
        <AuthVerificationPanel
          title={authVerificationMockData.title}
          description={authVerificationMockData.description}
          initialCode={authVerificationMockData.code}
          length={authVerificationMockData.otpLength}
          action={<Button variant="primary" size="lg" onPress={onVerify}>{authVerificationMockData.actionLabel}</Button>}
        />
        {authStatesMockData.map((state) => {
          if (state.id === "offline") return (
            <AuthStatePanel key={state.id} {...state} action={<View style={styles.actionStack}>
              <Button variant="outline" size="lg" onPress={onTryAgain}>{authStatesGalleryCopy.tryAgainLabel}</Button>
              <Button variant="emergency" size="lg" onPress={onEmergencySos} iconLeft={<Siren size={16} color={theme.colors.emergencyForeground} />}>{authStatesGalleryCopy.emergencySosLabel}</Button>
            </View>} />
          );
          if (state.id === "error") return <AuthStatePanel key={state.id} {...state} action={<Button variant="outline" size="lg" onPress={onRetry}>{authStatesGalleryCopy.retryLabel}</Button>} />;
          if (state.id === "empty") return <AuthStatePanel key={state.id} {...state} action={<Button variant="primary" size="lg" onPress={onCreateAccount}>{authStatesGalleryCopy.createAccountLabel}</Button>} />;
          return null;
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24 },
  heading: { fontFamily: theme.fonts.bold, fontSize: 26, fontWeight: "700", letterSpacing: -0.52, lineHeight: 32, paddingHorizontal: 4 },
  subheading: { fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 4, opacity: 0.8, paddingHorizontal: 4 },
  states: { gap: 16, marginTop: 24 },
  actionStack: { gap: 10 },
});
