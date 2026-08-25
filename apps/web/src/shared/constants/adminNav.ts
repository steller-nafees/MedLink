import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Truck,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/shared/components/ui/DashboardShell";

export const getAdminNav = (pending: number): NavItem[] => [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/admin/drivers", label: "Ambulance Drivers", icon: Truck },
  { to: "/admin/verification", label: "Verification Center", icon: ShieldCheck, badge: pending > 0 ? pending : undefined },
  { to: "/admin/revenue", label: "Revenue & Billing", icon: Wallet }
];
