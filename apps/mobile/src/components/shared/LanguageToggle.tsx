import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useLang, type Lang } from "../../lib/driver-i18n";
import { theme } from "../../theme";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const options: { id: Lang; flag: string; label: string }[] = [
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "bn", flag: "🇧🇩", label: "বাংলা" },
];

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Pill width = half of container minus padding
  const pillWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  useEffect(() => {
    if (containerWidth <= 0) return;
    const targetX = lang === "en" ? 0 : pillWidth + 8;
    translateX.value = withTiming(targetX, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [lang, containerWidth, pillWidth, translateX]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    // Set initial position without animation
    const pw = (w - 8) / 2;
    translateX.value = lang === "en" ? 0 : pw + 8;
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Sliding gradient pill */}
      {pillWidth > 0 && (
        <AnimatedLinearGradient
          colors={theme.gradients.primary.colors as unknown as [string, string]}
          start={theme.gradients.primary.start}
          end={theme.gradients.primary.end}
          style={[
            styles.pill,
            { width: pillWidth },
            animatedPillStyle,
          ]}
        />
      )}

      {/* Option buttons */}
      {options.map((o) => {
        const isActive = lang === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => setLang(o.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={styles.option}
          >
            <Text style={styles.flag}>{o.flag}</Text>
            <Text
              style={[
                styles.optionLabel,
                { color: isActive ? theme.colors.primaryForeground : theme.colors.mutedForeground },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border + "B3", // ~70% opacity
    backgroundColor: theme.colors.surface,
    padding: 4,
    ...theme.shadows.shadowCard,
  },
  pill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 999,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 86,
    zIndex: 10,
  },
  flag: {
    fontSize: 14,
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.bold,
    fontWeight: "700",
  },
});
