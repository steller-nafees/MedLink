import { API_BASE_URL, getAuthToken } from "./auth";

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

export type CompleteProfileRequest = {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  nationalId: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
};

class ProfileRequestError extends Error {}

export async function getMyProfile(): Promise<PatientProfileResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new ProfileRequestError("Your session has expired. Please log in again.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

export async function completeMyProfile(payload: CompleteProfileRequest): Promise<void> {
  const token = await getAuthToken();
  if (!token) throw new ProfileRequestError("Your session has expired. Please log in again.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      throw new ProfileRequestError(data?.message ?? "Unable to save your profile right now.");
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProfileRequestError("The profile request timed out. Please try again.");
    }
    if (error instanceof ProfileRequestError) throw error;
    throw new ProfileRequestError("Unable to connect to the server. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }
}
