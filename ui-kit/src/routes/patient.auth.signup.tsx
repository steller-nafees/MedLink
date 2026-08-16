import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, AuthHeader, AuthField, AuthSelect, PrimaryButton } from "@/components/medlink/auth/auth-kit";
import { bloodGroups } from "@/lib/medlink/blood";
import { User, Phone, Mail, Lock, Check, Droplet, Siren, VenusAndMars } from "lucide-react";
import { GuestSosModal } from "@/components/medlink/auth/guest-sos-modal";

export const Route = createFileRoute("/patient/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create your MedLink account" },
      { name: "description", content: "Create a MedLink general user account with your name, phone, email and password." },
      { property: "og:title", content: "Create your MedLink account" },
      { property: "og:description", content: "A short, simple sign up for everyday care and emergencies." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const [done, setDone] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string>(bloodGroups[0]);
  const [gender, setGender] = useState("");

  return (
    <AuthScreen label="Auth · Sign up">
      <div className="soft-in flex min-h-full flex-col px-6 pb-8">
        <AuthHeader back="/patient/auth/account-type" />

        {done ? (
          <div className="soft-in flex flex-1 flex-col items-center justify-center text-center">
            <span className="grid size-20 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-9" />
            </span>
            <h1 className="mt-6 text-[26px] font-bold tracking-tight">Account created</h1>
            <p className="mt-2 max-w-[260px] text-[13.5px] text-muted-foreground">
              You&apos;re all set. MedLink is ready for everyday care and emergencies.
            </p>
            <div className="mt-8 w-full">
              <PrimaryButton to="/patient">Enter MedLink</PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <span className="text-[12px] font-bold uppercase tracking-widest text-primary">👤 General User</span>
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">Create your account</h1>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">Takes less than a minute.</p>
            </div>

            <div className="mt-7 space-y-3">
              <AuthField icon={User} label="Full name" placeholder="Shirley Rahman" />
              <AuthField icon={Phone} label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
              <AuthField icon={Mail} label="Email" placeholder="you@example.com" type="email" />
              <AuthSelect icon={VenusAndMars} label="Gender (required)" options={["Select gender", "Female", "Male", "Non-binary", "Prefer not to say"]} value={gender || "Select gender"} onChange={(value) => setGender(value === "Select gender" ? "" : value)} />
              <AuthField icon={Lock} label="Password" placeholder="Create a password" type="password" />
              <AuthField icon={Lock} label="Confirm Password" placeholder="Confirm your password" type="password" />
              <AuthSelect icon={Droplet} label="Blood group" options={bloodGroups} value={bloodGroup} onChange={setBloodGroup} />
            </div>

            <div className="mt-auto pt-8 space-y-2.5">
              <PrimaryButton onClick={() => setDone(true)} disabled={!gender}>Create Account</PrimaryButton>
              <button
                type="button"
                onClick={() => setShowSos(true)}
                className="flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-4 text-[15px] font-semibold text-white shadow-float transition active:scale-[0.98]"
              >
                <Siren className="size-[18px]" /> Emergency SOS
              </button>
              <p className="pt-1 text-center text-[13px] text-muted-foreground">
                Already have an account?{" "}
                <Link to="/patient/auth/login" className="font-semibold text-primary">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}

        {showSos && <GuestSosModal onClose={() => setShowSos(false)} />}
      </div>
    </AuthScreen>
  );
}
