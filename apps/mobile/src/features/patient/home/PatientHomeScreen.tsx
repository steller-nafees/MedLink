import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
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

  // Compute data
  const recent = useMemo(() => serviceRequests.filter((r) => r.kind === "emergency").slice(0, 3), []);
  const active = useMemo(() => serviceRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled"), []);
  const due = useMemo(() => serviceRequests.filter((r) => r.status === "completed" && r.payment !== "paid"), []);

  const eligibility = eligibilityFrom(myDonation.lastDonation);

  // Dynamic colors
  const bgColor = isDark ? theme.colors.background : theme.colors.background;
  const cardBg = isDark ? theme.colors.card : theme.colors.card;
  const textColor = isDark ? theme.colors.foreground : theme.colors.foreground;
  const mutedText = isDark ? "#9CA3AF" : theme.colors.mutedForeground;
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : theme.colors.border;

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: bgColor }]}
      contentContainerStyle={{ paddingBottom: 200 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left: Avatar + Greeting */}
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                ...theme.shadows.shadowCard,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold", color: theme.colors.primaryForeground }}>
                {patient.initials}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: mutedText, marginBottom: 2 }}>Good morning</Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: textColor }}>{patient.name}</Text>
            </View>
          </View>

          {/* Right: Bell + Settings */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: cardBg,
                justifyContent: "center",
                alignItems: "center",
                ...theme.shadows.shadowCard,
              }}
              onPress={() => router.push("/notifications")}
            >
              <Bell size={16} color={textColor} strokeWidth={2} />
              {/* Notification dot */}
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.emergency,
                  borderWidth: 2,
                  borderColor: cardBg,
                }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: borderColor,
                backgroundColor: cardBg,
                justifyContent: "center",
                alignItems: "center",
                ...theme.shadows.shadowCard,
              }}
              onPress={() => router.push("/settings")}
            >
              <Settings size={17} color={mutedText} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hero Cards Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28, gap: 12 }}>
        {/* Emergency SOS Hero */}
        <Pressable
          style={({ pressed }) => [
            {
              borderRadius: 28,
              backgroundColor: theme.colors.emergency,
              padding: 20,
              ...theme.shadows.shadowFloat,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => router.push("/sos")}
        >
          <View
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "rgba(255,255,255,0.1)",
              right: -50,
              top: -50,
            }}
          />
          <View style={{ position: "relative", zIndex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.2)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Siren size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 }}>
              Emergency SOS
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.9)",
                marginBottom: 16,
                maxWidth: 250,
                lineHeight: 18,
              }}
            >
              Request an ambulance, find hospitals, and reserve a bed or ICU instantly.
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.emergency }}>
                Activate SOS
              </Text>
              <ArrowUpRight size={16} color={theme.colors.emergency} strokeWidth={2} />
            </View>
          </View>
        </Pressable>

        {/* AI Medical Assistant Hero */}
        <Pressable
          style={({ pressed }) => [
            {
              borderRadius: 28,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: borderColor,
              padding: 20,
              ...theme.shadows.shadowCard,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => router.push("/ai")}
        >
          <View
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: `${theme.colors.primaryContainer}70`,
              right: -50,
              top: -50,
            }}
          />
          <View style={{ position: "relative", zIndex: 1 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: theme.colors.primaryContainer,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Bot size={24} color={theme.colors.primary} strokeWidth={2} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: textColor, marginBottom: 8 }}>
              AI Medical Assistant
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: mutedText,
                marginBottom: 16,
                maxWidth: 240,
                lineHeight: 18,
              }}
            >
              Ask health questions, find specialists or tests, and understand your reports.
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.primaryForeground }}>
                Ask AI Assistant
              </Text>
              <ArrowUpRight size={16} color={theme.colors.primaryForeground} strokeWidth={2} />
            </View>
          </View>
        </Pressable>
      </View>

      {/* Quick Access Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: mutedText,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          Quick Access
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: borderColor,
                  backgroundColor: cardBg,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                  ...theme.shadows.shadowCard,
                }}
                onPress={() => router.push(item.href)}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: theme.colors.primaryContainer,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Icon size={18} color={theme.colors.primary} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    fontSize: 10.5,
                    fontWeight: "600",
                    color: textColor,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Blood Donation Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: mutedText,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          Blood Donation
        </Text>
        <View
          style={{
            borderRadius: 28,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: cardBg,
            padding: 16,
            ...theme.shadows.shadowCard,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: "rgba(214, 69, 69, 0.1)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "900",
                  color: theme.colors.emergency,
                }}
              >
                {myDonation.group}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: "bold", color: textColor, marginBottom: 4 }}>
                Blood donation
              </Text>
              <Text style={{ fontSize: 11.5, color: mutedText }}>
                Last donated · {formatDate(myDonation.lastDonation)}
              </Text>
              <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: myDonation.available
                      ? `${theme.colors.primary}20`
                      : `${theme.colors.muted}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "bold",
                      color: myDonation.available ? theme.colors.primary : mutedText,
                    }}
                  >
                    {myDonation.available ? "Available" : "Paused"}
                  </Text>
                </View>
                <View
                  style={{
                    marginLeft: "auto",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primaryContainer,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: theme.colors.primary,
                    }}
                  >
                    Manage
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Future Services Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28, gap: 12 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: mutedText,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 4,
          }}
        >
          Future Services
        </Text>

        {/* Live Medical Support Card */}
        <View
          style={{
            borderRadius: 28,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: cardBg,
            padding: 20,
            ...theme.shadows.shadowCard,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: `${theme.colors.primaryContainer}70`,
              right: -50,
              top: -50,
            }}
          />
          <View style={{ position: "relative", zIndex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primaryContainer,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Stethoscope size={24} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primaryContainer,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: theme.colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Coming Soon
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: textColor,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Live Medical Support
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: mutedText,
                marginBottom: 16,
                maxWidth: 280,
                lineHeight: 18,
              }}
            >
              Speak with licensed healthcare professionals in real time for medical guidance, symptom clarification, and treatment advice.
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                backgroundColor: theme.colors.muted,
                alignSelf: "flex-start",
              }}
            >
              <Lock size={16} color={theme.colors.mutedForeground} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: theme.colors.mutedForeground,
                }}
              >
                Coming Soon
              </Text>
            </View>
          </View>
        </View>

        {/* Appointments & Tests Card */}
        <View
          style={{
            borderRadius: 28,
            borderWidth: 1,
            borderColor: borderColor,
            backgroundColor: cardBg,
            padding: 20,
            ...theme.shadows.shadowCard,
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: `${theme.colors.primaryContainer}70`,
              right: -50,
              top: -50,
            }}
          />
          <View style={{ position: "relative", zIndex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primaryContainer,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CalendarCheck size={24} color={theme.colors.primary} strokeWidth={2} />
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primaryContainer,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: theme.colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Coming Soon
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: textColor,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Appointments & Tests
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: mutedText,
                marginBottom: 16,
                maxWidth: 280,
                lineHeight: 18,
              }}
            >
              Book doctor consultations, specialist appointments, and diagnostic tests directly through MedLink.
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                backgroundColor: theme.colors.muted,
                alignSelf: "flex-start",
              }}
            >
              <Lock size={16} color={theme.colors.mutedForeground} strokeWidth={2} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: theme.colors.mutedForeground,
                }}
              >
                Coming Soon
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      {recent.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: mutedText,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Recent Activity
            </Text>
            <TouchableOpacity onPress={() => router.push("/activity")}>
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: theme.colors.primary }}>View all</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: borderColor,
              backgroundColor: cardBg,
              overflow: "hidden",
              ...theme.shadows.shadowCard,
            }}
          >
            {recent.map((r, i) => (
              <TouchableOpacity
                key={r.id}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: borderColor,
                }}
                onPress={() => router.push("/activity")}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: `${theme.colors.emergency}20`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Siren size={18} color={theme.colors.emergency} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: textColor,
                    }}
                    numberOfLines={1}
                  >
                    {r.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: mutedText,
                    }}
                  >
                    {requestKindLabel[r.kind]} · {r.date}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 10,
                    backgroundColor: `${theme.colors.primary}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: theme.colors.primary,
                    }}
                  >
                    {statusStyle(r.status).label}
                  </Text>
                </View>
                <ChevronRight size={16} color={mutedText} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* My Requests Summary Section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "bold",
              color: mutedText,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            My Requests
          </Text>
          <TouchableOpacity onPress={() => router.push("/activity")}>
            <Text style={{ fontSize: 12.5, fontWeight: "600", color: theme.colors.primary }}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={{ gap: 10, marginBottom: 10 }}>
          <TouchableOpacity
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: borderColor,
              backgroundColor: cardBg,
              padding: 16,
              ...theme.shadows.shadowCard,
            }}
            onPress={() => router.push("/activity")}
          >
            <Text style={{ fontSize: 28, fontWeight: "bold", color: textColor, marginBottom: 8 }}>
              {active.length}
            </Text>
            <Text style={{ fontSize: 12.5, color: mutedText }}>Active requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: borderColor,
              backgroundColor: cardBg,
              padding: 16,
              ...theme.shadows.shadowCard,
            }}
            onPress={() => router.push("/activity")}
          >
            <Text style={{ fontSize: 28, fontWeight: "bold", color: textColor, marginBottom: 8 }}>
              {due.length}
            </Text>
            <Text style={{ fontSize: 12.5, color: mutedText }}>Pending payment</Text>
          </TouchableOpacity>
        </View>

        {/* Due Payment Card */}
        {due[0] && (
          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: borderColor,
              backgroundColor: cardBg,
              padding: 16,
              ...theme.shadows.shadowCard,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: textColor,
                  }}
                  numberOfLines={1}
                >
                  {due[0].title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: mutedText,
                  }}
                  numberOfLines={1}
                >
                  {due[0].hospital}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 10,
                      backgroundColor: `${theme.colors.emergency}20`,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: theme.colors.emergency,
                      }}
                    >
                      {paymentStyle(due[0].payment).label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              disabled
              style={{
                marginTop: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: theme.colors.muted,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "600",
                  color: theme.colors.mutedForeground,
                }}
              >
                Pay in App
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primaryContainer,
                }}
              >
                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: "bold",
                    color: theme.colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  Coming Soon
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
