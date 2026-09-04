import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Easing,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Copy,
  Download,
  X,
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
  hospitals as mockHospitals,
  ambulances,
  emergencySuggestions,
  SOS_COORDINATION_FEE_BDT,
  type Hospital,
  type Ambulance,
} from './utils/data';
import {
  canDonateTo,
  eligibilityFrom,
  type BloodGroup,
  type RankedDonor,
} from './utils/blood';
import { useEmergencySync, type EmergencyCache } from './utils/offline-sync';
import { sortHospitals } from './utils/helpers';
import { getCurrentLocation } from '../../lib/location';
import { clearAuthSession } from '../../services/auth';
import {
  consultMedicalCondition,
  type AiMedicalResponse,
} from '../../services/ai-medical';
import { getHospitalById, getNearbyHospitals, type NearbyHospital } from '../../services/hospitals';
import { createReservation } from '../../services/reservations';
import { getPayments, getReservations } from '../../services/patient-records';
import { getBloodDonors, type BloodDonor } from '../../services/blood';

type Phase = 'input' | 'analyzing' | 'ambulance' | 'hospitals' | 'followup' | 'active' | 'summary';

type SosSummary = {
  hospitalName: string;
  bedReserved: boolean;
  icuReserved: boolean;
  ambulance?: { callSign: string };
  donorsContacted: number;
  severity: string;
  aiResponse: AiMedicalResponse;
  temporaryPassword?: string;
};

function toSosHospital(hospital: NearbyHospital): Hospital {
  const distanceKm = Number(hospital.distance_km);

  return {
    id: hospital.id,
    name: hospital.hospital_name,
    tier: 'C',
    distanceKm,
    etaMin: Math.max(1, Math.round(distanceKm * 4)),
    address: hospital.address || 'Address unavailable',
    rating: 0,
    phone: hospital.phone || '',
    departments: [],
    beds: { total: 0, available: 0 },
    icu: { total: 0, available: 0 },
    emergency: hospital.hospital_status.toUpperCase() === 'OPEN',
    bloodBank: [],
    coord: { x: 50, y: 50 },
  };
}

function toRankedDonor(donor: BloodDonor): RankedDonor {
  return {
    id: donor.donor_id,
    name: [donor.first_name, donor.last_name].filter(Boolean).join(' ') || 'MedLink donor',
    group: donor.blood_group,
    lastDonation: donor.last_donation_date,
    available: true,
    phone: donor.phone ?? '',
    distanceFromHospitalKm: {},
    donations: 0,
    distanceKm: donor.distance_km == null ? 99 : Number(donor.distance_km),
    eligibility: eligibilityFrom(donor.last_donation_date),
    status: 'online',
  };
}

