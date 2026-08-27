import { api } from "./api";

export type AuthUser = {
	userId: string;
	email?: string;
	phone?: string;
	userType: string;
	profileComplete?: boolean;
};

type LoginPayload = { email?: string; phone?: string; password: string };
type LoginResponse = { token: { accessToken: string }; data: AuthUser };

export async function login(payload: LoginPayload) {
	const { data } = await api.post<LoginResponse>("/auth/login", payload);
	if (data.data.userType !== "HOSPITAL_ADMIN") {
		throw new Error("This account is not a hospital administrator");
	}
	localStorage.setItem("medlink.accessToken", data.token.accessToken);
	localStorage.setItem("medlink.user", JSON.stringify(data.data));
	return data.data;
}

export function getStoredUser(): AuthUser | null {
	const value = localStorage.getItem("medlink.user");
	if (!value) return null;
	try {
		return JSON.parse(value) as AuthUser;
	} catch {
		return null;
	}
}

export function logout() {
	localStorage.removeItem("medlink.accessToken");
	localStorage.removeItem("medlink.user");
}
