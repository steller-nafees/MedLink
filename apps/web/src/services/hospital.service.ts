import type { EmergencyCase } from "@/types/hospital";

const emergencyCases: EmergencyCase[] = [];

export function getEmergencyCases(): EmergencyCase[] {
  return emergencyCases;
}

export function getOpenEmergencyCount(): number {
  return getEmergencyCases().filter(
    (emergencyCase) =>
      emergencyCase.status !== "completed" &&
      emergencyCase.status !== "arrived",
  ).length;
}