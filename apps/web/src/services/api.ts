import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
	const accessToken = localStorage.getItem("medlink.accessToken");
	if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("medlink.accessToken");
			localStorage.removeItem("medlink.user");
		}
		return Promise.reject(error);
	},
);

export function getApiErrorMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.message ?? error.message;
	}
	return error instanceof Error ? error.message : "Something went wrong";
}
