import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { AlertCircle, Inbox } from "lucide-react-native";
import { theme } from "../../theme";
import { Button } from "./Button";

export interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
}

export function LoadingState({
  message = "Loading...",
  size = "large",
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.centerContainer, style]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.centerContainer, styles.padded, style]}>
      <View style={styles.iconCircle}>
        {icon || <Inbox size={32} color={theme.colors.textMuted} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionText && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionText}
        </Button>
      )}
    </View>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an issue loading this information. Please try again.",
  onRetry,
  retryText = "Try Again",
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.centerContainer, styles.padded, style]}>
      <View style={[styles.iconCircle, styles.errorIconCircle]}>
        <AlertCircle size={32} color={theme.colors.emergency} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.description}>{message}</Text>}
      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onPress={onRetry}
          style={styles.actionButton}
        >
          {retryText}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl,
  },
  padded: {
    paddingHorizontal: theme.spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  errorIconCircle: {
    backgroundColor: theme.colors.emergencyLight,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    marginTop: theme.spacing.xs,
  },
});
