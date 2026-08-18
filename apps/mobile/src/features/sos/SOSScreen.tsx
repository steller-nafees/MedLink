import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Heart,
  Sparkles,
  PhoneCall,
  Truck,
  Droplet,
  MapPin,
  BedDouble,
  Activity,
  ArrowRight,
  Check,
  Star,
  Info,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '../../theme';
import {
  SyncStatusBanner,
  CallButton,
  SectionTitle,
  DonorCard,
  AmbulanceCard,
} from './components';
import {
  hospitals,
  ambulances,
  emergencySuggestions,
  SOS_COORDINATION_FEE_BDT,
  type Hospital,
  type Ambulance,
} from './utils/data';
import {
  matchDonors,
  type BloodGroup,
  type RankedDonor,
} from './utils/blood';
import { useEmergencySync, type EmergencyCache } from './utils/offline-sync';
import { sortHospitals } from './utils/helpers';

type Phase = 'input' | 'analyzing' | 'command' | 'summary';

type SosSummary = {
  hospitalName: string;
  bedReserved: boolean;
  icuReserved: boolean;
  ambulance?: { callSign: string };
  donorsContacted: number;
};

/* ────────────────────────────────────────────────────────────────── */
/* ANIMATION HELPERS                                                   */
/* Small, reusable primitives so every "AI is thinking" / entrance     */
/* moment in the screen feels alive instead of static.                 */
/* ────────────────────────────────────────────────────────────────── */

/** Continuous 0→360deg rotation, e.g. for the AI sparkles glyph. */
const useSpin = (durationMs = 1600) => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [durationMs]);
  return spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
};

/** Gentle breathing scale loop, e.g. for the SOS ring / "live" glyphs. */
const usePulse = (min = 1, max = 1.12, durationMs = 900) => {
  const scale = useRef(new Animated.Value(min)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: max,
          duration: durationMs,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: min,
          duration: durationMs,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [min, max, durationMs]);
  return scale;
};

/** Fade + rise entrance, used whenever a phase mounts. */
const FadeSlideIn: React.FC<{ children: React.ReactNode; delay?: number; style?: any }> = ({
  children,
  delay = 0,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);
  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
};

