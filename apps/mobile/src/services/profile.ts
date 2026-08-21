import { API_BASE_URL, getCurrentUserId } from "./auth";

export type PatientProfileResponse = {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_group: string | null;
  last_donation_date: string | null;
  is_available_for_donation: boolean | null;
};

class ProfileRequestError extends Error {}

export async function getMyProfile(): Promise<PatientProfileResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new ProfileRequestError("Your session is missing profile information. Please log in again.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success || !payload.data) {
      throw new ProfileRequestError(payload?.message ?? "Unable to load your profile right now.");
    }

    return payload.data as PatientProfileResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProfileRequestError("The profile request timed out. Please try again.");
    }

    if (error instanceof ProfileRequestError) {
      throw error;
    }

    throw new ProfileRequestError("Unable to connect to the server. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }
}
