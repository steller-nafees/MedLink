import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const SOS_API_BASE_URL =
  (process.env.EXPO_PUBLIC_SOS_API_URL ?? API_BASE_URL).replace(/\/+$/, "");

const USER_ID_STORAGE_KEY = "medlink_user_id";

export type SignupRequest = {
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationalId?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
};

export type SignupResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    userId: string;
    email: string;
    phone: string;
    userType: string;
    createdAt: string;
  };
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export type LoginRequest = {
  email?: string;
  phone?: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    userId: string;
    email: string | null;
    phone: string | null;
    userType: string;
    profileComplete: boolean;
    lastLogin: string | null;
  };
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export type EmergencyLoginRequest = {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
};

export type EmergencyLoginResponse = {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    userId: string;
    name: string;
    phone: string;
    roleType: string;
    latitude: number;
    longitude: number;
    isEmergency: true;
    isNewEmergencyUser: boolean;
    temporaryPassword: string | null;
  };
  token: {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
};

export class AuthRequestError extends Error {
  statusCode?: number;
  errorCode?: string;

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message);
    this.name = "AuthRequestError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function signUpCustomer(payload: SignupRequest): Promise<SignupResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        password: payload.password,
        userType: "CUSTOMER",
        ...(payload.firstName ? { firstName: payload.firstName.trim() } : {}),
        ...(payload.lastName ? { lastName: payload.lastName.trim() } : {}),
        ...(payload.gender ? { gender: payload.gender } : {}),
        ...(payload.dateOfBirth ? { dateOfBirth: payload.dateOfBirth.trim() } : {}),
        ...(payload.nationalId ? { nationalId: payload.nationalId.trim() } : {}),
        ...(payload.address ? { address: payload.address.trim() } : {}),
        ...(payload.emergencyContactName
          ? { emergencyContactName: payload.emergencyContactName.trim() }
          : {}),
        ...(payload.emergencyContactPhone
          ? { emergencyContactPhone: payload.emergencyContactPhone.trim() }
          : {}),
        ...(payload.bloodGroup ? { bloodGroup: payload.bloodGroup } : {}),
      }),
      signal: controller.signal,
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Unable to create your account right now.";
      const errorCode =
        typeof data?.errorCode === "string" ? data.errorCode : undefined;

      throw new AuthRequestError(message, response.status, errorCode);
    }

    if (!data?.success || !data?.token?.accessToken) {
      throw new AuthRequestError(
        data?.message ?? "Unable to create your account right now.",
        data?.statusCode ?? 500,
        data?.errorCode
      );
    }

    return data as SignupResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthRequestError(
        "The request timed out. Please try again.",
        408,
        "REQUEST_TIMEOUT"
      );
    }

    if (error instanceof AuthRequestError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new AuthRequestError(
        "Network connection failed. Please check your internet connection and try again.",
        0,
        "NETWORK_ERROR"
      );
    }

    throw new AuthRequestError(
      "Something went wrong while creating your account.",
      500,
      "UNKNOWN_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loginCustomer(payload: LoginRequest): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
        ...(payload.phone ? { phone: payload.phone.trim() } : {}),
        password: payload.password,
      }),
      signal: controller.signal,
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Unable to log in right now.";
      const errorCode =
        typeof data?.errorCode === "string" ? data.errorCode : undefined;

      throw new AuthRequestError(message, response.status, errorCode);
    }

    if (!data?.success || !data?.token?.accessToken) {
      throw new AuthRequestError(
        data?.message ?? "Unable to log in right now.",
        data?.statusCode ?? 500,
        data?.errorCode
      );
    }

    return data as LoginResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthRequestError(
        "The request timed out. Please try again.",
        408,
        "REQUEST_TIMEOUT"
      );
    }

    if (error instanceof AuthRequestError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new AuthRequestError(
        "Network connection failed. Please check your internet connection and try again.",
        0,
        "NETWORK_ERROR"
      );
    }

    throw new AuthRequestError(
      "Something went wrong while logging in.",
      500,
      "UNKNOWN_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Starts the backend's guest emergency session and returns its access token. */
export async function startEmergencySession(
  payload: EmergencyLoginRequest
): Promise<EmergencyLoginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${SOS_API_BASE_URL}/api/v1/auth/emergency-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        latitude: payload.latitude,
        longitude: payload.longitude,
      }),
      signal: controller.signal,
    });

    const data = await parseJsonResponse(response);

    if (!response.ok || !data?.success || !data?.token?.accessToken) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Unable to start the emergency session right now.";
      throw new AuthRequestError(message, response.status, data?.errorCode);
    }

    return data as EmergencyLoginResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthRequestError("The emergency request timed out. Please try again.", 408, "REQUEST_TIMEOUT");
    }
    if (error instanceof AuthRequestError) throw error;
    if (error instanceof TypeError) {
      throw new AuthRequestError(
        "Network connection failed. Please check your internet connection and try again.",
        0,
        "NETWORK_ERROR"
      );
    }
    throw new AuthRequestError("Unable to start the emergency session right now.", 500, "UNKNOWN_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function saveAuthToken(accessToken: string, userId?: string) {
  if (!accessToken || typeof accessToken !== "string") {
    throw new AuthRequestError("No valid token returned from the authentication API.", 500, "NO_TOKEN");
  }

  await AsyncStorage.setItem("medlink_token", accessToken);

  if (userId) {
    await AsyncStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }
}

export async function getCurrentUserId() {
  return AsyncStorage.getItem(USER_ID_STORAGE_KEY);
}

export async function getAuthToken() {
  return AsyncStorage.getItem("medlink_token");
}
