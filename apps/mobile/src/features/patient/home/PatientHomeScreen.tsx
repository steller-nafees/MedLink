import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
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
} from "lucide-react-native";
import { theme } from "../../../theme";
import { patient, serviceRequests, requestKindLabel, statusStyle, paymentStyle } from "../../../lib/data";
import { myDonation, eligibilityFrom, formatDate } from "../../../lib/blood";

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

  // Compute data
  const recent = useMemo(() => serviceRequests.filter((r) => r.kind === "emergency").slice(0, 3), []);
  const active = useMemo(() => serviceRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled"), []);
  const due = useMemo(() => serviceRequests.filter((r) => r.status === "completed" && r.payment !== "paid"), []);

  const eligibility = eligibilityFrom(myDonation.lastDonation);

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
                <Text style={styles.avatarText}>{patient.initials}</Text>
              </View>
              <View>
                <Text style={styles.greetingText}>Good morning</Text>
                <Text style={styles.userName}>{patient.name}</Text>
              </View>
            </Pressable>

            {/* Right: Bell + Settings */}
            <View style={styles.headerActions}>
              <Pressable
                style={[styles.iconButton, theme.shadows.sm]}
                onPress={() => router.push("/notifications")}
                android_ripple={{ color: "rgba(22, 168, 156, 0.15)", borderless: true, radius: 22 }}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bell size={18} color={theme.colors.foreground} strokeWidth={2} />
                <View style={styles.notificationDot} />
              </Pressable>

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
              accessibilityLabel={`Blood donation status: group ${myDonation.group}`}
            >
              <View style={styles.bloodRow}>
                <View style={styles.bloodGroupBadge}>
                  <Text style={styles.bloodGroupText}>{myDonation.group}</Text>
                </View>
                <View style={styles.bloodInfoWrap}>
                  <Text style={styles.bloodTitle}>Blood donation</Text>
                  <Text style={styles.bloodSubtitle}>
                    Last donated · {formatDate(myDonation.lastDonation)}
                  </Text>
                  <View style={styles.bloodStatusRow}>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: myDonation.available
                            ? theme.colors.successLight
                            : theme.colors.muted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          {
                            color: myDonation.available
                              ? theme.colors.successDark
                              : theme.colors.textMuted,
                          },
                        ]}
                      >
                        {myDonation.available ? "Available" : "Paused"}
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
              {recent.map((r, i) => (
                <Pressable
                  key={r.id}
                  style={[
                    styles.activityItem,
                    i > 0 && styles.activityItemBorder,
                  ]}
                  onPress={() => router.push("/activity")}
                  android_ripple={{ color: "rgba(22, 168, 156, 0.08)", borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel={`Activity: ${r.title}`}
                >
                  <View style={styles.activityIconWrap}>
                    <Siren size={18} color={theme.colors.emergency} strokeWidth={2} />
                  </View>
                  <View style={styles.activityTextWrap}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {r.title}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {requestKindLabel[r.kind]} · {r.date}
                    </Text>
                  </View>
                  <View style={styles.statusBadgeSmall}>
                    <Text style={styles.statusBadgeSmallText}>
                      {statusStyle(r.status).label}
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
                accessibilityLabel={`${due.length} pending payments`}
              >
                <Text style={styles.statNumber}>{due.length}</Text>
                <Text style={styles.statLabel}>Pending payment</Text>
              </Pressable>
            </View>
          </View>

          {/* Due Payment Card */}
          {due[0] && (
            <View style={[styles.cardWrapper, theme.shadows.shadowCard, { marginTop: theme.spacing.md }]}>
              <View style={styles.dueCard}>
                <View style={styles.dueHeader}>
                  <View style={styles.dueTextWrap}>
                    <Text style={styles.dueTitle} numberOfLines={1}>
                      {due[0].title}
                    </Text>
                    <Text style={styles.dueHospital} numberOfLines={1}>
                      {due[0].hospital}
                    </Text>
                    <View style={styles.paymentBadgeWrap}>
                      <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeText}>
                          {paymentStyle(due[0].payment).label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.payButtonWrap}>
                  <Text style={styles.payButtonText}>Pay in App</Text>
                  <View style={styles.comingSoonMiniBadge}>
                    <Text style={styles.comingSoonMiniText}>Coming Soon</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
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
  notificationDot: {
    position: "absolute",
    top: 11,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.emergency,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
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
