import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { WebShell, type NavItem } from "@/components/medlink/web-shell";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Truck,
  ShieldCheck,
  Wallet,
  Bell,
  ScrollText,
  Activity,
} from "lucide-react";
import { adminNotifications, hospitalApplications, driverApplications } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin · MedLink Platform Console" },
      { name: "description", content: "Govern the MedLink platform: verification, users, revenue and system health." },
      { property: "og:title", content: "MedLink Super Admin" },
      { property: "og:description", content: "Platform governance, verification and revenue monitoring." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  // Admin console is light mode only.
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  const pending = hospitalApplications.length + driverApplications.length;
  const unread = adminNotifications.filter((n) => n.unread).length;

  const nav: NavItem[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/hospitals", label: "Hospitals", icon: Building2 },
    { to: "/admin/drivers", label: "Ambulance Drivers", icon: Truck },
    { to: "/admin/verification", label: "Verification Center", icon: ShieldCheck, badge: pending },
    { to: "/admin/revenue", label: "Revenue & Billing", icon: Wallet }
  ];

  return (
    <WebShell role="Super Admin" nav={nav} user={{ name: "Raees Rahman", role: "Platform Administrator" }} searchPlaceholder="Search users, hospitals, drivers, settlements…">
      <Outlet />
    </WebShell>
  );
}