async function findApiDonors(recipient: BloodGroup, limit = 5): Promise<RankedDonor[]> {
  const result = await getBloodDonors({ limit: 100 });
  return result.donors
    .filter((donor) => canDonateTo(donor.blood_group, recipient))
    .map(toRankedDonor)
    .slice(0, limit);
}

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
  const {
    phone: phoneParam,
    temporaryPassword: passwordParam,
    guest: guestParam,
    resume: resumeParam,
    eventText: eventTextParam,
    eventSeverity: eventSeverityParam,
    eventId: eventIdParam,
  } = useLocalSearchParams<{
    phone?: string | string[];
    temporaryPassword?: string | string[];
    guest?: string | string[];
    resume?: string | string[];
    eventText?: string | string[];
    eventSeverity?: string | string[];
    eventId?: string | string[];
  }>();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('');
  const [reserved, setReserved] = useState<{ bed?: boolean; icu?: boolean; ambulance?: string }>({});
  const [pendingDonor, setPendingDonor] = useState<RankedDonor | null>(null);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SosSummary | null>(null);
  const [aiResponse, setAiResponse] = useState<AiMedicalResponse | null>(null);
  const [medicalEventId, setMedicalEventId] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>('LOW');
  const [showMoreHospitals, setShowMoreHospitals] = useState(false);
  const [bloodRequired, setBloodRequired] = useState<boolean | null>(null);
  const [assessingBlood, setAssessingBlood] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);

  const { online, cache, justSynced } = useEmergencySync();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!medicalEventId || phase === 'summary') return;
    try {
      const checkpoint = {
        phase,
        text,
        reserved: {
          bed: Boolean(reserved.bed),
          icu: Boolean(reserved.icu),
          ambulance: typeof reserved.ambulance === 'string' ? reserved.ambulance : undefined,
        },
        pendingDonor: pendingDonor ? {
          id: pendingDonor.id,
          name: pendingDonor.name,
          group: pendingDonor.group,
          phone: pendingDonor.phone,
          distanceKm: pendingDonor.distanceKm,
          status: pendingDonor.status,
        } : null,
        sentTo: sentTo.filter((id): id is string => typeof id === 'string'),
        selectedHospitalId,
        bloodRequired,
        severity,
        aiResponse: aiResponse ? {
          id: aiResponse.id,
          medical_event_id: aiResponse.medical_event_id,
          summary: aiResponse.summary,
          possible_conditions: aiResponse.possible_conditions,
          tags: aiResponse.tags,
          first_aid: aiResponse.first_aid,
          created_at: aiResponse.created_at,
        } : null,
        hospitals: nearbyHospitals.map((hospital) => ({
          id: hospital.id,
          name: hospital.name,
          tier: hospital.tier,
          distanceKm: hospital.distanceKm,
          etaMin: hospital.etaMin,
          address: hospital.address,
          rating: hospital.rating,
          phone: hospital.phone,
          departments: [...hospital.departments],
          beds: { ...hospital.beds },
          icu: { ...hospital.icu },
          emergency: hospital.emergency,
          bloodBank: [...hospital.bloodBank],
          coord: { ...hospital.coord },
        })),
      };
      void AsyncStorage.setItem(`${SOS_CHECKPOINT_PREFIX}${medicalEventId}`, JSON.stringify(checkpoint)).catch(() => undefined);
    } catch {
      // Local checkpointing must never interrupt the emergency workflow.
    }
  }, [medicalEventId, phase, text, reserved, pendingDonor, sentTo, selectedHospitalId, bloodRequired, severity, aiResponse, nearbyHospitals]);

  const submit = async (val: string) => {
    setText(val);
    setRequestError('');
    setPhase('analyzing');

    try {
      let location: { latitude: number; longitude: number };
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          throw new Error('Location is not available in this browser. Please enable location access and try again.');
        }

        location = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
            () => reject(new Error('We could not detect your location. Please allow location access and try again.')),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        });
      } else {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) {
          throw new Error('Location permission was denied. Please enable location access and try again.');
        }

        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      }

      const hospitalsFromDb = await getNearbyHospitals(location.latitude, location.longitude, 100);
      if (hospitalsFromDb.length === 0) {
        throw new Error('No hospitals were found near your current location. Please try again from another location.');
      }

      setNearbyHospitals(hospitalsFromDb.map(toSosHospital));
      setSelectedHospitalId(null);

      const result = await consultMedicalCondition({
        userDescription: val,
        ...location,
        isEmergency: true,
      });

      setAiResponse(result.aiResponse);
      setMedicalEventId(result.event.id);
      setSeverity(result.event.severity ?? 'LOW');
      setPhase('ambulance');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to assess this emergency. Please try again.');
      setPhase('input');
    }
  };

  useEffect(() => {
    const shouldResume = Array.isArray(resumeParam) ? resumeParam[0] : resumeParam;
    const textFromParams = Array.isArray(eventTextParam) ? eventTextParam[0] : eventTextParam;
    const severityFromParams = Array.isArray(eventSeverityParam) ? eventSeverityParam[0] : eventSeverityParam;
    const eventFromParams = Array.isArray(eventIdParam) ? eventIdParam[0] : eventIdParam;

    if (shouldResume === '1' && textFromParams) {
      const restore = async () => {
        const stored = eventFromParams ? await AsyncStorage.getItem(`${SOS_CHECKPOINT_PREFIX}${eventFromParams}`) : null;
        if (stored) {
          try {
            const saved = JSON.parse(stored) as Partial<{ phase: Phase; text: string; reserved: { bed?: boolean; icu?: boolean; ambulance?: string }; pendingDonor: RankedDonor | null; sentTo: string[]; selectedHospitalId: string | null; bloodRequired: boolean | null; severity: string; aiResponse: AiMedicalResponse | null; hospitals: Hospital[] }>;
            setText(saved.text ?? textFromParams);
            setSeverity(saved.severity ?? severityFromParams ?? 'LOW');
            setMedicalEventId(eventFromParams ?? null);
            setReserved(saved.reserved ?? {});
            setPendingDonor(saved.pendingDonor ?? null);
            setSentTo(saved.sentTo ?? []);
            setSelectedHospitalId(saved.selectedHospitalId ?? null);
            setBloodRequired(saved.bloodRequired ?? null);
            setAiResponse(saved.aiResponse ?? null);
            setNearbyHospitals(saved.hospitals ?? []);
            setPhase(saved.phase && saved.phase !== 'summary' ? saved.phase : 'input');
            return;
          } catch {
            // Fall through to the basic event resume state.
          }
        }
        setText(textFromParams);
        setSeverity(severityFromParams || 'LOW');
        setMedicalEventId(eventFromParams ?? null);
        setPhase('input');
      };
      void restore();
    }
  }, [resumeParam, eventTextParam, eventSeverityParam, eventIdParam]);

  const endSOS = (s: SosSummary) => {
    setSummary(s);
    setPhase('summary');
  };

  const resetAndExit = () => {
    if (medicalEventId) void AsyncStorage.removeItem(`${SOS_CHECKPOINT_PREFIX}${medicalEventId}`);
    setPhase('input');
    setText('');
    setReserved({});
    setPendingDonor(null);
    setSentTo([]);
    setSummary(null);
    setAiResponse(null);
    setMedicalEventId(null);
    setNearbyHospitals([]);
    setSeverity('LOW');
    setRequestError('');
  };

  const finishSOS = async () => {
    const guest = Array.isArray(guestParam) ? guestParam[0] : guestParam;
    if (guest === '1') {
      await clearAuthSession();
      router.replace('/(auth)');
      return;
    }

    resetAndExit();
  };

  // Shared top inset so nothing ever sits under the status bar / notch,
  // on iOS and Android alike (edge-to-edge safe).
  const topInset = Math.max(insets.top, 12);
  const guestPhone = Array.isArray(phoneParam) ? phoneParam[0] : phoneParam;
  const temporaryPassword = Array.isArray(passwordParam) ? passwordParam[0] : passwordParam;

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
            <InputPhase text={text} setText={setText} submit={submit} error={requestError} />
          </FadeSlideIn>
        )}
        {phase === 'analyzing' && (
          <FadeSlideIn>
            <AnalyzingPhase text={text} />
          </FadeSlideIn>
        )}
        {phase === 'ambulance' && (
          <FadeSlideIn>
            <AmbulancePhase aiResponse={aiResponse} onContinue={() => setPhase('hospitals')} />
          </FadeSlideIn>
        )}
        {phase === 'hospitals' && (
          <FadeSlideIn>
            <HospitalSelectionPhase
              hospitals={nearbyHospitals}
              selectedHospitalId={selectedHospitalId}
              setSelectedHospitalId={setSelectedHospitalId}
              medicalEventId={medicalEventId}
              reserved={reserved}
              setReserved={setReserved}
              onContinue={() => setPhase('followup')}
            />
          </FadeSlideIn>
        )}
        {phase === 'followup' && aiResponse && (
          <FadeSlideIn>
            <ApprovalFollowupPhase
              eventId={medicalEventId}
              hospitalId={selectedHospitalId}
              hospitalName={nearbyHospitals.find((hospital) => hospital.id === selectedHospitalId)?.name ?? 'your hospital'}
              bloodRequired={bloodRequired}
              setBloodRequired={setBloodRequired}
              onContinue={(donor) => { setPendingDonor(donor ?? null); if (donor) setSentTo((current) => current.includes(donor.id) ? current : [...current, donor.id]); setPhase('active'); }}
              onRedirect={() => { setSelectedHospitalId(null); setReserved({}); setBloodRequired(null); setPendingDonor(null); setSentTo([]); setPhase('hospitals'); }}
            />
          </FadeSlideIn>
        )}
        {phase === 'active' && aiResponse && (
          <FadeSlideIn>
            <ActiveResponsePhase
              hospital={nearbyHospitals.find((hospital) => hospital.id === selectedHospitalId)}
              reserved={reserved}
              eventId={medicalEventId}
              selectedDonor={pendingDonor}
              bloodRequired={bloodRequired}
              onComplete={() => endSOS({ hospitalName: nearbyHospitals.find((hospital) => hospital.id === selectedHospitalId)?.name ?? 'Hospital', bedReserved: !!reserved.bed, icuReserved: !!reserved.icu, ambulance: reserved.ambulance ? { callSign: ambulances.find((ambulance) => ambulance.id === reserved.ambulance)?.callSign ?? reserved.ambulance } : undefined, donorsContacted: sentTo.length, severity, aiResponse, temporaryPassword })}
            />
          </FadeSlideIn>
        )}
        {phase === 'summary' && summary && (
          <FadeSlideIn>
            <SummaryPhase
              summary={summary}
              onDone={resetAndExit}
              guestPhone={guestPhone}
              temporaryPassword={temporaryPassword}
            />
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
  submit: (v: string) => void | Promise<void>;
  error: string;
}

const InputPhase: React.FC<InputPhaseProps> = ({ text, setText, submit, error }) => {
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

        {error && (
          <Text style={{ color: theme.colors.emergency, fontSize: 12, lineHeight: 17, marginBottom: 12 }}>
            {error}
          </Text>
        )}

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
  const sortedHospitals = useMemo(() => sortHospitals(mockHospitals), []);
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
            {[{ label: 'Ambulance Service', number: '+880 1712-334455' }].map((h, i) => (
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

interface AmbulancePhaseProps {
  aiResponse: AiMedicalResponse | null;
  onContinue: () => void;
}

const AmbulancePhase: React.FC<AmbulancePhaseProps> = ({ aiResponse, onContinue }) => {
  const nearest = ambulances.find((ambulance) => ambulance.status === 'available') ?? ambulances[0];
  return (
    <View style={{ gap: 16 }}>
      <StepHeader step="1 of 3" title="Immediate help" subtitle="Stay with the patient while help is arranged." />
      {aiResponse && (
        <View style={{ borderRadius: theme.radii.xxl, backgroundColor: `${theme.colors.primary}12`, padding: 16, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color={theme.colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.foreground }}>AI first-aid guidance</Text>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 19, color: theme.colors.foreground }}>{aiResponse.first_aid}</Text>
          <Text style={{ fontSize: 11.5, lineHeight: 16, color: theme.colors.mutedForeground }}>{aiResponse.summary}</Text>
        </View>
      )}
      <SectionTitle title="Nearest ambulance" hint="Call only" />
      <View style={{ borderRadius: theme.radii.xxxl, backgroundColor: theme.colors.card, padding: 16, gap: 10, ...theme.shadows.shadowCard }}>
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: theme.colors.foreground }}>{nearest.callSign}</Text>
        <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>{nearest.type} · {nearest.distanceKm} km away · ETA {nearest.etaMin} min</Text>
        <CallButton label={`Call ${nearest.phone}`} phone={nearest.phone} tone="emergency" />
      </View>
      <PrimaryStepButton label="Select a hospital" onPress={onContinue} />
    </View>
  );
};

const StepHeader: React.FC<{ step: string; title: string; subtitle: string }> = ({ step, title, subtitle }) => (
  <View style={{ gap: 5, marginBottom: 4 }}>
    <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>{step}</Text>
    <Text style={{ fontSize: 25, fontWeight: 'bold', color: theme.colors.foreground }}>{title}</Text>
    <Text style={{ fontSize: 13.5, lineHeight: 19, color: theme.colors.mutedForeground }}>{subtitle}</Text>
  </View>
);

const PrimaryStepButton: React.FC<{ label: string; onPress: () => void; disabled?: boolean }> = ({ label, onPress, disabled }) => (
  <TouchableOpacity disabled={disabled} onPress={onPress} style={{ borderRadius: 999, backgroundColor: theme.colors.primary, paddingVertical: 15, alignItems: 'center', opacity: disabled ? 0.45 : 1, ...theme.shadows.shadowFloat }} activeOpacity={0.8}>
    <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.primaryForeground }}>{label}</Text>
  </TouchableOpacity>
);

