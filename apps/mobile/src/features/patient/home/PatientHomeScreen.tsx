import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bot,
  Siren,
  Building2,
  Truck,
  Contact,
  Settings,
  Lock,
  Stethoscope,
  CalendarCheck,
  ChevronRight,
  ArrowUpRight,
  Droplet,
} from "lucide-react-native";
import { theme } from "../../../theme";
import { formatDate } from "../../../lib/blood";
import { getMyProfile, type PatientProfileResponse } from "../../../services/profile";
import {
  getMedicalEvents,
  getReservations,
  type MedicalEvent,
  type Reservation,
} from "../../../services/patient-records";

const quickAccessItems = [
  { label: "Hospitals", icon: Building2, href: "/hospitals" },
  { label: "Ambulances", icon: Truck, href: "/sos" },
  { label: "Contacts", icon: Contact, href: "/profile" },
];

export default function PatientHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [profileRecord, eventRecords, reservationRecords] = await Promise.all([
        getMyProfile(),
        getMedicalEvents(),
        getReservations(),
      ]);
      setProfile(profileRecord);
      setEvents(eventRecords);
      setReservations(reservationRecords);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadDashboard(); }, [loadDashboard]));

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Your profile";
  const initials = getInitials(fullName);
  const donation = {
    group: profile?.blood_group ?? "--",
    lastDonation: profile?.last_donation_date ?? null,
    available: profile?.is_available_for_donation ?? false,
  };
  const recent = useMemo(() => events.filter((event) => event.is_emergency).slice(0, 3), [events]);
  const active = useMemo(
    () => reservations.filter((reservation) => !["COMPLETED", "CANCELLED", "CANCELED"].includes(reservation.reservation_status.toUpperCase())),
    [reservations],
  );
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + theme.spacing.sm,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {/* Left: Avatar + Greeting */}
            <Pressable
              style={styles.profileRow}
              onPress={() => router.push("/profile")}
              android_ripple={{ color: "rgba(22, 168, 156, 0.1)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel="View profile"
            >
              <View style={[styles.avatar, theme.shadows.shadowCard]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Good morning</Text>
                <Text style={styles.userName}>{loading ? "Loading…" : fullName}</Text>
              </View>
            </Pressable>

            {/* Right: Settings */}
            <View style={styles.headerActions}>
              <Pressable
                style={[styles.iconButton, theme.shadows.sm]}
                onPress={() => router.push("/settings")}
                android_ripple={{ color: "rgba(22, 168, 156, 0.15)", borderless: true, radius: 22 }}
                accessibilityRole="button"
                accessibilityLabel="Settings"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Settings size={18} color={theme.colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </View>

        {loadError ? <Text style={styles.dashboardError}>{loadError}</Text> : null}

        {/* Hero Cards Section */}
        <View style={styles.heroSection}>
          {/* Emergency SOS Hero */}
          <View style={[styles.heroCardWrap, theme.shadows.shadowEmergency]}>
            <Pressable
              style={styles.heroCardEmergency}
              onPress={() => router.push("/sos")}
              android_ripple={{ color: "rgba(255, 255, 255, 0.2)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel="Emergency SOS - Request an ambulance or hospital"
            >
              <View style={styles.glowCircleEmergency} />
              <View style={styles.heroCardContent}>
                <View style={styles.heroIconEmergency}>
                  <Siren size={24} color="#FFFFFF" strokeWidth={2} />
                </View>
                <Text style={styles.heroTitleEmergency}>Emergency SOS</Text>
                <Text style={styles.heroDescEmergency}>
                  Request an ambulance, find hospitals, and reserve a bed or ICU instantly.
                </Text>
                <View style={styles.heroActionEmergency}>
                  <Text style={styles.heroActionTextEmergency}>Activate SOS</Text>
                  <ArrowUpRight size={16} color={theme.colors.emergency} strokeWidth={2.5} />
                </View>
              </View>
            </Pressable>
          </View>

          {/* AI Medical Assistant Hero */}
          <View style={[styles.heroCardWrap, theme.shadows.shadowCard]}>
            <Pressable
              style={styles.heroCardAi}
              onPress={() => router.push("/ai")}
              android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel="Ask AI Medical Assistant"
            >
              <View style={styles.glowCircleAi} />
              <View style={styles.heroCardContent}>
                <View style={styles.heroIconAi}>
                  <Bot size={24} color={theme.colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.heroTitleAi}>AI Medical Assistant</Text>
                <Text style={styles.heroDescAi}>
                  Ask health questions, find specialists or tests, and understand your reports.
                </Text>
                <View style={styles.heroActionAi}>
                  <Text style={styles.heroActionTextAi}>Ask AI Assistant</Text>
                  <ArrowUpRight size={16} color={theme.colors.primaryForeground} strokeWidth={2.5} />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.label} style={[styles.quickAccessCardWrap, theme.shadows.sm]}>
                  <Pressable
                    style={styles.quickAccessCard}
                    onPress={() => router.push(item.href as any)}
                    android_ripple={{ color: "rgba(22, 168, 156, 0.1)", borderless: false }}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    <View style={styles.quickAccessIconWrap}>
                      <Icon size={20} color={theme.colors.primary} strokeWidth={2} />
                    </View>
                    <Text style={styles.quickAccessText}>{item.label}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* Blood Donation Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Blood Donation</Text>
          <View style={[styles.cardWrapper, theme.shadows.shadowCard]}>
            <Pressable
              style={styles.bloodCard}
              onPress={() => router.push("/blood")}
              android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel={`Blood donation status: group ${donation.group}`}
            >
              <View style={styles.bloodRow}>
                <View style={styles.bloodGroupBadge}>
                  <Text style={styles.bloodGroupText}>{donation.group}</Text>
                </View>
                <View style={styles.bloodInfoWrap}>
                  <Text style={styles.bloodTitle}>Blood donation</Text>
                  <Text style={styles.bloodSubtitle}>
                    Last donated · {formatDate(donation.lastDonation)}
                  </Text>
                  <View style={styles.bloodStatusRow}>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: donation.available
                            ? theme.colors.successLight
                            : theme.colors.muted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          {
                            color: donation.available
                              ? theme.colors.successDark
                              : theme.colors.textMuted,
                          },
                        ]}
                      >
                        {donation.available ? "Available" : "Paused"}
                      </Text>
                    </View>
                    <View style={styles.manageButton}>
                      <Text style={styles.manageButtonText}>Manage</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
          <View style={[styles.cardWrapper, theme.shadows.shadowCard, { marginTop: theme.spacing.md }]}>
            <Pressable
              style={styles.futureCard}
              onPress={() => router.push("/blood")}
              android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel="Find blood donors"
            >
              <View style={styles.futureHeader}>
                <View style={styles.futureIconWrap}>
                  <Droplet size={22} color={theme.colors.emergency} strokeWidth={2} />
                </View>
                <View style={styles.findDonorsBadge}>
                  <Text style={styles.findDonorsBadgeText}>Available now</Text>
                </View>
              </View>
              <Text style={styles.futureTitle}>Find Donors</Text>
              <Text style={styles.futureDesc}>
                Search eligible blood donors by blood group and distance when you or someone close needs support.
              </Text>
              <View style={styles.findDonorsAction}>
                <Text style={styles.findDonorsActionText}>Browse donors</Text>
                <ArrowUpRight size={16} color={theme.colors.emergency} strokeWidth={2.5} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Future Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Future Services</Text>
          <View style={styles.futureServicesGrid}>
            {/* Live Medical Support Card */}
            <View style={[styles.cardWrapper, theme.shadows.shadowCard]}>
              <View style={styles.futureCard}>
                <View style={styles.futureHeader}>
                  <View style={styles.futureIconWrap}>
                    <Stethoscope size={22} color={theme.colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={styles.futureTitle}>Live Medical Support</Text>
                <Text style={styles.futureDesc}>
                  Speak with licensed healthcare professionals in real time for guidance and treatment advice.
                </Text>
                <View style={styles.lockedPill}>
                  <Lock size={14} color={theme.colors.textMuted} strokeWidth={2} />
                  <Text style={styles.lockedText}>Coming Soon</Text>
                </View>
              </View>
            </View>

            {/* Appointments & Tests Card */}
            <View style={[styles.cardWrapper, theme.shadows.shadowCard]}>
              <View style={styles.futureCard}>
                <View style={styles.futureHeader}>
                  <View style={styles.futureIconWrap}>
                    <CalendarCheck size={22} color={theme.colors.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={styles.futureTitle}>Appointments & Tests</Text>
                <Text style={styles.futureDesc}>
                  Book doctor consultations, specialist appointments, and diagnostic tests directly in MedLink.
                </Text>
                <View style={styles.lockedPill}>
                  <Lock size={14} color={theme.colors.textMuted} strokeWidth={2} />
                  <Text style={styles.lockedText}>Coming Soon</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        {recent.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Recent Activity</Text>
              <Pressable
                onPress={() => router.push("/activity")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
              >
                <Text style={styles.viewAllText}>View all</Text>
              </Pressable>
            </View>
            <View style={[styles.cardWrapper, theme.shadows.shadowCard]}>
              {recent.map((event, i) => (
                <Pressable
                  key={event.id}
                  style={[
                    styles.activityItem,
                    i > 0 && styles.activityItemBorder,
                  ]}
                  onPress={() => router.push("/activity")}
                  android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel={`Activity: ${event.user_description || "Emergency medical event"}`}
                >
                  <View style={styles.activityIconWrap}>
                    <Siren size={18} color={theme.colors.emergency} strokeWidth={2} />
                  </View>
                  <View style={styles.activityTextWrap}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {event.user_description || "Emergency medical event"}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      Emergency SOS · {formatActivityDate(event.created_at)}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeSmall}>
                    <Text style={styles.statusBadgeSmallText}>
                      {formatStatus(event.event_status)}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={theme.colors.textMuted} strokeWidth={2} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* My Requests Summary Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>My Requests</Text>
            <Pressable
              onPress={() => router.push("/activity")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
            >
              <Text style={styles.viewAllText}>Manage</Text>
            </Pressable>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCardWrap, theme.shadows.shadowCard]}>
              <Pressable
                style={styles.statCard}
                onPress={() => router.push("/activity")}
                android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
                accessibilityRole="button"
                accessibilityLabel={`${active.length} active requests`}
              >
                <Text style={styles.statNumber}>{active.length}</Text>
                <Text style={styles.statLabel}>Active requests</Text>
              </Pressable>
            </View>

            <View style={[styles.statCardWrap, theme.shadows.shadowCard]}>
              <Pressable
                style={styles.statCard}
                onPress={() => router.push("/activity")}
                android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
                accessibilityRole="button"
                accessibilityLabel={`${reservations.length} total reservations`}
              >
                <Text style={styles.statNumber}>{reservations.length}</Text>
                <Text style={styles.statLabel}>Reservations</Text>
              </Pressable>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

function getInitials(name: string) {
  if (name === "Your profile") return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.xs,
  },
  dashboardError: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.emergencyLight,
    padding: theme.spacing.md,
    ...theme.typography.caption,
    color: theme.colors.emergency,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.xs,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...theme.typography.button,
    color: theme.colors.primaryForeground,
    fontWeight: "700",
  },
  greetingText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  userName: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  heroCardWrap: {
    borderRadius: theme.radii.xxxl,
    overflow: "hidden",
  },
  heroCardEmergency: {
    borderRadius: theme.radii.xxxl,
    backgroundColor: theme.colors.emergency,
    padding: theme.spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  glowCircleEmergency: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    right: -40,
    top: -40,
  },
  heroCardAi: {
    borderRadius: theme.radii.xxxl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.xl,
    position: "relative",
    overflow: "hidden",
  },
  glowCircleAi: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primaryLight,
    right: -40,
    top: -40,
  },
  heroCardContent: {
    position: "relative",
    zIndex: 1,
  },
  heroIconEmergency: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  heroIconAi: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  heroTitleEmergency: {
    ...theme.typography.h2,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  heroDescEmergency: {
    ...theme.typography.bodySmall,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: theme.spacing.lg,
    maxWidth: 260,
    lineHeight: 20,
  },
  heroActionEmergency: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    alignSelf: "flex-start",
  },
  heroActionTextEmergency: {
    ...theme.typography.button,
    color: theme.colors.emergency,
    fontSize: 13,
  },
  heroTitleAi: {
    ...theme.typography.h2,
    color: theme.colors.foreground,
    marginBottom: 6,
  },
  heroDescAi: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    maxWidth: 260,
    lineHeight: 20,
  },
  heroActionAi: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    alignSelf: "flex-start",
  },
  heroActionTextAi: {
    ...theme.typography.button,
    color: theme.colors.primaryForeground,
    fontSize: 13,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xxl,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxs,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  viewAllText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  quickAccessGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  quickAccessCardWrap: {
    flex: 1,
    borderRadius: theme.radii.xxl,
    overflow: "hidden",
  },
  quickAccessCard: {
    alignItems: "center",
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  quickAccessIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  quickAccessText: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.foreground,
    textAlign: "center",
  },
  cardWrapper: {
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  bloodCard: {
    padding: theme.spacing.lg,
  },
  bloodRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    alignItems: "flex-start",
  },
  bloodGroupBadge: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.emergencyLight,
    justifyContent: "center",
    alignItems: "center",
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.emergency,
  },
  bloodInfoWrap: {
    flex: 1,
  },
  bloodTitle: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  bloodSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  bloodStatusRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
  },
  statusChipText: {
    ...theme.typography.caption,
    fontWeight: "700",
  },
  manageButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primaryLight,
  },
  manageButtonText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  futureServicesGrid: {
    gap: theme.spacing.md,
  },
  futureCard: {
    padding: theme.spacing.xl,
  },
  futureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  futureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primaryLight,
  },
  comingSoonText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 10,
  },
  futureTitle: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
    marginTop: theme.spacing.lg,
    marginBottom: 4,
  },
  futureDesc: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  lockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.muted,
    alignSelf: "flex-start",
  },
  lockedText: {
    ...theme.typography.caption,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  findDonorsBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.emergencyLight,
  },
  findDonorsBadgeText: {
    ...theme.typography.label,
    color: theme.colors.emergency,
    fontSize: 10,
  },
  findDonorsAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.emergencyLight,
  },
  findDonorsActionText: {
    ...theme.typography.button,
    color: theme.colors.emergency,
    fontSize: 13,
  },
  activityItem: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  activityItemBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.emergencyLight,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  activitySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadgeSmall: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  statusBadgeSmallText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.primary,
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  statCardWrap: {
    flex: 1,
    borderRadius: theme.radii.xxl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  statCard: {
    padding: theme.spacing.lg,
  },
  statNumber: {
    ...theme.typography.display,
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  dueCard: {
    padding: theme.spacing.lg,
  },
  dueHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dueTextWrap: {
    flex: 1,
  },
  dueTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  dueHospital: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  paymentBadgeWrap: {
    marginTop: theme.spacing.sm,
  },
  paymentBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.emergencyLight,
    alignSelf: "flex-start",
  },
  paymentBadgeText: {
    ...theme.typography.caption,
    fontWeight: "700",
    color: theme.colors.emergency,
    fontSize: 11,
  },
  payButtonWrap: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.muted,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  payButtonText: {
    ...theme.typography.button,
    color: theme.colors.textMuted,
  },
  comingSoonMiniBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  comingSoonMiniText: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 9,
  },
});
