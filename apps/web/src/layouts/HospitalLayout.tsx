import type { ReactNode } from "react";
import { DashboardShell } from "@/shared/components/ui/DashboardShell";
import { hospitalNav } from "@/shared/constants/hospitalNav";
import { getStoredUser, logout } from "@/services/auth";

export function HospitalLayout({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  return (
    <DashboardShell role="Hospital" nav={hospitalNav} user={{ name: user?.email ?? user?.phone ?? "Hospital administrator", role: "Hospital administrator" }} onLogout={logout}>
      {children}
    </DashboardShell>
  );
}