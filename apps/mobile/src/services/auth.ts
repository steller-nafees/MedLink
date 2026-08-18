import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

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

export async function saveAuthToken(accessToken: string) {
  if (!accessToken || typeof accessToken !== "string") {
    throw new AuthRequestError("No valid token returned from the signup API.", 500, "NO_TOKEN");
  }

  await AsyncStorage.setItem("medlink_token", accessToken);
}
