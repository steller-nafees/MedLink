import { useSyncExternalStore } from "use-sync-external-store/shim";
import { authStore } from "@/store/auth.store";

export function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);

  return {
    ...state,
    setAuth: authStore.setAuth,
    logout: authStore.logout,
  };
}
