import { useRef, useState, type ReactNode } from "react";
import {
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import {
  ArrowRight,
  Bot,
  LayoutGrid,
  Siren,
  type LucideIcon,
} from "lucide-react-native";

const slides: Array<{
  icon: LucideIcon;
  title: string;
  desc: string;
  art: () => ReactNode;
}> = [
  {
    icon: Siren,
    title: "Emergency Help When Every Second Matters",
    desc: "Find hospitals, ambulances, and emergency care faster during critical situations.",
    art: EmergencyArt,
  },
  {
    icon: Bot,
    title: "Your AI Medical Assistant",
    desc: "Get help finding specialists, diagnostic tests, hospitals, and healthcare information through natural conversation.",
    art: AiArt,
  },
  {
    icon: LayoutGrid,
    title: "Healthcare Connected in One Place",
    desc: "Access hospitals, consultations, reservations, emergency support, and medical services from a single platform.",
    art: ConnectedArt,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;

  const goTo = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 30,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 && !last) {
          goTo(index + 1);
        }
        if (gestureState.dx > 40 && index > 0) {
          goTo(index - 1);
        }
      },
    })
  ).current;

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell} {...panResponder.panHandlers}>
        <View style={styles.headerRow}>
          <ProgressIndicator total={slides.length} current={index} />
          <Pressable onPress={() => router.replace('/(auth)')}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.slideWrap}>
          <View style={styles.artCard}>
            {slide.art()}
          </View>

          <View style={styles.copyBlock}>
            <View style={styles.stepPill}>
              <Icon size={14} color={theme.colors.primary} />
              <Text style={styles.stepText}>
                Step {index + 1} of {slides.length}
              </Text>
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.desc}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {last ? (
            <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
              <Pressable style={styles.buttonInner} onPress={() => router.replace('/(auth)')}>
                <Text style={styles.primaryText}>Get Started</Text>
                <ArrowRight size={18} color={theme.colors.primaryForeground} />
              </Pressable>
            </LinearGradient>
          ) : (
            <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButton}>
              <Pressable style={styles.buttonInner} onPress={() => goTo(index + 1)}>
                <Text style={styles.primaryText}>Next</Text>
                <ArrowRight size={18} color={theme.colors.primaryForeground} />
              </Pressable>
            </LinearGradient>
          )}

          <View style={styles.dotsRow}>
            {slides.map((_, pageIndex) => (
              <Pressable
                key={pageIndex}
                onPress={() => goTo(pageIndex)}
                style={[styles.dot, pageIndex === index ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProgressIndicator({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            index === current ? styles.progressActiveBar : index < current ? styles.progressCompleteBar : styles.progressIdleBar,
          ]}
        />
      ))}
    </View>
  );
}

function EmergencyArt() {
  return (
    <View style={styles.illustrationBoxEmergency}>
      <View style={styles.softCircleLeft} />
      <View style={styles.softCircleRight} />

      <View style={styles.emergencyRow}>
        <View style={styles.tileCard}>
          <Text style={styles.tileEmoji}>🏥</Text>
        </View>

        <View style={styles.sosBadge}>
          <View style={styles.sosRing} />
          <Siren size={34} color="#FFFFFF" />
        </View>

        <View style={styles.tileCard}>
          <Text style={styles.tileEmoji}>🚑</Text>
        </View>
      </View>

      <View style={styles.pathRow}>
        <View style={styles.pathLine} />
      </View>
    </View>
  );
}

