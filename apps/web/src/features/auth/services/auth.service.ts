import type { AccountRole } from "../types";

class AuthService {
  detectRole(identifier: string): AccountRole {
    const value = identifier.trim().toLowerCase();
    if (value.includes("hospital") || value.includes("clinic")) return "hospital";
    if (value.includes("driver") || value.includes("ambulance") || value.includes("emt")) return "driver";
    return "patient";
  }

  async login(identifier: string, _password?: string): Promise<{ role: AccountRole; token: string }> {
    // Simulated delay for demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    const role = this.detectRole(identifier);
    return { role, token: "demo-token" };
  }

  async register(data: any): Promise<{ role: AccountRole; token: string }> {
    // Simulated delay for demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { role: data.role || "patient", token: "demo-token" };
  }
}

export const authService = new AuthService();
