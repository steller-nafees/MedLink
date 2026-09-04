import { API_BASE_URL, getAuthToken } from './auth';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export type BloodDonor = {
  donor_id: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  address: string | null;
  blood_group: BloodGroup;
  last_donation_date: string | null;
  can_donate: boolean;
  next_available_date: string | null;
  is_available_for_donation?: boolean;
  distance_km?: number | null;
};

export type BloodDonorList = {
  donors: BloodDonor[];
  pagination: { total: number; limit: number; offset: number };
};

class BloodRequestError extends Error {}

async function request<T>(path: string): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new BloodRequestError('Your session has expired. Please log in again.');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success || payload.data === undefined) {
      throw new BloodRequestError(payload?.message ?? 'Unable to load blood donors right now.');
    }
    return payload.data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new BloodRequestError('The donor request timed out. Please try again.');
    if (error instanceof BloodRequestError) throw error;
    throw new BloodRequestError('Unable to connect to the server. Please try again.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getBloodDonors(params: { bloodGroup?: BloodGroup; limit?: number; offset?: number; radius?: number } = {}): Promise<BloodDonorList> {
  const query = new URLSearchParams();
  if (params.bloodGroup) query.set('bloodGroup', params.bloodGroup);
  query.set('limit', String(params.limit ?? 20));
  query.set('offset', String(params.offset ?? 0));
  if (params.radius !== undefined) query.set('radius', String(params.radius));
  return request<BloodDonorList>(`/api/v1/blood/donors?${query.toString()}`);
}

export function getBloodDonor(donorId: string): Promise<BloodDonor> {
  return request<BloodDonor>(`/api/v1/blood/donors/${encodeURIComponent(donorId)}`);
}