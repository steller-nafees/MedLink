import { Hospital } from './data';

/** Preferred (tier A) hospitals first, then by tier, then by distance. */
export function sortHospitals(list: Hospital[]): Hospital[] {
  const tierRank = (h: Hospital) => (h.tier === 'A' ? 0 : h.tier === 'B' ? 1 : 2);
  return [...list].sort((a, b) => tierRank(a) - tierRank(b) || a.distanceKm - b.distanceKm);
}
