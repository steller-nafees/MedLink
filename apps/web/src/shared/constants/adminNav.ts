import {
  LayoutDashboard,
  TrendingUp,
  User,
  Building2,
  Truck,
  CreditCard,
} from "lucide-react";
import type { NavItem } from "@/shared/components/ui/DashboardShell";

export const getAdminNav = (_pendingCount?: number): NavItem[] => [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/admin/users", label: "Users", icon: User },
  { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/admin/drivers", label: "Ambulance Drivers", icon: Truck },
  { to: "/admin/revenue", label: "Revenue & Billing", icon: CreditCard },
];