interface HospitalSelectionPhaseProps {
  hospitals: Hospital[];
  selectedHospitalId: string | null;
  setSelectedHospitalId: (id: string | null) => void;
  medicalEventId: string | null;
  reserved: { bed?: boolean; icu?: boolean };
  setReserved: (value: any) => void;
  onContinue: () => void;
}

const HospitalSelectionPhase: React.FC<HospitalSelectionPhaseProps> = ({ hospitals, selectedHospitalId, setSelectedHospitalId, medicalEventId, reserved, setReserved, onContinue }) => {
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getHospitalById>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState<'bed' | 'icu' | null>(null);
  const [error, setError] = useState('');
  const selected = hospitals.find((hospital) => hospital.id === selectedHospitalId);

  const selectHospital = async (hospital: Hospital) => {
    setSelectedHospitalId(hospital.id);
    setDetail(null);
    setLoading(true);
    setError('');
    try { setDetail(await getHospitalById(hospital.id)); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load bed availability.'); } finally { setLoading(false); }
  };

  const reserve = async (mode: 'bed' | 'icu') => {
    if (!detail || !medicalEventId || reserving || reserved[mode]) return;
    setReserving(mode); setError('');
    try {
      const wards = mode === 'icu' ? detail.wards.filter((ward) => ward.ward_name.toLowerCase().includes('icu')) : detail.wards.filter((ward) => !ward.ward_name.toLowerCase().includes('icu'));
      const ward = wards.find((candidate) => candidate.available_beds > 0);
      const bed = ward && detail.beds.find((candidate) => candidate.ward_id === ward.id && candidate.bed_status === 'AVAILABLE');
      if (!ward || !bed) throw new Error(`No available ${mode === 'icu' ? 'ICU' : 'ward'} bed was found.`);
      await createReservation({ medicalEventId, hospitalId: detail.id, wardId: ward.id, bedId: bed.id, reservationMode: mode === 'icu' ? 'ICU' : 'EMERGENCY' });
      setReserved({ ...reserved, [mode]: true });
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to reserve this bed.'); } finally { setReserving(null); }
  };

  return (
    <View style={{ gap: 12 }}>
      <StepHeader step="2 of 3" title="Choose a hospital" subtitle="Compare live capacity, then reserve the right care area." />
      {hospitals.map((hospital) => <HospitalListItem key={hospital.id} hospital={hospital} selected={hospital.id === selectedHospitalId} onSelect={() => void selectHospital(hospital)} />)}
      {selected && <View style={{ borderRadius: theme.radii.xxl, backgroundColor: theme.colors.card, padding: 16, gap: 10, ...theme.shadows.shadowCard }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.foreground }}>{selected.name} capacity</Text>
        {loading ? <ActivityIndicator color={theme.colors.primary} /> : detail && <>
          {detail.wards.map((ward) => <View key={ward.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: `${theme.colors.border}66`, paddingVertical: 9 }}><Text style={{ fontSize: 12.5, color: theme.colors.foreground }}>{ward.ward_name}</Text><Text style={{ fontSize: 12.5, fontWeight: 'bold', color: ward.available_beds ? theme.colors.success : theme.colors.emergency }}>{ward.available_beds} available</Text></View>)}
          <ActionButton label={reserving === 'bed' ? 'Reserving ward bed...' : reserved.bed ? 'Ward bed reserved' : 'Reserve ward bed'} icon={BedDouble} active={!!reserved.bed} onClick={() => void reserve('bed')} />
          <ActionButton label={reserving === 'icu' ? 'Reserving ICU bed...' : reserved.icu ? 'ICU bed reserved' : 'Reserve ICU bed'} icon={Activity} tone="emergency" active={!!reserved.icu} onClick={() => void reserve('icu')} />
        </>}
        {!!error && <Text style={{ fontSize: 12, lineHeight: 17, color: theme.colors.emergency }}>{error}</Text>}
      </View>}
      <PrimaryStepButton label="Continue to hospital response" disabled={!selectedHospitalId || (!reserved.bed && !reserved.icu)} onPress={onContinue} />
    </View>
  );
};

