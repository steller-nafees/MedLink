import { API_BASE_URL, getAuthToken } from "./auth";

export type CreateReservationRequest = {
  medicalEventId: string;
  hospitalId: string;
  wardId: string;
  bedId?: string | null;
  reservationMode: "NORMAL" | "EMERGENCY" | "ICU";
};

export type ReservationRecord = {
  id: string;
  medical_event_id: string;
  hospital_id: string;
  ward_id: string;
  bed_id: string | null;
  reservation_mode: string;
  reservation_status: string;
};

export async function createReservation(payload: CreateReservationRequest): Promise<ReservationRecord> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Your emergency session has expired. Please start SOS again.");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: ReservationRecord;
  } | null;

  if (!response.ok || !body?.success || !body.data) {
    throw new Error(body?.message ?? "Unable to reserve this bed right now.");
  }

  return body.data;
}