export const SOSScreen: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('');
  const [reserved, setReserved] = useState<{ bed?: boolean; icu?: boolean; ambulance?: string }>({});
  const [pendingDonor, setPendingDonor] = useState<RankedDonor | null>(null);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SosSummary | null>(null);
  const [showMoreHospitals, setShowMoreHospitals] = useState(false);
  const [bloodRequired, setBloodRequired] = useState<boolean | null>(null);
  const [assessingBlood, setAssessingBlood] = useState(false);

  const { online, cache, justSynced } = useEmergencySync();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (phase === 'analyzing') {
      const t = setTimeout(() => setPhase('command'), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const submit = (val: string) => {
    setText(val);
    setPhase('analyzing');
  };

  const endSOS = (s: SosSummary) => {
    setSummary(s);
    setPhase('summary');
  };

  const resetAndExit = () => {
    setPhase('input');
    setText('');
    setReserved({});
    setPendingDonor(null);
    setSentTo([]);
    setSummary(null);
  };

  // Shared top inset so nothing ever sits under the status bar / notch,
  // on iOS and Android alike (edge-to-edge safe).
  const topInset = Math.max(insets.top, 12);

  if (!online) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <OfflineCommandPhase
          selectedHospitalId={selectedHospitalId}
          cache={cache}
          topInset={topInset}
          bottomInset={Math.max(insets.bottom, 12)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: topInset + 8,
          paddingBottom: Math.max(insets.bottom, 20) + 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {online && cache?.syncedAt && (
          <View style={{ marginBottom: 12 }}>
            <SyncStatusBanner syncedAt={cache.syncedAt} justSynced={justSynced} />
          </View>
        )}

        {phase === 'input' && (
          <FadeSlideIn>
            <InputPhase text={text} setText={setText} submit={submit} />
          </FadeSlideIn>
        )}
        {phase === 'analyzing' && (
          <FadeSlideIn>
            <AnalyzingPhase text={text} />
          </FadeSlideIn>
        )}
        {phase === 'command' && (
          <FadeSlideIn>
            <CommandPhase
              text={text}
              reserved={reserved}
              setReserved={setReserved}
              selectedHospitalId={selectedHospitalId}
              setSelectedHospitalId={setSelectedHospitalId}
              showMoreHospitals={showMoreHospitals}
              setShowMoreHospitals={setShowMoreHospitals}
              bloodRequired={bloodRequired}
              setBloodRequired={setBloodRequired}
              assessingBlood={assessingBlood}
              setAssessingBlood={setAssessingBlood}
              pendingDonor={pendingDonor}
              setPendingDonor={setPendingDonor}
              sentTo={sentTo}
              setSentTo={setSentTo}
              endSOS={endSOS}
            />
          </FadeSlideIn>
        )}
        {phase === 'summary' && summary && (
          <FadeSlideIn>
            <SummaryPhase summary={summary} onDone={resetAndExit} />
          </FadeSlideIn>
        )}
      </ScrollView>
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/* INPUT PHASE                                                        */
/* ────────────────────────────────────────────────────────────────── */

interface InputPhaseProps {
  text: string;
  setText: (v: string) => void;
  submit: (v: string) => void;
}

const InputPhase: React.FC<InputPhaseProps> = ({ text, setText, submit }) => {
  // Outer glow ring breathes slowly; the inner circle gives a subtle
  // "heartbeat" — a bit faster, a bit smaller — so it reads as alive,
  // not just decorative.
  const glowScale = usePulse(1, 1.18, 1100);
  const heartScale = usePulse(1, 1.07, 480);

  return (
    <View style={{ flex: 1 }}>
      {/* Back button + mode indicator */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.shadowCard,
          }}
          activeOpacity={0.6}
        >
          <ArrowRight size={16} color={theme.colors.foreground} strokeWidth={2.4} />
        </TouchableOpacity>
        <View
          style={{
            borderRadius: 999,
            backgroundColor: `${theme.colors.emergency}1A`,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: theme.colors.emergency,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Emergency mode
          </Text>
        </View>
      </View>

      {/* SOS Ring animation */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Animated.View
          style={{
            width: 112,
            height: 112,
            borderRadius: 56,
            backgroundColor: `${theme.colors.emergency}26`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
            transform: [{ scale: glowScale }],
          }}
        >
          <Animated.View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: theme.colors.emergency,
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ scale: heartScale }],
              ...theme.shadows.shadowFloat,
            }}
          >
            <Heart size={36} color={theme.colors.white} strokeWidth={2.4} />
          </Animated.View>
        </Animated.View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.colors.foreground,
            marginBottom: 8,
          }}
        >
          Tell us what's happening
        </Text>
        <Text
          style={{
            fontSize: 13.5,
            textAlign: 'center',
            color: theme.colors.mutedForeground,
            paddingHorizontal: 20,
          }}
        >
          Describe the emergency in your own words. Our AI will do the rest.
        </Text>
      </View>

      {/* Text input card */}
      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          padding: 16,
          marginBottom: 20,
          ...theme.shadows.shadowCard,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. My grandmother is having chest pain and can't breathe…"
          placeholderTextColor={theme.colors.mutedForeground}
          multiline
          numberOfLines={4}
          style={{
            fontSize: 15,
            color: theme.colors.foreground,
            marginBottom: 12,
          }}
        />

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: `${theme.colors.border}B3`,
            paddingTop: 12,
          }}
        >
          <TouchableOpacity
            disabled={!text.trim()}
            onPress={() => submit(text.trim())}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 999,
              backgroundColor: theme.colors.emergency,
              paddingVertical: 12,
              paddingHorizontal: 16,
              opacity: text.trim() ? 1 : 0.4,
              ...theme.shadows.shadowFloat,
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: theme.colors.white,
              }}
            >
              Get help now
            </Text>
            <ArrowRight size={16} color={theme.colors.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Suggestions */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: 'bold',
            color: theme.colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
          }}
        >
          Or tap a common scenario
        </Text>
        <View style={{ gap: 8 }}>
          {emergencySuggestions.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => submit(s)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: theme.radii.xxl,
                borderWidth: 1,
                borderColor: `${theme.colors.border}B3`,
                backgroundColor: theme.colors.card,
                paddingVertical: 12,
                paddingHorizontal: 14,
                ...theme.shadows.shadowCard,
              }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 13.5, color: theme.colors.foreground }}>{s}</Text>
              <ArrowRight size={16} color={theme.colors.mutedForeground} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/* ANALYZING PHASE                                                    */
