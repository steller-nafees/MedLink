import { useState, type KeyboardEvent } from "react";
import { AuthField } from "@/shared/components/forms/AuthField";
import { AuthButton } from "@/shared/components/ui/AuthButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/services/api";
import { login as apiLogin, logout as clearApiAuth } from "@/services/auth";
import { useNavigate } from "react-router-dom";

const WEB_DASHBOARDS: Record<string, string> = {
  HOSPITAL_ADMIN: "/hospital",
  SUPER_ADMIN: "/admin",
};

const MOBILE_ONLY_TYPES = new Set(["CUSTOMER", "AMBULANCE_ADMIN"]);

type LoginFormProps = {
  onMobileAppRequired: () => void;
};

export function LoginForm({ onMobileAppRequired }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuth, logout } = useAuth();
  const navigate = useNavigate();

  const login = async () => {
    if (!identifier.trim() || !password) {
      setError("Please enter your email or phone and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const user = await apiLogin({
        ...(identifier.includes("@") ? { email: identifier.trim() } : { phone: identifier.trim() }),
        password,
      });

      const token = localStorage.getItem("medlink.accessToken");
      if (!token) throw new Error("Login succeeded without an access token");

      if (MOBILE_ONLY_TYPES.has(user.userType)) {
        clearApiAuth();
        logout();
        onMobileAppRequired();
        return;
      }

      const dashboard = WEB_DASHBOARDS[user.userType];
      if (!dashboard) {
        clearApiAuth();
        logout();
        setError("This account type is not supported on the web app.");
        return;
      }

      const role = user.userType === "HOSPITAL_ADMIN" ? "hospital" : "admin";
      setAuth(role, token);
      navigate(dashboard);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") login();
  };

  return (
    <div className="auth-form-panel" onKeyDown={handleKeyDown}>
      <p className="auth-form-lede">Sign in with your hospital or admin credentials.</p>

      <div className="auth-form-fields">
        <AuthField
          label="Email or phone number"
          placeholder="you@example.com"
          value={identifier}
          onChange={setIdentifier}
        />
        <AuthField
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={setPassword}
        />
      </div>

      {error && (
        <p className="auth-form-error" role="alert">
          {error}
        </p>
      )}

      <AuthButton onClick={login} disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </AuthButton>
    </div>
  );
}
