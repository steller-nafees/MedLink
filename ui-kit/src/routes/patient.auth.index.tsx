import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen } from "@/components/medlink/auth/auth-kit";
import { GuestSosModal } from "@/components/medlink/auth/guest-sos-modal";
import { Siren } from "lucide-react";
import medlinkFullLogo from "@/assets/medlink_full.png";

export const Route = createFileRoute("/patient/auth/")({
  head: () => ({
    meta: [
      { title: "Welcome to MedLink · Sign in or get emergency help" },
      { name: "description", content: "Sign in to MedLink, create an account, or launch Emergency SOS instantly." },
      { property: "og:title", content: "Welcome to MedLink" },
      { property: "og:description", content: "Your healthcare companion for everyday care and emergencies." },
    ],
  }),
  component: AuthLanding,
});

function AuthLanding() {
  const [showSos, setShowSos] = useState(false);
  return (
    <AuthScreen label="Auth · Welcome">
      <div className="soft-in flex min-h-full flex-col px-7 pb-10 pt-6">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <img
            src={medlinkFullLogo}
            alt="MedLink logo"
            className="w-[300px] max-w-[80%] select-none"
            draggable={false}
          />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowSos(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-4 text-[15px] font-semibold text-white shadow-float transition active:scale-[0.98]"
          >
            <Siren className="size-[18px]" />
            Emergency SOS
          </button>

          <Link
            to="/patient/auth/login"
            className="flex w-full items-center justify-center rounded-full gradient-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-float transition active:scale-[0.98]"
          >
            Log In
          </Link>

          <Link
            to="/patient/auth/account-type"
            className="flex w-full items-center justify-center rounded-full border border-primary/40 bg-surface py-4 text-[15px] font-semibold text-primary shadow-card transition active:scale-[0.98]"
          >
            Create Account
          </Link>

          <p className="pt-1 text-center text-[11.5px] text-muted-foreground">
            Emergency SOS works without an account.
          </p>
        </div>

        {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
      </div>
    </AuthScreen>
  );
}
