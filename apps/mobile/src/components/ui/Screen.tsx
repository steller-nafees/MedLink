import React, { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";

export interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeTop?: boolean;
  safeBottom?: boolean;
  backgroundColor?: string;
  keyboardAvoiding?: boolean;
  keyboardOffset?: number;
  showsVerticalScrollIndicator?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  safeTop = true,
  safeBottom = true,
  backgroundColor = theme.colors.background,
  keyboardAvoiding = false,
  keyboardOffset = 0,
  showsVerticalScrollIndicator = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeTop ? insets.top : 0,
    paddingBottom: safeBottom && !scrollable ? insets.bottom : 0,
  };

  const scrollBottomInset = safeBottom ? insets.bottom + theme.spacing.xl : theme.spacing.lg;

  const content = scrollable ? (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        { paddingBottom: scrollBottomInset },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, style]}>{children}</View>
  );

  if (keyboardAvoiding) {
    return (
      <View style={containerStyle}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={keyboardOffset}
          style={styles.flex}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={styles.flex}>{content}</View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  staticContent: {
    flex: 1,
  },
});