function AiArt() {
  return (
    <View style={styles.illustrationBoxAi}>
      <View style={styles.softCircleAI} />

      <View style={styles.aiBubbleWrap}>
        <View style={styles.aiBubbleUser}>
          <Text style={styles.aiBubbleText}>I need a cardiologist near me this week.</Text>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.aiIconWrap}>
            <Bot size={18} color="#0A8DFF" />
          </View>
          <View style={styles.aiBubbleBot}>
            <Text style={styles.aiBubbleTextBot}>
              I found 3 cardiologists with openings — the closest is 2.4 km away.
            </Text>
          </View>
        </View>

        <View style={styles.pulseRow}>
          {[0, 1, 2].map((dot) => (
            <View
              key={dot}
              style={[
                styles.pulseDot,
                dot === 0 ? styles.pulseDotFirst : dot === 1 ? styles.pulseDotSecond : styles.pulseDotThird,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function ConnectedArt() {
  const tiles = ["🏥", "🩺", "💊", "🧪", "📅", "🚑", "🩸", "📋", "❤️"];

  return (
    <View style={styles.illustrationBoxConnected}>
      <View style={styles.connectedGlow} />
      <View style={styles.gridWrap}>
        {tiles.map((tile, index) => (
          <View
            key={`${tile}-${index}`}
            style={[
              styles.connectedTile,
              index === 4 ? styles.connectedTilePrimary : styles.connectedTileDefault,
            ]}
          >
            {index === 4 ? (
              <View style={styles.trendIconWrap}>
                <View style={styles.trendIconLine} />
              </View>
            ) : (
              <Text style={styles.connectedTileText}>{tile}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  shell: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressActiveBar: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    minWidth: 22,
  },
  progressCompleteBar: {
    width: 6,
    backgroundColor: theme.colors.accent,
  },
  progressIdleBar: {
    width: 6,
    backgroundColor: theme.colors.border,
  },
  skipText: {
    color: theme.colors.mutedForeground,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  slideWrap: {
    flex: 1,
    marginTop: 16,
  },
  artCard: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 20,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  copyBlock: {
    marginTop: 28,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.7,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 16,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: theme.colors.foreground,
  },
  description: {
    marginTop: 12,
    fontSize: 14.5,
    lineHeight: 22,
    color: theme.colors.mutedForeground,
  },
  footer: {
    marginTop: 10,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 999,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  primaryText: {
    color: theme.colors.primaryForeground,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  dot: {
    borderRadius: 999,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    height: 6,
    backgroundColor: theme.colors.primary,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: theme.colors.border,
  },
  swipeText: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 11.5,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
  },
  illustrationBoxEmergency: {
    position: "relative",
    height: 224,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  softCircleLeft: {
    position: "absolute",
    top: -28,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + "22",
  },
  softCircleRight: {
    position: "absolute",
    right: -30,
    bottom: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.accent + "22",
  },
  emergencyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 18,
    zIndex: 1,
  },
  tileCard: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tileEmoji: {
    fontSize: 28,
  },
  sosBadge: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.destructive,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  sosRing: {
    position: "absolute",
    inset: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  pathRow: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 18,
    zIndex: 0,
  },
  pathLine: {
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.destructive + '80',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    transform: [{ rotateY: "0deg" }],
  },
  illustrationBoxAi: {
    height: 224,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: "center",
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  softCircleAI: {
    position: "absolute",
    right: -20,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '1A',
  },
  aiBubbleWrap: {
    width: "100%",
    zIndex: 1,
  },
  aiBubbleUser: {
    alignSelf: "flex-end",
    maxWidth: "75%",
    borderRadius: 20,
    borderBottomRightRadius: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  aiBubbleText: {
    color: theme.colors.primaryForeground,
    fontSize: 12.5,
    lineHeight: 18,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
    gap: 10,
  },
  aiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBubbleBot: {
    maxWidth: "74%",
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: theme.colors.foreground,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  aiBubbleTextBot: {
    color: theme.colors.foreground,
    fontSize: 12.5,
    lineHeight: 18,
  },
  pulseRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    paddingLeft: 40,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  pulseDotFirst: {
    opacity: 0.35,
  },
  pulseDotSecond: {
    opacity: 0.7,
  },
  pulseDotThird: {
    opacity: 1,
  },
  illustrationBoxConnected: {
    height: 224,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  connectedGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primary + '1A',
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 210,
    justifyContent: "center",
    gap: 10,
    zIndex: 1,
  },
  connectedTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1F33",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  connectedTileDefault: {
    backgroundColor: theme.colors.surface,
  },
  connectedTilePrimary: {
    backgroundColor: theme.colors.primary,
  },
  connectedTileText: {
    fontSize: 20,
  },
  trendIconWrap: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  trendIconLine: {
    width: 18,
    height: 18,
    borderColor: theme.colors.primaryForeground,
    borderWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 999,
    transform: [{ rotate: "-40deg" }],
  },
});
