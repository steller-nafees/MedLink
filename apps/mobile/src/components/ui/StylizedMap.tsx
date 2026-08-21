import React, { useEffect } from "react";
import { View, StyleSheet, Text, ViewStyle, StyleProp } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Pattern, Path, Rect, Ellipse, G, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { Plus, Minus, Navigation } from "lucide-react-native";
import { theme } from "../../theme";

export type Marker = {
  x: number;
  y: number;
  label?: string;
  kind: "hospital" | "patient" | "ambulance";
};

interface StylizedMapProps {
  markers?: Marker[];
  route?: { from: { x: number; y: number }; to: { x: number; y: number } };
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

function PatientMarker() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1.8, { duration: 1500 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 0 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.patientMarkerContainer}>
      <Animated.View style={[styles.patientPing, animatedStyle]} />
      <View style={styles.patientDot}>
        <View style={styles.patientDotInner} />
      </View>
    </View>
  );
}

export function StylizedMap({ markers = [], route, compact, style }: StylizedMapProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.colors.surface} />
            <Stop offset="100%" stopColor={theme.colors.surfaceVariant} />
          </LinearGradient>
          <Pattern id="mapGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <Path d="M 8 0 L 0 0 0 8" fill="none" stroke={theme.colors.border} strokeWidth="0.5" />
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#mapBg)" />
        <Rect width="100%" height="100%" fill="url(#mapGrid)" />

        {/* Rivers / parks */}
        <Path d="M -5 62 Q 30 55 55 68 T 110 60" stroke={theme.colors.primary} strokeWidth="4" fill="none" opacity="0.1" />
        <Path d="M -5 62 Q 30 55 55 68 T 110 60" stroke={theme.colors.primary} strokeWidth="1.2" fill="none" opacity="0.15" />
        <Ellipse cx="18" cy="24" rx="14" ry="10" fill={theme.colors.success} opacity="0.1" />
        <Ellipse cx="82" cy="82" rx="16" ry="8" fill={theme.colors.success} opacity="0.1" />

        {/* Roads background (white-ish) */}
        <G stroke={theme.colors.background} strokeLinecap="round" fill="none">
          <Path d="M -5 45 L 105 42" strokeWidth="2.2" />
          <Path d="M 20 -5 L 25 105" strokeWidth="2" />
          <Path d="M 62 -5 L 70 105" strokeWidth="2" />
          <Path d="M -5 78 L 105 74" strokeWidth="1.6" opacity="0.8" />
          <Path d="M -5 18 L 105 20" strokeWidth="1.4" opacity="0.7" />
        </G>

        {/* Roads border/stroke */}
        <G stroke={theme.colors.border} strokeLinecap="round" fill="none">
          <Path d="M -5 45 L 105 42" strokeWidth="2.6" />
          <Path d="M 20 -5 L 25 105" strokeWidth="2.4" />
          <Path d="M 62 -5 L 70 105" strokeWidth="2.4" />
        </G>

        {/* Route */}
        {route && (
          <G>
            <Path
              d={`M ${route.from.x} ${route.from.y} Q ${(route.from.x + route.to.x) / 2 + 6} ${Math.min(route.from.y, route.to.y) - 12}, ${route.to.x} ${route.to.y}`}
              stroke={theme.colors.primary}
              strokeWidth="1.6"
              strokeDasharray="2 1.5"
              fill="none"
              opacity="0.95"
            />
          </G>
        )}
      </Svg>

      {/* Markers */}
      {markers.map((m, i) => (
        <View
          key={i}
          style={[
            styles.markerWrapper,
            { left: `${m.x}%`, top: `${m.y}%` }
          ]}
        >
          {m.kind === "hospital" && (
            <View style={styles.hospitalMarker}>
              <View style={styles.hospitalLabel}>
                <Text style={styles.hospitalLabelText}>{m.label ?? "Hospital"}</Text>
              </View>
              <View style={styles.hospitalIconWrapper}>
                <Plus size={16} color={theme.colors.primaryForeground} strokeWidth={2.6} />
              </View>
            </View>
          )}

          {m.kind === "patient" && <PatientMarker />}

          {m.kind === "ambulance" && (
            <View style={styles.ambulanceIconWrapper}>
              {/* Approximating SVG icon with lucide Navigation */}
              <Navigation size={14} color={theme.colors.background} strokeWidth={2.4} style={{ transform: [{ rotate: "45deg" }] }} />
            </View>
          )}
        </View>
      ))}

      {!compact && (
        <View style={styles.controlsRight}>
          <View style={styles.controlButton}>
            <Text style={styles.controlText}>+</Text>
          </View>
          <View style={styles.controlButton}>
            <Text style={styles.controlText}>−</Text>
          </View>
        </View>
      )}

      {!compact && (
        <View style={styles.controlBottomRight}>
          <View style={styles.locationButton}>
            <Navigation size={16} color={theme.colors.foreground} strokeWidth={2} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceVariant,
  },
  markerWrapper: {
    position: "absolute",
    // Translate -50% -100% equivalent
    transform: [{ translateX: -14 }, { translateY: -28 }],
    alignItems: "center",
  },
  hospitalMarker: {
    alignItems: "center",
  },
  hospitalLabel: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    ...theme.shadows.shadowCard,
  },
  hospitalLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  hospitalIconWrapper: {
    marginTop: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.shadowFloat,
  },
  patientMarkerContainer: {
    position: "relative",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  patientPing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.emergency,
  },
  patientDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.emergency,
    borderWidth: 4,
    borderColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowFloat,
  },
  patientDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },
  ambulanceIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.foreground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.colors.white,
    ...theme.shadows.shadowFloat,
  },
  controlsRight: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 6,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.lg,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
  controlText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  controlBottomRight: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
  locationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.shadowCard,
  },
});
