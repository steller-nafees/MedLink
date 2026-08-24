import { API_BASE_URL, getAuthToken } from "./auth";

export type AiMedicalConsultRequest = {
  userDescription: string;
  latitude: number;
  longitude: number;
  isEmergency: boolean;
};

export type AiMedicalResponse = {
  id: string;
  medical_event_id: string;
  summary: string;
  possible_conditions: string;
  tags: string;
  first_aid: string;
  created_at: string;
};

export type MedicalConsultResult = {
  event: {
    id: string;
    user_id: string;
    user_description: string;
    event_location_latitude: number;
    event_location_longitude: number;
    severity: string;
    event_status: string;
    is_emergency: boolean;
    created_at: string;
    updated_at: string;
  };
  aiResponse: AiMedicalResponse;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: MedicalConsultResult;
};

export class AiMedicalRequestError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = "AiMedicalRequestError";
  }
}

export async function consultMedicalCondition(
  payload: AiMedicalConsultRequest,
): Promise<MedicalConsultResult> {
  const token = await getAuthToken();

  if (!token) {
    throw new AiMedicalRequestError("Your session has expired. Please log in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai-medical/consult`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as ApiResponse | null;

    if (!response.ok || !body?.success || !body.data) {
      throw new AiMedicalRequestError(
        body?.message ?? "Unable to assess this emergency right now.",
        response.status,
      );
    }

    return body.data;
  } catch (error) {
    if (error instanceof AiMedicalRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiMedicalRequestError("The medical assessment timed out. Please try again.", 408);
    }

    throw new AiMedicalRequestError("Unable to connect to the emergency service. Please try again.");
  } finally {
    clearTimeout(timeoutId);
  }
}
