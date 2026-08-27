import { useState } from "react";
import { ArrowLeft, Stethoscope, Ambulance, Building2 } from "lucide-react";
import { AccountTypeCards } from "@/features/auth/components/AccountTypeCards";
import { AuthField } from "@/shared/components/forms/AuthField";
import { AuthSelect } from "@/shared/components/forms/AuthSelect";
import { AuthFileField } from "@/shared/components/forms/AuthFileField";
import { AuthButton } from "@/shared/components/ui/AuthButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/auth.service";
import { accountTypes, ambulanceTypes, hospitalTypes, bloodGroups, type AccountRole } from "@/features/auth/types";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";

type Mode = "choose" | "form";

export function SignupPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [role, setRole] = useState<AccountRole>("patient");
  const [ambType, setAmbType] = useState<string>(ambulanceTypes[0]);
  const [hospType, setHospType] = useState<string>(hospitalTypes[0]);
  const [bloodGroup, setBloodGroup] = useState<string>(bloodGroups[0]);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const register = async () => {
    const { role: newRole, token } = await authService.register({ role });
    setAuth(newRole, token);
    const dashboard = accountTypes.find((t) => t.id === newRole)?.dashboard;
    if (dashboard) {
      navigate(dashboard);
    }
  };

  const RoleIcon = role === "hospital" ? Building2 : role === "driver" ? Ambulance : Stethoscope;

  return (
    <>
      {mode === "choose" && (
        <>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to login
          </button>
          <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">Select account type</h2>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Choose the option that describes you best.</p>
          <AccountTypeCards
            className="mt-6"
            selected={role}
            onSelect={(r) => {
              setRole(r);
              setMode("form");
            }}
          />
        </>
      )}

      {mode === "form" && (
        <>
          <button
            type="button"
            onClick={() => setMode("choose")}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Change account type
          </button>

          <div className="mt-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary-container text-primary">
              <RoleIcon className="size-5" />
            </span>
            <div>
              <p className="text-[17px] font-bold leading-tight">
                {accountTypes.find((t) => t.id === role)!.label}
              </p>
              <p className="text-[12.5px] text-muted-foreground">Fill in a few details to get started.</p>
            </div>
          </div>

          <div className={cn("mt-7 space-y-3")}>
            {role === "hospital" ? (
              <>
                <AuthField label="Hospital name" placeholder="United Care Hospital" />
                <AuthSelect label="Hospital type" options={hospitalTypes} value={hospType} onChange={setHospType} />
                <AuthField label="Contact person" placeholder="Dr. Nadia Rahman" />
                <AuthField label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
                <AuthField label="Email" placeholder="admin@hospital.com" type="email" />
                <AuthField label="Password" placeholder="Create a password" type="password" />
                <AuthField label="Confirm password" placeholder="Re-enter your password" type="password" />
                <p className="pt-2 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                  Legal documents
                </p>
                <AuthFileField
                  label="Hospital licence & registration documents"
                  hint="PDF, JPG or PNG · up to 5 files"
                />
              </>
            ) : (
              <>
                <AuthField label="Full name" placeholder={role === "driver" ? "Abdul Karim" : "Shirley Rahman"} />
                <AuthField label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
                <AuthField label="Email" placeholder="you@example.com" type="email" />
                <AuthField label="Password" placeholder="Create a password" type="password" />
                <AuthField label="Confirm password" placeholder="Re-enter your password" type="password" />
                {role === "patient" && (
                  <AuthSelect label="Blood group" options={bloodGroups} value={bloodGroup} onChange={setBloodGroup} />
                )}
                {role === "driver" && (
                  <>
                    <p className="pt-2 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                      Vehicle information
                    </p>
                    <AuthField label="Vehicle registration number" placeholder="Dhaka Metro Cha 11-1111" />
                    <AuthSelect label="Ambulance type" options={ambulanceTypes} value={ambType} onChange={setAmbType} />
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-6">
            <AuthButton onClick={register}>
              {role === "hospital" ? "Register Hospital" : role === "driver" ? "Create Driver Account" : "Create Account"}
            </AuthButton>
          </div>
        </>
      )}

      <p className="mt-6 text-center text-[11.5px] text-muted-foreground">
        Emergency SOS is always available without an account.
      </p>
    </>
  );
}
