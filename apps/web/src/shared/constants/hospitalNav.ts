import {
  BedDouble,
  CreditCard,
  Droplet,
  Inbox,
  LayoutDashboard,
  Siren,
} from "lucide-react";
import type { NavItem } from "@/shared/components/ui/DashboardShell";
import type { HospitalUser } from "@/types/hospital";
import { getOpenEmergencyCount } from "@/services/hospital.service";

export const hospitalNav: NavItem[] = [
  { to: "/hospital", label: "Overview", icon: LayoutDashboard },
  { to: "/hospital/payments", label: "Payments", icon: CreditCard },
  {
    to: "/hospital/emergencies",
    label: "Emergencies",
    icon: Siren,
    badge: getOpenEmergencyCount(),
  },
  { to: "/hospital/beds", label: "Beds & ICU", icon: BedDouble },
  { to: "/hospital/reservations", label: "Reservations", icon: Inbox },
  {
    to: "/hospital/requests",
    label: "Requests",
    icon: Inbox,
    badge: "Coming Soon",
  },
  {
    to: "/hospital/blood",
    label: "Blood",
    icon: Droplet,
    badge: "Coming Soon",
  },
];

export const hospitalUser: HospitalUser = {
  name: "Dr. Amara Okafor",
  role: "Emergency Lead · St. Mercy",
};