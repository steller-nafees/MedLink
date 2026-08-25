import { API_BASE_URL, getAuthToken } from "./auth";

type ApiListResponse<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T[];
};

export type Reservation = {
  id: string;
  medical_event_id: string | null;
  user_id: string;
  hospital_id: string;
  hospital_name: string;
  ward_id: string | null;
  ward_name: string | null;
  bed_id: string | null;
  bed_number: string | null;
  reservation_mode: string;
  reservation_status: string;
  requested_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MedicalEvent = {
  id: string;
  user_id: string;
  user_description: string | null;
  event_location_latitude: number | null;
  event_location_longitude: number | null;
  severity: string | null;
  event_status: string;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

export class PatientRecordsRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PatientRecordsRequestError";
    this.status = status;
  }
}

async function requestList<T>(path: string): Promise<T[]> {
  const token = await getAuthToken();

  if (!token) {
    throw new PatientRecordsRequestError("You need to sign in again before viewing these records.", 401);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    let body: ApiListResponse<T> | null = null;

    try {
      body = (await response.json()) as ApiListResponse<T>;
    } catch {
      body = null;
    }

    if (!response.ok) {
      throw new PatientRecordsRequestError(
        body?.message ?? "Could not load records right now.",
        response.status,
      );
    }

    return Array.isArray(body?.data) ? body.data : [];
  } catch (error) {
    if (error instanceof PatientRecordsRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new PatientRecordsRequestError("The request timed out. Please try again.");
    }

    throw new PatientRecordsRequestError(
      error instanceof Error ? error.message : "Could not connect to the backend.",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getReservations(): Promise<Reservation[]> {
  return requestList<Reservation>("/api/v1/reservations");
}

export function getMedicalEvents(): Promise<MedicalEvent[]> {
  return requestList<MedicalEvent>("/api/v1/events?limit=100");
}