/* ────────────────────────────────────────────────────────────────── */

interface AnalyzingPhaseProps {
  text: string;
}

const AnalyzingPhase: React.FC<AnalyzingPhaseProps> = ({ text }) => {
  const steps = [
    'Understanding your description',
    'Assessing severity',
    'Locating nearest hospitals',
    'Checking ICU & bed availability',
    'Preparing first-aid guidance',
  ];

  const spinDeg = useSpin(2000);
  const glowScale = usePulse(1, 1.08, 700);

  // Reveal steps one by one across the same 1800ms window the parent
  // uses for this phase, so the checklist finishes exactly as the
  // screen transitions to "command".
  const [completedCount, setCompletedCount] = useState(0);
  useEffect(() => {
    setCompletedCount(0);
    const totalDuration = 1800;
    const perStep = totalDuration / steps.length;
    const timers = steps.map((_, i) =>
      setTimeout(() => setCompletedCount((c) => Math.max(c, i + 1)), Math.round(perStep * (i + 1))),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
      {/* Sparkles ring animation */}
      <Animated.View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: `${theme.colors.primary}26`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          transform: [{ scale: glowScale }],
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.shadowFloat,
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
            <Sparkles size={32} color={theme.colors.white} strokeWidth={1.5} />
          </Animated.View>
        </View>
      </Animated.View>

      <Text
        style={{
          fontSize: 13,
          fontWeight: 'bold',
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        AI analyzing
      </Text>

      <Text
        style={{
          fontSize: 15,
          fontStyle: 'italic',
          color: theme.colors.mutedForeground,
          textAlign: 'center',
          paddingHorizontal: 20,
          marginBottom: 32,
        }}
      >
        "{text}"
      </Text>

      <View style={{ width: '100%', maxWidth: 320, gap: 14 }}>
        {steps.map((s, i) => (
          <AnalyzingStepRow key={s} label={s} done={i < completedCount} active={i === completedCount} />
        ))}
      </View>
    </View>
  );
};

interface AnalyzingStepRowProps {
  label: string;
  done: boolean;
  active: boolean;
}

const AnalyzingStepRow: React.FC<AnalyzingStepRowProps> = ({ label, done, active }) => {
  const pop = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    if (done) {
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }).start();
    }
  }, [done, pop]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: done ? `${theme.colors.primary}1A` : theme.colors.muted,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {done ? (
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            <Check size={14} color={theme.colors.primary} strokeWidth={2.5} />
          </Animated.View>
        ) : active ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.mutedForeground,
            }}
          />
        )}
      </View>
      <Text
        style={{
          fontSize: 13.5,
          color: done || active ? theme.colors.foreground : theme.colors.mutedForeground,
          fontWeight: active ? '600' : '400',
          flex: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/* OFFLINE COMMAND PHASE                                              */
/* ────────────────────────────────────────────────────────────────── */

interface OfflineCommandPhaseProps {
  selectedHospitalId: string | null;
  cache: EmergencyCache | null;
  topInset: number;
  bottomInset: number;
}

const OfflineCommandPhase: React.FC<OfflineCommandPhaseProps> = ({
  selectedHospitalId,
  cache,
  topInset,
  bottomInset,
}) => {
  const sortedHospitals = useMemo(() => sortHospitals(hospitals), []);
  const nearestHospital = sortedHospitals.find((h) => h.id === selectedHospitalId) ?? sortedHospitals[0];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: topInset + 8,
        paddingBottom: bottomInset + 12,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <FadeSlideIn>
        <View style={{ gap: 16 }}>
          {/* Back button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.card,
                justifyContent: 'center',
                alignItems: 'center',
                ...theme.shadows.shadowCard,
              }}
              activeOpacity={0.6}
            >
              <ArrowRight size={16} color={theme.colors.foreground} strokeWidth={2.4} />
            </TouchableOpacity>
            <View
              style={{
                borderRadius: 999,
                backgroundColor: theme.colors.muted,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color: theme.colors.mutedForeground,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Offline · Last known data
              </Text>
            </View>
          </View>

          {/* Offline info card */}
          <View
            style={{
              borderRadius: theme.radii.xxxl,
              borderWidth: 1,
              borderColor: `${theme.colors.border}B3`,
              backgroundColor: theme.colors.surfaceVariant,
              padding: 16,
              ...theme.shadows.shadowCard,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <Info size={16} color={theme.colors.mutedForeground} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: theme.colors.foreground,
                }}
              >
                You're offline
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12.5,
                color: theme.colors.mutedForeground,
                lineHeight: 18,
              }}
            >
              AI triage, hospital booking, and donor requests need a connection. Meanwhile, here's what's
              saved locally for {nearestHospital.name} — reachable right now without the internet.
            </Text>
          </View>

          <SectionTitle title="Emergency resources" hint="Available offline" />

          {cache ? (
            <OfflineResources cache={cache} />
          ) : (
            <Text style={{ fontSize: 12, color: theme.colors.mutedForeground, paddingHorizontal: 4 }}>
              Connect once to synchronize emergency resources.
            </Text>
          )}

          <CallButton label={`Call ${nearestHospital.name}`} phone={nearestHospital.phone} tone="emergency" />
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
};

