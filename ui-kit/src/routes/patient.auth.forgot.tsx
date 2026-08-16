import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, AuthHeader, AuthField, PrimaryButton, SecondaryButton, OtpInput, ProgressIndicator } from "@/components/medlink/auth/auth-kit";
import { Mail, Lock, KeyRound, Check, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/patient/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Reset your password · MedLink" },
      { name: "description", content: "Recover your MedLink account with a one-time code sent to your email or phone." },
      { property: "og:title", content: "Reset your MedLink password" },
      { property: "og:description", content: "A minimal three-step password recovery flow." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [step, setStep] = useState(0);

  return (
    <AuthScreen label="Auth · Forgot password">
      <div className="soft-in flex min-h-full flex-col px-6 pb-8">
        <AuthHeader
          back="/patient/auth/login"
          right={<ProgressIndicator total={3} current={step} />}
        />

        <div key={step} className="soft-in mt-9 flex-1">
          {step === 0 && (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-container text-primary">
                <KeyRound className="size-6" />
              </span>
              <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">Forgot password?</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Enter your email or phone number and we&apos;ll send a 5-digit verification code.
              </p>
              <div className="mt-7">
                <AuthField icon={Mail} label="Email or phone number" placeholder="you@example.com" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-container text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">Enter the code</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                We sent a 5-digit code to <span className="font-semibold text-foreground">you@example.com</span>.
              </p>
              <div className="mt-7">
                <OtpInput length={5} />
              </div>
              <p className="mt-4 text-center text-[12.5px] text-muted-foreground">
                Didn&apos;t get it? <button className="font-semibold text-primary">Resend in 0:24</button>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-container text-primary">
                <Lock className="size-6" />
              </span>
              <h1 className="mt-5 text-[28px] font-bold leading-tight tracking-tight">Set a new password</h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Choose a password you haven&apos;t used before.
              </p>
              <div className="mt-7 space-y-3">
                <AuthField icon={Lock} label="New password" placeholder="Create a password" type="password" />
                <AuthField icon={Lock} label="Confirm password" placeholder="Repeat your password" type="password" />
              </div>
              <ul className="mt-4 space-y-1.5 px-1">
                {["At least 8 characters", "One number", "One uppercase letter"].map((r) => (
                  <li key={r} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <Check className="size-3.5 text-success" /> {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mt-8 space-y-2.5">
          {step < 2 ? (
            <PrimaryButton onClick={() => setStep(step + 1)}>{step === 0 ? "Send code" : "Verify code"}</PrimaryButton>
          ) : (
            <PrimaryButton to="/patient/auth/login">Reset password</PrimaryButton>
          )}
          {step > 0 && <SecondaryButton onClick={() => setStep(step - 1)}>Back</SecondaryButton>}
          <p className="pt-1 text-center text-[13px] text-muted-foreground">
            Remembered it?{" "}
            <Link to="/patient/auth/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </AuthScreen>
  );
}
