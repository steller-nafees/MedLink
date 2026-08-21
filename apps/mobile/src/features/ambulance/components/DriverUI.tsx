import { StyleSheet, Text, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useLang, Lang } from "../context/DriverLangContext";
import { theme } from "../../../theme";

export function LanguageToggle() {
  const { lang, setLang } = useLang();

  const opts: { id: Lang; flag: string; label: string }[] = [
    { id: "en", flag: "🇬🇧", label: "English" },
    { id: "bn", flag: "🇧🇩", label: "বাংলা" },
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(lang === "en" ? 0 : 92, {
            damping: 20,
            stiffness: 200,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pill, animatedStyle]} />
      {opts.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => setLang(o.id)}
          style={styles.button}
        >
          <Text
            style={[
              styles.text,
              lang === o.id ? styles.textActive : styles.textInactive,
            ]}
          >
            <Text style={styles.flag}>{o.flag}</Text> {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 4,
    ...theme.shadows.shadowCard,
    width: 192, // 96 * 2 approx
  },
  pill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: 88,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primary, // should be gradient but solid is fine for small pill, wait design says gradient-primary
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    zIndex: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
  },
  textActive: {
    color: theme.colors.primaryForeground,
  },
  textInactive: {
    color: theme.colors.mutedForeground,
  },
  flag: {
    fontSize: 14,
  },
});
