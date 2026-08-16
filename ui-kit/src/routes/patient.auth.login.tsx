import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, AuthHeader, AuthField, PrimaryButton, SecondaryButton, SocialButton } from "@/components/medlink/auth/auth-kit";
import { detectRole, accountTypes } from "@/lib/medlink/auth-roles";
import { Mail, Lock, Eye, EyeOff, Siren, Globe, X } from "lucide-react";
import { GuestSosModal } from "@/components/medlink/auth/guest-sos-modal";

export const Route = createFileRoute("/patient/auth/login")({
  head: () => ({
    meta: [
      { title: "Log in · MedLink" },
      { name: "description", content: "One login for patients and ambulance drivers — MedLink detects your role automatically." },
      { property: "og:title", content: "Log in to MedLink" },
      { property: "og:description", content: "Simple, secure access to your healthcare companion." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [webNotice, setWebNotice] = useState(false);
  const [showSos, setShowSos] = useState(false);

  const submit = () => {
    const role = detectRole(identifier);
    if (role === "hospital") return setWebNotice(true);
    navigate({ to: accountTypes.find((t) => t.id === role)!.dashboard });
  };

  return (
    <AuthScreen label="Auth · Login">
      <div className="soft-in flex min-h-full flex-col px-6 pb-8">
        <AuthHeader back="/patient/auth" />

        <div className="mt-8">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            One login for patients and ambulance drivers.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <label className="block">
            <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">Email or phone number</span>
            <span className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card transition focus-within:border-primary/50">
              <Mail className="size-4 text-muted-foreground" />
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                className="w-full flex-1 bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </span>
          </label>
          <AuthField
            icon={Lock}
            label="Password"
            placeholder="Enter your password"
            type={show ? "text" : "password"}
            trailing={
              <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password">
                {show ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
              </button>
            }
          />
          <div className="text-right">
            <Link to="/patient/auth/forgot" className="text-[12.5px] font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton onClick={submit}>Login</PrimaryButton>
        </div>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <SocialButton brand="Google" />

        <button
          type="button"
          onClick={() => setShowSos(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-4 text-[15px] font-semibold text-white shadow-float transition active:scale-[0.98]"
        >
          <Siren className="size-[18px]" /> Emergency SOS
        </button>
        <p className="mt-2 text-center text-[11.5px] text-muted-foreground">No account required</p>

        <p className="mt-auto pt-6 text-center text-[13px] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/patient/auth/account-type" className="font-semibold text-primary">
            Sign Up
          </Link>
        </p>

        {webNotice && (
          <div className="absolute inset-0 z-40 flex items-end bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="soft-in w-full rounded-[28px] border border-border/70 bg-surface p-6 shadow-dialog">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-info/10 text-info">
                  <Globe className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-bold">Use the web portal</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    Hospital accounts are available on the MedLink Web Portal.
                  </p>
                </div>
                <button type="button" onClick={() => setWebNotice(false)} aria-label="Close">
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
              <div className="mt-5 space-y-2.5">
                <PrimaryButton to="/auth">Open Web Portal</PrimaryButton>
                <SecondaryButton onClick={() => setWebNotice(false)}>Not now</SecondaryButton>
              </div>
            </div>
          </div>
        )}

        {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
      </div>
    </AuthScreen>
  );
}
