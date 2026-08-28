import type { ReactNode } from "react";
import { DashboardShell } from "@/shared/components/ui/DashboardShell";
import { hospitalNav } from "@/shared/constants/hospitalNav";
import { getStoredUser, logout as clearSession } from "@/services/auth";
import { authStore } from "@/store/auth.store";

export function HospitalLayout({ children }: { children: ReactNode }) {
  const user = getStoredUser();

  const handleLogout = () => {
    clearSession();
    authStore.logout();
  };

  return (
    <DashboardShell role="Hospital" nav={hospitalNav} user={{ name: user?.email ?? user?.phone ?? "Hospital administrator", role: "Hospital administrator" }} onLogout={handleLogout}>
      {children}
    </DashboardShell>
  );
}