interface ApprovalFollowupPhaseProps { eventId: string | null; hospitalId: string | null; hospitalName: string; bloodRequired: boolean | null; setBloodRequired: (value: boolean | null) => void; onContinue: (donor?: RankedDonor) => void; onRedirect: () => void; }

const ApprovalFollowupPhase: React.FC<ApprovalFollowupPhaseProps> = ({ eventId, hospitalId, hospitalName, bloodRequired, setBloodRequired, onContinue, onRedirect }) => {
  const [approved, setApproved] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<RankedDonor | null>(null);
  const [donors, setDonors] = useState<RankedDonor[]>([]);
  const [statusNotice, setStatusNotice] = useState<'accepted' | 'redirected' | null>(null);
  const noticeShown = useRef(false);
  useEffect(() => {
    let active = true;
    const check = async () => { if (!eventId || noticeShown.current) return; try { const reservations = await getReservations(); const match = reservations.find((reservation) => reservation.medical_event_id === eventId); if (!active) return; const status = match?.reservation_status.toUpperCase(); if (status === 'CANCELLED' || status === 'REJECTED') { noticeShown.current = true; setStatusNotice('redirected'); return; } if (status === 'APPROVED') { setApproved((wasApproved) => { if (!wasApproved) { noticeShown.current = true; setStatusNotice('accepted'); } return true; }); } } catch { /* polling retries on the next interval */ } };
    void check(); const timer = setInterval(() => void check(), 5000); return () => { active = false; clearInterval(timer); };
  }, [eventId, hospitalName, onRedirect]);
  useEffect(() => {
    if (!approved || !bloodRequired) { setDonors([]); return; }
    void findApiDonors('O+').then(setDonors).catch(() => setDonors([]));
  }, [approved, bloodRequired]);
  return <View style={{ gap: 14 }}>
    <StepHeader step="3 of 3" title={approved ? 'Hospital accepted' : 'Waiting for hospital'} subtitle={approved ? `${hospitalName} has approved your request.` : `Your request is pending with ${hospitalName}. This screen checks for approval automatically.`} />
    {!approved && <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={{ fontSize: 13, color: theme.colors.mutedForeground }}>Waiting for a response...</Text></View>}
    {bloodRequired === null && (
  <>
    <Text
      style={{
        fontSize: 13,
        color: theme.colors.foreground,
        textAlign: "center",
      }}
    >
      Does the hospital need blood donors for this admission?
    </Text>

    <View
      style={{
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <PrimaryStepButton
          label="Yes"
          onPress={() => setBloodRequired(true)}
        />
      </View>

      <TouchableOpacity
        onPress={() => setBloodRequired(false)}
        style={{
          flex: 1,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: theme.colors.foreground,
          }}
        >
          No
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}

<PrimaryStepButton
  label={
    bloodRequired === true
      ? "Continue with selected donor"
      : "Continue"
  }
  disabled={bloodRequired === true && !selectedDonor}
  onPress={onContinue}
/>
    <SosStatusModal
      visible={statusNotice !== null}
      type={statusNotice ?? 'accepted'}
      hospitalName={hospitalName}
      onClose={() => {
        const notice = statusNotice;
        setStatusNotice(null);
        if (notice === 'redirected') onRedirect();
      }}
    />
  </View>;
};

const SosStatusModal: React.FC<{
  visible: boolean;
  type: 'accepted' | 'redirected';
  hospitalName: string;
  onClose: () => void;
}> = ({ visible, type, hospitalName, onClose }) => {
  const redirected = type === 'redirected';
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(23, 37, 47, 0.52)' }}>
      <View style={{ borderRadius: theme.radii.xxxl, backgroundColor: theme.colors.surface, padding: 24, ...theme.shadows.shadowDialog }}>
        <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: redirected ? theme.colors.emergencyLight : theme.colors.successLight }}>
          {redirected ? <X size={28} color={theme.colors.emergency} strokeWidth={2.3} /> : <CheckCircle2 size={29} color={theme.colors.success} strokeWidth={2.1} />}
        </View>
        <Text style={{ marginTop: 18, color: theme.colors.foreground, fontSize: 21, lineHeight: 27, fontWeight: 'bold', textAlign: 'center' }}>
          {redirected ? 'Choose another hospital' : 'Hospital accepted your SOS'}
        </Text>
        <Text style={{ marginTop: 9, color: theme.colors.mutedForeground, fontSize: 13.5, lineHeight: 20, textAlign: 'center' }}>
          {redirected ? `${hospitalName} cannot receive this emergency right now. Your SOS is still active, so please select another hospital to continue care.` : `${hospitalName} accepted your emergency request. Your reservation is confirmed and the next step is to arrange any donor support.`}
        </Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.82} style={{ marginTop: 22, borderRadius: theme.radii.pill, backgroundColor: redirected ? theme.colors.emergency : theme.colors.primary, paddingVertical: 14, alignItems: 'center', ...theme.shadows.shadowFloat }}>
          <Text style={{ color: theme.colors.primaryForeground, fontSize: 14, fontWeight: 'bold' }}>{redirected ? 'View hospital list' : 'Continue SOS'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>;
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
  aiResponse: AiMedicalResponse | null;
  medicalEventId: string | null;
  severity: string;
  hospitals: Hospital[];
  temporaryPassword?: string;
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
  aiResponse,
  medicalEventId,
  severity,
  hospitals,
  temporaryPassword,
}) => {
  const sortedHospitals = useMemo(
    () => [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm),
    [hospitals],
  );
  const primary = sortedHospitals.find((h) => h.id === selectedHospitalId) ?? sortedHospitals[0];
  const hospitalSelected = selectedHospitalId !== null;
  const requiredGroup: BloodGroup = 'O+';
  const [matchedDonors, setMatchedDonors] = useState<RankedDonor[]>([]);
  const bookedAmbulance = ambulances.find((a) => a.id === reserved.ambulance);
  const [reservationError, setReservationError] = useState('');
  const [reserving, setReserving] = useState<'bed' | 'icu' | null>(null);

  useEffect(() => {
    if (!hospitalSelected || !bloodRequired) { setMatchedDonors([]); return; }
    void findApiDonors(requiredGroup).then(setMatchedDonors).catch(() => setMatchedDonors([]));
  }, [hospitalSelected, bloodRequired, requiredGroup]);

  const reserveBed = async (mode: 'bed' | 'icu') => {
    if (!medicalEventId || !primary?.id || reserving || reserved[mode]) return;

    setReservationError('');
    setReserving(mode);
    try {
      const hospital = await getHospitalById(primary.id);
      const wards = mode === 'icu'
        ? hospital.wards.filter((ward) => ward.ward_name.toLowerCase().includes('icu'))
        : hospital.wards.filter((ward) => !ward.ward_name.toLowerCase().includes('icu'));
      const ward = wards.find((candidate) => candidate.available_beds > 0);
      if (!ward) throw new Error(`No available ${mode === 'icu' ? 'ICU' : 'emergency'} ward was found at this hospital.`);

      const bed = hospital.beds.find((candidate) => candidate.ward_id === ward.id && candidate.bed_status === 'AVAILABLE');
      if (!bed) throw new Error(`No available ${mode === 'icu' ? 'ICU' : 'emergency'} bed was found at this hospital.`);

      await createReservation({
        medicalEventId,
        hospitalId: primary.id,
        wardId: ward.id,
        bedId: bed.id,
        reservationMode: mode === 'icu' ? 'ICU' : 'EMERGENCY',
      });
      setReserved({ ...reserved, [mode]: true });
    } catch (error) {
      setReservationError(error instanceof Error ? error.message : 'Unable to reserve this bed right now.');
    } finally {
      setReserving(null);
    }
  };

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
          borderWidth: hospitalSelected ? 2 : 1,
          borderColor: hospitalSelected ? theme.colors.primaryDark : `${theme.colors.border}B3`,
          backgroundColor: hospitalSelected ? theme.colors.primary : theme.colors.card,
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
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: hospitalSelected ? '#FFFFFF' : theme.colors.foreground,
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
                    backgroundColor: hospitalSelected ? 'rgba(255,255,255,0.25)' : `${theme.colors.primary}1A`,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Star
                    size={10}
                    color={hospitalSelected ? '#FFFFFF' : theme.colors.primary}
                    fill={hospitalSelected ? '#FFFFFF' : theme.colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: 'bold',
                      color: hospitalSelected ? '#FFFFFF' : theme.colors.primary,
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
                color: hospitalSelected ? 'rgba(255,255,255,0.85)' : theme.colors.mutedForeground,
              }}
            >
              {primary.address} · {primary.distanceKm} km
            </Text>
          </View>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: hospitalSelected ? 'rgba(255,255,255,0.25)' : `${theme.colors.success}1A`,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: 'bold',
                color: hospitalSelected ? '#FFFFFF' : theme.colors.success,
              }}
            >
              {hospitalSelected ? 'Selected ✓' : 'Ready'}
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
          <MiniStat label="Beds" value={primary.beds.available} icon={BedDouble} selected={hospitalSelected} />
          <MiniStat label="ICU" value={primary.icu.available} icon={Activity} tone="emergency" selected={hospitalSelected} />
          <MiniStat label="Blood O-" value="✓" icon={Droplet} tone="info" selected={hospitalSelected} />
        </View>

        {/* Action buttons */}
        <View style={{ gap: 8 }}>
          <ActionButton
            active={hospitalSelected}
            onClick={() => {
              setSelectedHospitalId(primary.id);
              setBloodRequired(null);
            }}
            label={hospitalSelected ? 'Hospital selected ✓' : 'Select this hospital'}
            icon={Check}
          />
          <ActionButton
            active={reserved.bed}
            onClick={() => reserveBed('bed')}
            label={reserving === 'bed' ? 'Reserving bed...' : reserved.bed ? 'Bed reserved' : 'Reserve emergency bed'}
            icon={BedDouble}
          />
          <ActionButton
            active={reserved.icu}
            onClick={() => reserveBed('icu')}
            label={reserving === 'icu' ? 'Reserving ICU bed...' : reserved.icu ? 'ICU reserved' : 'Reserve ICU bed'}
            icon={Activity}
            tone="emergency"
          />
        </View>
        {!!reservationError && <Text style={{ marginTop: 8, color: theme.colors.emergency, fontSize: 12 }}>{reservationError}</Text>}

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
            aiResponse && endSOS({
              hospitalName: primary.name,
              bedReserved: !!reserved.bed,
              icuReserved: !!reserved.icu,
              ambulance: bookedAmbulance ? { callSign: bookedAmbulance.callSign } : undefined,
              donorsContacted: sentTo.length,
              severity,
              aiResponse,
              temporaryPassword,
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
    <Pressable
      onPress={onSelect}
      android_ripple={{
        color: selected ? "rgba(255, 255, 255, 0.2)" : "rgba(22, 168, 156, 0.12)",
        borderless: false,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${h.name}, ${h.address}, ${h.distanceKm} km, ETA ${h.etaMin} minutes. ${selected ? "Currently selected" : "Tap to select"}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: theme.radii.xxl,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? theme.colors.primaryDark : `${theme.colors.border}B3`,
        backgroundColor: selected ? theme.colors.primary : theme.colors.card,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...theme.shadows.shadowCard,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 14.5,
              fontWeight: 'bold',
              color: selected ? '#FFFFFF' : theme.colors.foreground,
            }}
            numberOfLines={1}
          >
            {h.name}
          </Text>
          {h.tier === 'A' && (
            <View
              style={{
                borderRadius: 999,
                backgroundColor: selected ? 'rgba(255,255,255,0.25)' : `${theme.colors.primary}1A`,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: selected ? '#FFFFFF' : theme.colors.primary,
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
            color: selected ? 'rgba(255, 255, 255, 0.85)' : theme.colors.mutedForeground,
          }}
          numberOfLines={1}
        >
          {h.address} · {h.distanceKm} km · ETA {h.etaMin} min
        </Text>
      </View>

      <View
        style={{
          borderRadius: 999,
          backgroundColor: selected ? '#FFFFFF' : 'transparent',
          borderWidth: 1,
          borderColor: selected ? '#FFFFFF' : `${theme.colors.primary}66`,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginLeft: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11.5,
            fontWeight: 'bold',
            color: selected ? theme.colors.primaryDark : theme.colors.primary,
          }}
        >
          {selected ? '✓ Selected' : 'Select'}
        </Text>
      </View>
    </Pressable>
  );
};

interface MiniStatProps {
  label: string;
  value: any;
  icon: any;
  tone?: 'primary' | 'emergency' | 'info';
  selected?: boolean;
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value, icon: Icon, tone = 'primary', selected = false }) => {
  const toneBg = selected
    ? 'rgba(255, 255, 255, 0.2)'
    : tone === 'emergency'
      ? `${theme.colors.emergency}1A`
      : tone === 'info'
        ? `${theme.colors.info}1A`
        : `${theme.colors.primary}1A`;

  const toneColor = selected
    ? '#FFFFFF'
    : tone === 'emergency' ? theme.colors.emergency : tone === 'info' ? theme.colors.info : theme.colors.primary;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRadius: theme.radii.xxl,
        backgroundColor: selected ? 'rgba(255, 255, 255, 0.15)' : theme.colors.surfaceVariant,
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
          color: selected ? '#FFFFFF' : theme.colors.foreground,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: selected ? 'rgba(255, 255, 255, 0.85)' : theme.colors.mutedForeground,
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
  guestPhone?: string;
  temporaryPassword?: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; fg: string }> = {
  CRITICAL: { bg: theme.colors.emergencyLight, fg: theme.colors.emergency },
  HIGH: { bg: theme.colors.emergencyLight, fg: theme.colors.emergency },
  MODERATE: { bg: `${theme.colors.warning ?? theme.colors.emergency}1A`, fg: theme.colors.warning ?? theme.colors.emergency },
  LOW: { bg: theme.colors.successLight, fg: theme.colors.success },
};

const SummaryPhase: React.FC<SummaryPhaseProps> = ({ summary, onDone, guestPhone, temporaryPassword }) => {
  const checkScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Run once on mount only — do NOT re-trigger from a parent re-render,
    // that's what was causing the transient white paint artifact.
    Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasTemporaryCredentials = Boolean(guestPhone && temporaryPassword);
  const credentialText = `Emergency phone number: ${guestPhone}\nTemporary password: ${temporaryPassword}`;
  const severityStyle = SEVERITY_STYLES[summary.severity?.toUpperCase()] ?? SEVERITY_STYLES.LOW;

  const copyCredentials = async () => {
    await Clipboard.setStringAsync(credentialText);
    Alert.alert('Copied', 'Your emergency number and temporary password are on the clipboard.');
  };

  const downloadCredentials = async () => {
    if (!FileSystem.cacheDirectory) {
      Alert.alert('Unable to download', 'A local file location is not available on this device.');
      return;
    }
    try {
      const fileUri = `${FileSystem.cacheDirectory}medlink-emergency-credentials.txt`;
      await FileSystem.writeAsStringAsync(fileUri, credentialText, { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('File ready', 'The credentials file was created, but sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Save emergency credentials',
        UTI: 'public.plain-text',
      });
    } catch {
      Alert.alert('Unable to download', 'We could not create the credentials file. Please try again.');
    }
  };

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Success header */}
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: theme.colors.successLight,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.success,
                justifyContent: 'center',
                alignItems: 'center',
                ...theme.shadows.shadowFloat,
              }}
            >
              <CheckCircle2 size={32} color={theme.colors.white} strokeWidth={2} />
            </View>
          </Animated.View>
        </View>

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.foreground, marginBottom: 6, textAlign: 'center' }}>
          SOS completed
        </Text>
        <Text
          style={{
            fontSize: 13.5,
            color: theme.colors.mutedForeground,
            textAlign: 'center',
            paddingHorizontal: 28,
            lineHeight: 19,
          }}
        >
          Emergency coordination has ended. Here's everything that was arranged.
        </Text>
      </View>

      {/* Guest credentials — surfaced first since it's time-sensitive */}
      {summary.temporaryPassword && (
        <View
          style={{
            borderRadius: theme.radii.xxxl,
            borderWidth: 1,
            borderColor: `${theme.colors.emergency}4D`,
            backgroundColor: `${theme.colors.emergency}0D`,
            padding: 16,
            marginBottom: 14,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Info size={14} color={theme.colors.emergency} />
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
              Save your emergency login
            </Text>
          </View>
          <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground, lineHeight: 16 }}>
            This guest session won't be remembered on this device. Use your phone number and this password to log back in.
          </Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.emergency, letterSpacing: 1 }}>
            {summary.temporaryPassword}
          </Text>
        </View>
      )}

      {/* Section label */}
      <SectionTitle title="What was arranged" hint={summary.hospitalName} />

      {/* Arrangement summary card */}
      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          paddingHorizontal: 16,
          marginBottom: 14,
          ...theme.shadows.shadowCard,
        }}
      >
        <SummaryRow label="Hospital" value={summary.hospitalName} icon={MapPin} />
        <SummaryRow
          label="Emergency bed"
          value={summary.bedReserved ? 'Reserved' : 'Not reserved'}
          icon={BedDouble}
          positive={summary.bedReserved}
        />
        <SummaryRow
          label="ICU bed"
          value={summary.icuReserved ? 'Reserved' : 'Not reserved'}
          icon={Activity}
          positive={summary.icuReserved}
        />
        <SummaryRow
          label="Ambulance"
          value={summary.ambulance ? `Dispatched · ${summary.ambulance.callSign}` : 'Not requested'}
          icon={Truck}
          positive={!!summary.ambulance}
        />
        <SummaryRow
          label="Blood donors contacted"
          value={String(summary.donorsContacted)}
          icon={Droplet}
          positive={summary.donorsContacted > 0}
          last
        />
      </View>

      {/* AI triage assessment */}
      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.border}B3`,
          backgroundColor: theme.colors.card,
          padding: 16,
          marginBottom: 14,
          gap: 10,
          ...theme.shadows.shadowCard,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
              AI triage assessment
            </Text>
          </View>
          <View
            style={{
              borderRadius: 999,
              backgroundColor: severityStyle.bg,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: 'bold', color: severityStyle.fg, letterSpacing: 0.5 }}>
              {summary.severity}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, color: theme.colors.foreground, lineHeight: 19 }}>
          {summary.aiResponse.summary}
        </Text>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: `${theme.colors.border}66`,
            paddingTop: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: theme.colors.mutedForeground, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            First aid given
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.mutedForeground, lineHeight: 17 }}>
            {summary.aiResponse.first_aid}
          </Text>
        </View>
      </View>

      {/* Credentials actions */}
      {hasTemporaryCredentials && (
        <View
          style={{
            borderRadius: theme.radii.xxxl,
            borderWidth: 1,
            borderColor: `${theme.colors.border}B3`,
            backgroundColor: theme.colors.card,
            padding: 16,
            marginBottom: 14,
            gap: 12,
            ...theme.shadows.shadowCard,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.foreground }}>
            Emergency login details
          </Text>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>Phone number</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.foreground }}>{guestPhone}</Text>
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>Temporary password</Text>
            <Text selectable style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.foreground }}>
              {temporaryPassword}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={copyCredentials}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingVertical: 11,
              }}
            >
              <Copy size={15} color={theme.colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.primary }}>Copy</Text>
            </Pressable>
            <Pressable
              onPress={downloadCredentials}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 999,
                backgroundColor: theme.colors.primary,
                paddingVertical: 11,
              }}
            >
              <Download size={15} color={theme.colors.primaryForeground} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.primaryForeground }}>Download</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Coordination fee — flat row layout, no nested animated wrappers */}
      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.emergency}33`,
          backgroundColor: `${theme.colors.emergency}0D`,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.foreground }}>Coordination fee</Text>
          <Text style={{ fontSize: 19, fontWeight: 'bold', color: theme.colors.emergency }}>
            BDT {SOS_COORDINATION_FEE_BDT.toLocaleString()}
          </Text>
        </View>
        <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground, lineHeight: 16 }}>
          This fee will be added to your bill at {summary.hospitalName}. No separate payment is needed right now.
        </Text>
      </View>

      {/* Done */}
      <TouchableOpacity
        onPress={onDone}
        style={{
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
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primaryForeground }}>
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
  positive?: boolean;
  last?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, icon: Icon, positive, last }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: `${theme.colors.border}80`,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon size={13} color={theme.colors.mutedForeground} strokeWidth={2} />
        </View>
        <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>{label}</Text>
      </View>
      <Text
        style={{
          fontSize: 12.5,
          fontWeight: 'bold',
          color: positive ? theme.colors.success : theme.colors.foreground,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const ActiveResponsePhase: React.FC<{
  hospital?: Hospital;
  reserved: { bed?: boolean; icu?: boolean; ambulance?: string };
  eventId: string | null;
  selectedDonor: RankedDonor | null;
  bloodRequired: boolean | null;
  onComplete: () => void;
}> = ({ hospital, reserved, eventId, selectedDonor, bloodRequired, onComplete }) => {
  const [reservation, setReservation] = useState<Awaited<ReturnType<typeof getReservations>>[number] | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadReservation = async () => {
      if (!eventId) return;
      try {
        const [records, payments] = await Promise.all([getReservations(), getPayments()]);
        const nextReservation = records.find((record) => record.medical_event_id === eventId);
        if (active) {
          setReservation(nextReservation);
          setPaymentStatus(nextReservation ? payments.find((payment) => payment.reservation_id === nextReservation.id)?.payment_status ?? null : null);
        }
      } catch {
        // The response view still shows the locally confirmed arrangement.
      }
    };
    void loadReservation();
    const timer = setInterval(() => void loadReservation(), 5000);
    return () => { active = false; clearInterval(timer); };
  }, [eventId]);

  const ambulance = ambulances.find((item) => item.id === reserved.ambulance) ?? ambulances[0];
  const isPaid = paymentStatus?.toUpperCase() === 'PAID';
  const openDirections = () => {
    if (!hospital?.address) return;
    void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`);
  };

  return <View style={{ gap: 14 }}>
    <StepHeader step="Active SOS" title="Help is on the way" subtitle="Keep this screen open for the latest ambulance, hospital, and admission details." />
    <View style={{ borderRadius: theme.radii.xxxl, backgroundColor: `${theme.colors.emergency}12`, borderWidth: 1, borderColor: `${theme.colors.emergency}44`, padding: 16, gap: 9 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.foreground }}>{ambulance.callSign} · {ambulance.driver}</Text>
      <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>{ambulance.phone} · {ambulance.etaMin} min ETA · {ambulance.reg}</Text>
      <CallButton label={`Call driver · ${ambulance.phone}`} phone={ambulance.phone} tone="emergency" />
    </View>
    <View style={{ borderRadius: theme.radii.xxxl, backgroundColor: theme.colors.card, padding: 16, gap: 9, ...theme.shadows.shadowCard }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.foreground }}>{hospital?.name ?? 'Confirmed hospital'}</Text>
      <Text style={{ fontSize: 12.5, lineHeight: 18, color: theme.colors.mutedForeground }}>{hospital?.address ?? 'Hospital location unavailable'}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <CallButton label={`Call hospital · ${hospital?.phone ?? 'Unavailable'}`} phone={hospital?.phone ?? ''} />
        <TouchableOpacity onPress={openDirections} disabled={!hospital?.address} style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.primary, paddingVertical: 12, alignItems: 'center', opacity: hospital?.address ? 1 : 0.45 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.primary }}>Google Maps</Text>
        </TouchableOpacity>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: `${theme.colors.border}99`, paddingTop: 10, gap: 4 }}>
        <Text style={{ fontSize: 12.5, color: theme.colors.foreground }}>Reserved {reservation?.reservation_mode === 'ICU' || reserved.icu ? 'ICU' : 'emergency bed'}: <Text style={{ fontWeight: 'bold' }}>{reservation?.bed_number ?? 'Confirmed'}</Text></Text>
        <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>{reservation?.ward_name ?? 'Admission reservation confirmed'}</Text>
      </View>
    </View>
    {bloodRequired && selectedDonor && <View style={{ borderRadius: theme.radii.xxxl, backgroundColor: theme.colors.card, padding: 16, gap: 7, ...theme.shadows.shadowCard }}><Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.foreground }}>Selected blood donor</Text><Text style={{ fontSize: 13, color: theme.colors.foreground }}>{selectedDonor.name} · {selectedDonor.group}</Text><Text style={{ fontSize: 12, color: theme.colors.mutedForeground }}>{selectedDonor.phone} · {selectedDonor.distanceKm} km from hospital</Text><CallButton label={`Call donor · ${selectedDonor.phone}`} phone={selectedDonor.phone} /></View>}
    <View style={{ borderRadius: theme.radii.xxl, backgroundColor: theme.colors.surfaceVariant, padding: 14 }}><Text style={{ fontSize: 12, lineHeight: 17, color: theme.colors.mutedForeground }}>{isPaid ? 'Payment received. You can now complete the SOS after the patient has received care.' : 'The hospital bill must be paid before the SOS can be completed. This screen checks payment status automatically.'}</Text></View>
    <PrimaryStepButton label={isPaid ? 'Complete SOS' : 'Waiting for payment'} disabled={!isPaid} onPress={onComplete} />
  </View>;
};

const SOS_CHECKPOINT_PREFIX = 'medlink.sos.checkpoint.';