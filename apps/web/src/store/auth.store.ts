import type { AccountRole } from "@/features/auth/types";

type AuthState = {
  isAuthenticated: boolean;
  role: AccountRole | null;
  token: string | null;
};

// Initialize from localStorage if available
const storedRole = localStorage.getItem("medlink.role") as AccountRole | null;
const storedToken = localStorage.getItem("medlink.token");

let state: AuthState = {
  isAuthenticated: !!storedToken && !!storedRole,
  role: storedRole,
  token: storedToken,
};

const listeners = new Set<() => void>();

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  setAuth(role: AccountRole, token: string) {
    localStorage.setItem("medlink.role", role);
    localStorage.setItem("medlink.token", token);
    state = { isAuthenticated: true, role, token };
    listeners.forEach((l) => l());
  },
  logout() {
    localStorage.removeItem("medlink.role");
    localStorage.removeItem("medlink.token");
    state = { isAuthenticated: false, role: null, token: null };
    listeners.forEach((l) => l());
  },
};