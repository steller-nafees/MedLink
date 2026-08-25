import type { ReactNode } from "react";
import { DashboardShell } from "@/shared/components/ui/DashboardShell";
import { hospitalNav, hospitalUser } from "@/shared/constants/hospitalNav";

export function HospitalLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="Hospital" nav={hospitalNav} user={hospitalUser}>
      {children}
    </DashboardShell>
  );
}