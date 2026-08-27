import { API_BASE_URL, getAuthToken } from "./auth";

export type HospitalStatus = "OPEN" | "CLOSED" | string;

export type Hospital = {
  id: string;
  hospital_name: string;
  license_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  hospital_status: HospitalStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type NearbyHospital = Hospital & {
  distance_km: number;
};

export type HospitalWard = {
  id: string;
  ward_name: string;
  description: string | null;
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  reserved_beds: number;
  maintenance_beds: number;
};

export type HospitalDetail = Hospital & {
  wards: HospitalWard[];
  beds: Array<{
    id: string;
    ward_id: string;
    bed_number: string;
    bed_status: string;
    created_at: string;
    updated_at: string;
  }>;
  icu: {
    totalBeds: number;
    availableBeds: number;
    occupiedBeds: number;
    reservedBeds: number;
    maintenanceBeds: number;
    wards: HospitalWard[];
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
};

export class HospitalRequestError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "HospitalRequestError";
  }
}

async function request<T>(path: string): Promise<T> {
  const token = await getAuthToken();

  if (!token) {
    throw new HospitalRequestError("Your session has expired. Please log in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      throw new HospitalRequestError(payload?.message ?? "Unable to load hospitals right now.", response.status);
    }

    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HospitalRequestError("The hospital request timed out. Please try again.", 408);
    }
    if (error instanceof HospitalRequestError) throw error;
    throw new HospitalRequestError("Unable to connect to the server. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getHospitals() {
  return request<Hospital[]>("/api/v1/hospitals?limit=100&offset=0&sortBy=name");
}

export function getNearbyHospitals(latitude: number, longitude: number, radius = 100) {
  return request<NearbyHospital[]>(
    `/api/v1/hospitals/nearby?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&radius=${encodeURIComponent(radius)}`,
  );
}

export function getHospitalById(hospitalId: string) {
  return request<HospitalDetail>(`/api/v1/hospitals/${encodeURIComponent(hospitalId)}`);
}