interface OfflineResourcesProps {
  cache: EmergencyCache;
}

const OfflineResources: React.FC<OfflineResourcesProps> = ({ cache }) => {
  return (
    <View style={{ gap: 12 }}>
      {/* Hospitals */}
      {cache.hospitals.length > 0 && (
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.colors.foreground,
            }}
          >
            Nearby hospitals ({cache.hospitals.length})
          </Text>
          {cache.hospitals.map((h) => (
            <View
              key={h.id}
              style={{
                borderRadius: theme.radii.xxl,
                backgroundColor: theme.colors.surfaceVariant,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 13.5, fontWeight: 'bold', color: theme.colors.foreground }}>
                  {h.name}
                </Text>
                <View
                  style={{
                    borderRadius: 999,
                    backgroundColor: `${theme.colors.primary}1A`,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: theme.colors.primary,
                    }}
                  >
                    Tier {h.tier}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground, marginBottom: 6 }}>
                {h.address}
              </Text>
              <Text style={{ fontSize: 11, color: theme.colors.mutedForeground, marginBottom: 10 }}>
                {h.services.slice(0, 3).join(' · ')}
              </Text>
              <CallButton label={`Call · ${h.phone}`} phone={h.phone} />
            </View>
          ))}
        </View>
      )}

      {/* Emergency hotlines */}
      {cache.hospitals.length > 0 && (
        <View>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              marginBottom: 8,
              color: theme.colors.foreground,
            }}
          >
            Emergency hotlines
          </Text>
          <View
            style={{
              borderRadius: theme.radii.xxl,
              backgroundColor: theme.colors.surfaceVariant,
              overflow: 'hidden',
            }}
          >
            {[
              { label: 'National Emergency', number: '999' },
              { label: 'Ambulance Service', number: '+880 1712-334455' },
            ].map((h, i) => (
              <TouchableOpacity
                key={h.number}
                onPress={() => Linking.openURL(`tel:${h.number}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderBottomWidth: i === 0 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}
                activeOpacity={0.6}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: theme.colors.foreground,
                      marginBottom: 2,
                    }}
                  >
                    {h.label}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>{h.number}</Text>
                </View>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.emergency,
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...theme.shadows.shadowFloat,
                  }}
                >
                  <PhoneCall size={16} color={theme.colors.white} strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/* COMMAND PHASE                                                      */
/* ────────────────────────────────────────────────────────────────── */

interface CommandPhaseProps {
  text: string;
  reserved: any;
  setReserved: (r: any) => void;
  selectedHospitalId: string | null;
  setSelectedHospitalId: (id: string | null) => void;
  showMoreHospitals: boolean;
  setShowMoreHospitals: (v: boolean) => void;
  bloodRequired: boolean | null;
  setBloodRequired: (v: boolean | null) => void;
  assessingBlood: boolean;
  setAssessingBlood: (v: boolean) => void;
  pendingDonor: RankedDonor | null;
  setPendingDonor: (d: RankedDonor | null) => void;
  sentTo: string[];
  setSentTo: (ids: string[]) => void;
  endSOS: (s: SosSummary) => void;
}

const CommandPhase: React.FC<CommandPhaseProps> = ({
  text,
  reserved,
  setReserved,
  selectedHospitalId,
  setSelectedHospitalId,
  showMoreHospitals,
  setShowMoreHospitals,
  bloodRequired,
  setBloodRequired,
  assessingBlood,
  setAssessingBlood,
  pendingDonor,
  setPendingDonor,
  sentTo,
  setSentTo,
  endSOS,
}) => {
  const sortedHospitals = useMemo(() => sortHospitals(hospitals), []);
  const primary = sortedHospitals.find((h) => h.id === selectedHospitalId) ?? sortedHospitals[0];
  const hospitalSelected = selectedHospitalId !== null;
  const requiredGroup: BloodGroup = 'O+';
  const matchedDonors = hospitalSelected && bloodRequired ? matchDonors(requiredGroup, primary.id, { limit: 5 }) : [];
  const bookedAmbulance = ambulances.find((a) => a.id === reserved.ambulance);

  // Auto-assess blood when hospital selected
  useEffect(() => {
    if (hospitalSelected && bloodRequired === null) {
      setAssessingBlood(true);
      const timer = setTimeout(() => {
        setBloodRequired(true); // Simulate AI decision
        setAssessingBlood(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hospitalSelected, bloodRequired]);

  return (
    <View>
      {/* Hospital stats summary */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.radii.xxl,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
      >
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Truck size={14} color={theme.colors.mutedForeground} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.colors.foreground,
            }}
          >
            {primary.distanceKm} km
          </Text>
          <Text
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: theme.colors.mutedForeground,
            }}
          >
            Distance
          </Text>
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Activity size={14} color={theme.colors.mutedForeground} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.colors.foreground,
            }}
          >
            {primary.etaMin} min
          </Text>
          <Text
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: theme.colors.mutedForeground,
            }}
          >
            Hospital ETA
          </Text>
        </View>
      </View>

      {/* Hospital selection */}
      <SectionTitle title="Nearby hospitals" hint="Select admission first" />

      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          padding: 16,
          marginBottom: 20,
          ...theme.shadows.shadowCard,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: theme.colors.foreground,
                }}
              >
                {primary.name}
              </Text>
              {primary.tier === 'A' && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                    borderRadius: 999,
                    backgroundColor: `${theme.colors.primary}1A`,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Star size={10} color={theme.colors.primary} fill={theme.colors.primary} />
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: theme.colors.primary,
                    }}
                  >
                    PREFERRED
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.mutedForeground,
              }}
            >
              {primary.address} · {primary.distanceKm} km
            </Text>
          </View>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: `${theme.colors.success}1A`,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: 'bold',
                color: theme.colors.success,
              }}
            >
              Ready
            </Text>
          </View>
        </View>

        {/* Mini stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 12,
            gap: 8,
          }}
        >
          <MiniStat label="Beds" value={primary.beds.available} icon={BedDouble} />
          <MiniStat label="ICU" value={primary.icu.available} icon={Activity} tone="emergency" />
          <MiniStat label="Blood O-" value="✓" icon={Droplet} tone="info" />
        </View>

        {/* Action buttons */}
        <View style={{ gap: 8 }}>
          <ActionButton
            active={hospitalSelected}
            onClick={() => {
              setSelectedHospitalId(primary.id);
              setBloodRequired(null);
            }}
            label={hospitalSelected ? 'Hospital selected' : 'Select this hospital'}
            icon={Check}
          />
          <ActionButton
            active={reserved.bed}
            onClick={() => setReserved({ ...reserved, bed: !reserved.bed })}
            label={reserved.bed ? 'Bed reserved' : 'Reserve emergency bed'}
            icon={BedDouble}
          />
          <ActionButton
            active={reserved.icu}
            onClick={() => setReserved({ ...reserved, icu: !reserved.icu })}
            label={reserved.icu ? 'ICU reserved' : 'Reserve ICU bed'}
            icon={Activity}
            tone="emergency"
          />
        </View>

        <CallButton label={`Call hospital · ${primary.phone}`} phone={primary.phone} style={{ marginTop: 10 }} />
      </View>

      {/* Show more hospitals toggle */}
      <TouchableOpacity
        onPress={() => setShowMoreHospitals(!showMoreHospitals)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          borderWidth: 1,
          borderColor: `${theme.colors.primary}4D`,
          paddingVertical: 12,
          marginBottom: 20,
        }}
        activeOpacity={0.6}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: theme.colors.primary,
          }}
        >
          {showMoreHospitals ? 'Hide other hospitals' : 'Show all nearby hospitals'}
        </Text>
      </TouchableOpacity>

      {/* More hospitals list */}
      {showMoreHospitals && (
        <FadeSlideIn style={{ marginBottom: 20 }}>
          <View style={{ gap: 8 }}>
            {sortedHospitals.map((h) => (
              <HospitalListItem
                key={h.id}
                hospital={h}
                selected={h.id === selectedHospitalId}
                onSelect={() => {
                  setSelectedHospitalId(h.id);
                  setBloodRequired(null);
                  setReserved({ bed: false, icu: false, ambulance: reserved.ambulance });
                }}
              />
            ))}
          </View>
        </FadeSlideIn>
      )}

      {/* Blood assessment */}
      {hospitalSelected && (
        <>
          <SectionTitle title="Blood assessment" hint="AI-assessed" />

          {assessingBlood && <AssessingBloodCard hospitalName={primary.name} />}

          {!assessingBlood && bloodRequired === false && (
            <FadeSlideIn>
              <View
                style={{
                  borderRadius: theme.radii.xxl,
                  backgroundColor: `${theme.colors.success}1A`,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: 'bold',
                    color: theme.colors.success,
                  }}
                >
                  AI assessment: no donor outreach needed for this admission.
                </Text>
              </View>
            </FadeSlideIn>
          )}

          {bloodRequired && !assessingBlood && (
            <FadeSlideIn>
              <View>
                <SectionTitle title="Compatible donors" hint="Ranked from selected hospital" />
                <View
                  style={{
                    borderRadius: theme.radii.xxl,
                    borderWidth: 1,
                    borderColor: `${theme.colors.border}B3`,
                    backgroundColor: theme.colors.card,
                    padding: 12,
                    marginBottom: 12,
                    ...theme.shadows.shadowCard,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: `${theme.colors.emergency}1A`,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Droplet size={14} color={theme.colors.emergency} fill={theme.colors.emergency} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: theme.colors.foreground,
                        }}
                      >
                        O+ Blood needed
                      </Text>
                    </View>
                    <View
                      style={{
                        borderRadius: 999,
                        backgroundColor: `${theme.colors.emergency}1A`,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: theme.colors.emergency,
                        }}
                      >
                        2 units
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: theme.colors.mutedForeground,
                    }}
                  >
                    From: {primary.name}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: theme.colors.mutedForeground,
                    marginBottom: 12,
                    paddingHorizontal: 4,
                  }}
                >
                  Nearby eligible donors · {matchedDonors.length} found
                </Text>

                <View style={{ gap: 10, marginBottom: 20 }}>
                  {matchedDonors.map((d) => (
                    <DonorCard
                      key={d.id}
                      donor={d}
                      requested={sentTo.includes(d.id)}
                      onRequest={() => setPendingDonor(d)}
                    />
                  ))}
                </View>
              </View>
            </FadeSlideIn>
          )}
        </>
      )}

      {/* Ambulance section */}
      <SectionTitle
        title={reserved.ambulance ? 'Your ambulance' : 'Nearest ambulance'}
        hint={reserved.ambulance ? 'Request accepted' : `${ambulances.length} units nearby`}
      />

      <View style={{ marginBottom: 20, gap: 10 }}>
        {(reserved.ambulance ? ambulances.filter((a) => a.id === reserved.ambulance) : ambulances.slice(0, 2)).map(
          (a) => (
            <AmbulanceCard
              key={a.id}
              ambulance={a}
              booked={reserved.ambulance === a.id}
              onRequest={() => setReserved({ ...reserved, ambulance: a.id })}
              onCancel={() => setReserved({ ...reserved, ambulance: undefined })}
            />
          ),
        )}
      </View>

      {/* End SOS */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: `${theme.colors.border}99`,
          paddingTop: 16,
          marginBottom: 20,
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderRadius: theme.radii.xxl,
            borderWidth: 1,
            borderColor: `${theme.colors.border}B3`,
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 10,
          }}
        >
          <Info size={16} color={theme.colors.mutedForeground} style={{ marginTop: 2 }} />
          <Text
            style={{
              fontSize: 11.5,
              color: theme.colors.mutedForeground,
              flex: 1,
              lineHeight: 16,
            }}
          >
            A coordination fee of{' '}
            <Text style={{ fontWeight: 'bold', color: theme.colors.foreground }}>
              BDT {SOS_COORDINATION_FEE_BDT.toLocaleString()}
            </Text>{' '}
            will be added to the hospital bill once this SOS is marked complete.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            endSOS({
              hospitalName: primary.name,
              bedReserved: !!reserved.bed,
              icuReserved: !!reserved.icu,
              ambulance: bookedAmbulance ? { callSign: bookedAmbulance.callSign } : undefined,
              donorsContacted: sentTo.length,
            })
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${theme.colors.emergency}66`,
            paddingVertical: 14,
          }}
          activeOpacity={0.6}
        >
          <CheckCircle2 size={16} color={theme.colors.emergency} strokeWidth={2} />
          <Text
            style={{
              fontSize: 13.5,
              fontWeight: 'bold',
              color: theme.colors.emergency,
            }}
          >
            End SOS
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AssessingBloodCard: React.FC<{ hospitalName: string }> = ({ hospitalName }) => {
  const spinDeg = useSpin(1400);
  return (
    <FadeSlideIn>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 20,
          gap: 10,
          ...theme.shadows.shadowCard,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${theme.colors.primary}1A`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
            <Sparkles size={16} color={theme.colors.primary} />
          </Animated.View>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.colors.foreground,
              marginBottom: 2,
            }}
          >
            AI assessing blood requirement…
          </Text>
          <Text
            style={{
              fontSize: 11.5,
              color: theme.colors.mutedForeground,
            }}
          >
            Checking case severity against {hospitalName}'s blood bank
          </Text>
        </View>
      </View>
    </FadeSlideIn>
  );
};

interface HospitalListItemProps {
  hospital: Hospital;
  selected: boolean;
  onSelect: () => void;
}

const HospitalListItem: React.FC<HospitalListItemProps> = ({ hospital: h, selected, onSelect }) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: theme.radii.xxl,
        borderWidth: 1,
        borderColor: selected ? `${theme.colors.primary}7F` : `${theme.colors.border}B3`,
        backgroundColor: selected ? `${theme.colors.primary}66` : theme.colors.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
        ...theme.shadows.shadowCard,
      }}
      activeOpacity={0.6}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Text
            style={{
              fontSize: 13.5,
              fontWeight: 'bold',
              color: theme.colors.foreground,
            }}
            numberOfLines={1}
          >
            {h.name}
          </Text>
          {h.tier === 'A' && (
            <View
              style={{
                borderRadius: 999,
                backgroundColor: `${theme.colors.primary}1A`,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: theme.colors.primary,
                }}
              >
                PREFERRED
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            fontSize: 11.5,
            color: theme.colors.mutedForeground,
          }}
          numberOfLines={1}
        >
          {h.address} · {h.distanceKm} km · ETA {h.etaMin} min
        </Text>
      </View>

      <TouchableOpacity
        style={{
          borderRadius: 999,
          borderWidth: 1,
          borderColor: `${theme.colors.primary}4D`,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginLeft: 10,
        }}
        onPress={onSelect}
        activeOpacity={0.6}
      >
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: 'bold',
            color: theme.colors.primary,
          }}
        >
          {selected ? 'Selected' : 'Select'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

interface MiniStatProps {
  label: string;
  value: any;
  icon: any;
  tone?: 'primary' | 'emergency' | 'info';
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value, icon: Icon, tone = 'primary' }) => {
  const toneBg =
    tone === 'emergency'
      ? `${theme.colors.emergency}1A`
      : tone === 'info'
        ? `${theme.colors.info}1A`
        : `${theme.colors.primary}1A`;
  const toneColor =
    tone === 'emergency' ? theme.colors.emergency : tone === 'info' ? theme.colors.info : theme.colors.primary;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRadius: theme.radii.xxl,
        backgroundColor: theme.colors.surfaceVariant,
        paddingVertical: 10,
        gap: 4,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: toneBg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon size={14} color={toneColor} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.colors.foreground,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: theme.colors.mutedForeground,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

interface ActionButtonProps {
  label: string;
  icon: any;
  onClick: () => void;
  active: boolean;
  tone?: 'primary' | 'emergency';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon: Icon, onClick, active, tone = 'primary' }) => {
  const isEmergency = tone === 'emergency';
  // Quick scale "tap" feedback + a one-shot pop when it flips to active,
  // so confirming a reservation feels like it actually registered.
  const pressScale = useRef(new Animated.Value(1)).current;
  const activePop = useRef(new Animated.Value(active ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.spring(activePop, { toValue: active ? 1 : 0.85, friction: 6, tension: 160, useNativeDriver: true }).start();
  }, [active, activePop]);

  const onPressIn = () =>
    Animated.timing(pressScale, { toValue: 0.97, duration: 90, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.timing(pressScale, { toValue: 1, duration: 120, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        onPress={onClick}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          paddingVertical: 10,
          backgroundColor: active ? theme.colors.success : 'transparent',
          borderWidth: active ? 0 : 1,
          borderColor: active ? 'transparent' : isEmergency ? `${theme.colors.emergency}4D` : `${theme.colors.primary}4D`,
        }}
        activeOpacity={0.85}
      >
        {active ? (
          <>
            <Animated.View style={{ transform: [{ scale: activePop }] }}>
              <Check size={16} color={theme.colors.white} strokeWidth={2.5} />
            </Animated.View>
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: 'bold',
                color: theme.colors.white,
              }}
            >
              {label}
            </Text>
          </>
        ) : (
          <>
            <Icon size={16} color={isEmergency ? theme.colors.emergency : theme.colors.primary} strokeWidth={2} />
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: 'bold',
                color: isEmergency ? theme.colors.emergency : theme.colors.primary,
              }}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ────────────────────────────────────────────────────────────────── */
/* SUMMARY PHASE                                                      */
/* ────────────────────────────────────────────────────────────────── */

interface SummaryPhaseProps {
  summary: SosSummary;
  onDone: () => void;
}

const SummaryPhase: React.FC<SummaryPhaseProps> = ({ summary, onDone }) => {
  // Checkmark springs in with a slight overshoot — the classic
  // "success" micro-interaction — instead of appearing instantly.
  const checkScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [checkScale]);

  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 40 }}>
      {/* Success checkmark */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${theme.colors.success}1A`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          ...theme.shadows.shadowCard,
        }}
      >
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <CheckCircle2 size={40} color={theme.colors.success} strokeWidth={1.5} />
        </Animated.View>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: theme.colors.foreground,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        SOS completed
      </Text>

      <Text
        style={{
          fontSize: 13.5,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
          marginBottom: 24,
          paddingHorizontal: 20,
          lineHeight: 18,
        }}
      >
        Emergency coordination has ended. Here's a summary of what was arranged for you.
      </Text>

      {/* Summary card */}
      <View
        style={{
          width: '100%',
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          padding: 16,
          marginBottom: 16,
          ...theme.shadows.shadowCard,
        }}
      >
        <SummaryRow label="Hospital" value={summary.hospitalName} icon={MapPin} />
        <SummaryRow label="Emergency bed" value={summary.bedReserved ? 'Reserved' : 'Not reserved'} icon={BedDouble} />
        <SummaryRow label="ICU bed" value={summary.icuReserved ? 'Reserved' : 'Not reserved'} icon={Activity} />
        <SummaryRow
          label="Ambulance"
          value={summary.ambulance ? `Dispatched · ${summary.ambulance.callSign}` : 'Not requested'}
          icon={Truck}
        />
        <SummaryRow label="Blood donors contacted" value={String(summary.donorsContacted)} icon={Droplet} last />
      </View>

      {/* Coordination fee */}
      <View
        style={{
          width: '100%',
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.emergency}33`,
          backgroundColor: `${theme.colors.emergency}0D`,
          padding: 16,
          marginBottom: 20,
          ...theme.shadows.shadowCard,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.colors.foreground,
            }}
          >
            Coordination fee
          </Text>
          <Text
            style={{
              fontSize: 19,
              fontWeight: 'bold',
              color: theme.colors.emergency,
            }}
          >
            BDT {SOS_COORDINATION_FEE_BDT.toLocaleString()}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 11.5,
            color: theme.colors.mutedForeground,
            lineHeight: 16,
          }}
        >
          This fee will be added to your bill at {summary.hospitalName}. No separate payment is needed right now.
        </Text>
      </View>

      {/* Done button */}
      <TouchableOpacity
        onPress={onDone}
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
          paddingVertical: 16,
          ...theme.shadows.shadowFloat,
        }}
        activeOpacity={0.8}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: theme.colors.primaryForeground,
          }}
        >
          Back to home
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface SummaryRowProps {
  label: string;
  value: string;
  icon: any;
  last?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, icon: Icon, last }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: `${theme.colors.border}99`,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon size={14} color={theme.colors.mutedForeground} strokeWidth={2} />
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.mutedForeground,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 12.5,
          fontWeight: 'bold',
          color: theme.colors.foreground,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
};