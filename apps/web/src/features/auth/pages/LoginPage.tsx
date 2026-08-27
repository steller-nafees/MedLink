import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthField } from "@/shared/components/forms/AuthField";
import { AuthButton } from "@/shared/components/ui/AuthButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { accountTypes } from "@/features/auth/types";
import { getApiErrorMessage } from "@/services/api";
import { login as apiLogin } from "@/services/auth";
import { useNavigate } from "react-router-dom";

export function LoginPage({ onSignup }: { onSignup: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const login = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const user = await apiLogin({
        ...(identifier.includes("@") ? { email: identifier.trim() } : { phone: identifier.trim() }),
        password,
      });
      const role = user.userType === "HOSPITAL_ADMIN" ? "hospital" : user.userType === "AMBULANCE_ADMIN" ? "driver" : "patient";
      const token = localStorage.getItem("medlink.accessToken");
      if (!token) throw new Error("Login succeeded without an access token");
      setAuth(role, token);
      const dashboard = accountTypes.find((t) => t.id === role)?.dashboard;
      if (dashboard) navigate(dashboard);
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1 text-[11.5px] font-semibold text-primary">
        <ShieldCheck className="size-3.5" /> Secure sign in
      </span>
      <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">Welcome back</h2>
      <p className="mt-1.5 text-[13.5px] text-muted-foreground">We detect your account role automatically.</p>

      <div className="mt-7 space-y-3">
        <AuthField label="Email or phone number" placeholder="you@example.com" value={identifier} onChange={setIdentifier} />
        <AuthField label="Password" placeholder="Enter your password" type="password" value={password} onChange={setPassword} />
      </div>

      {error && <p className="mt-3 text-[13px] text-red-600" role="alert">{error}</p>}

      <div className="mt-6 space-y-3">
        <AuthButton onClick={login} disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</AuthButton>
        <button
          type="button"
          onClick={onSignup}
          className="flex w-full items-center justify-center rounded-full border border-primary/40 bg-surface py-4 text-[15px] font-semibold text-primary shadow-card transition active:scale-[0.99]"
        >
          Create Account
        </button>
      </div>
      
      <p className="mt-6 text-center text-[11.5px] text-muted-foreground">
        Emergency SOS is always available without an account.
      </p>
    </>
  );
}
