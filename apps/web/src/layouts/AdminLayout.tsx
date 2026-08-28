import { useEffect, useState, type ReactNode } from "react";
import { DashboardShell } from "@/shared/components/ui/DashboardShell";
import { getAdminNav } from "@/shared/constants/adminNav";
import { platformService } from "@/services/platform.service";
import { getStoredUser, logout as clearSession } from "@/services/auth";
import { authStore } from "@/store/auth.store";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const user = getStoredUser();

  useEffect(() => {
    // Admin console is light mode only.
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");

    async function fetchPending() {
      const hospitals = await platformService.getHospitalApplications();
      const drivers = await platformService.getDriverApplications();
      setPendingCount(hospitals.length + drivers.length);
    }
    
    fetchPending();

    const handleDecide = () => setPendingCount((c) => Math.max(0, c - 1));
    window.addEventListener("verification-decided", handleDecide);

    return () => {
      if (wasDark) root.classList.add("dark");
      window.removeEventListener("verification-decided", handleDecide);
    };
  }, []);

  const nav = getAdminNav(pendingCount);

  const handleLogout = () => {
    clearSession();
    authStore.logout();
  };

  return (
    <DashboardShell
      role="Super Admin"
      nav={nav}
      user={{
        name: user?.email ?? user?.phone ?? "Platform Administrator",
        role: "Platform Administrator",
      }}
      onLogout={handleLogout}
      searchPlaceholder="Search users, hospitals, drivers, settlements…"
    >
      {children}
    </DashboardShell>
  );
}
