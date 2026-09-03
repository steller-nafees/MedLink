import { API_BASE_URL, getAuthToken } from "./auth";

export type AmbulanceProvider = {
  id: string;
  provider_name: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

class AmbulanceRequestError extends Error {}

async function request<T>(path: string, expectArray: boolean): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const payload = await response.json().catch(() => null);

  if (
    !response.ok ||
    !payload?.success ||
    (expectArray && !Array.isArray(payload.data)) ||
    (!expectArray && !payload.data)
  ) {
    throw new AmbulanceRequestError(
      payload?.message ?? "Unable to load ambulance information right now."
    );
  }

  return payload.data as T;
}

export async function getAmbulanceProviders(): Promise<AmbulanceProvider[]> {
  const configuredId = process.env.EXPO_PUBLIC_AMBULANCE_ID;
  if (configuredId) {
    const provider = await request<AmbulanceProvider>(
      `/api/v1/ambulances/${encodeURIComponent(configuredId)}`,
      false
    );
    return [provider];
  }

  return request<AmbulanceProvider[]>(
    "/api/v1/ambulances?limit=100&offset=0&sortBy=name",
    true
  );
}

export type UpdateAmbulanceProviderRequest = {
  providerName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
};

async function requestMutation<T>(path: string, method: "PUT" | "DELETE", body?: unknown): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new AmbulanceRequestError("Your session has expired. Please log in again.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new AmbulanceRequestError(payload?.message ?? "Unable to update ambulance information.");
  }

  return payload.data as T;
}

export function updateAmbulanceProvider(
  ambulanceId: string,
  payload: UpdateAmbulanceProviderRequest,
) {
  return requestMutation<AmbulanceProvider>(
    `/api/v1/ambulances/${encodeURIComponent(ambulanceId)}`,
    "PUT",
    payload,
  );
}

export function updateMyLocation(latitude: number, longitude: number) {
  return requestMutation<{
    latitude: number;
    longitude: number;
    updated_at: string;
  }>(
    "/api/v1/users/location",
    "PUT",
    { latitude, longitude },
  );
}

export function deleteMyAccount(userId: string) {
  return requestMutation<void>(`/api/v1/users/${encodeURIComponent(userId)}`, "DELETE");
}

export async function getMyAmbulanceProvider(): Promise<AmbulanceProvider> {
  return request<AmbulanceProvider>("/api/v1/ambulances/me", false);
}