import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, AuthHeader, AuthField, AuthSelect, PrimaryButton } from "@/components/medlink/auth/auth-kit";
import { ambulanceTypes } from "@/lib/medlink/auth-roles";
import { User, Phone, Mail, Lock, Check, Ambulance, IdCard } from "lucide-react";

export const Route = createFileRoute("/patient/auth/driver-signup")({
  head: () => ({
    meta: [
      { title: "Create an ambulance driver account · MedLink" },
      { name: "description", content: "Register as a MedLink ambulance driver with your vehicle registration and ambulance type." },
      { property: "og:title", content: "Ambulance driver sign up · MedLink" },
      { property: "og:description", content: "Receive dispatches and coordinate patient transportation with MedLink." },
    ],
  }),
  component: DriverSignup,
});

function DriverSignup() {
  const [done, setDone] = useState(false);
  const [type, setType] = useState<string>(ambulanceTypes[0]);

  return (
    <AuthScreen label="Auth · Driver sign up">
      <div className="soft-in flex min-h-full flex-col px-6 pb-8">
        <AuthHeader back="/patient/auth/account-type" />

        {done ? (
          <div className="soft-in flex flex-1 flex-col items-center justify-center text-center">
            <span className="grid size-20 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-9" />
            </span>
            <h1 className="mt-6 text-[26px] font-bold tracking-tight">Driver account created</h1>
            <p className="mt-2 max-w-[260px] text-[13.5px] text-muted-foreground">
              Your ambulance is registered. You can start receiving emergency requests.
            </p>
            <div className="mt-8 w-full">
              <PrimaryButton to="/ambulance">Open driver dashboard</PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <span className="text-[12px] font-bold uppercase tracking-widest text-primary">🚑 Ambulance Driver</span>
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">Register your ambulance</h1>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">Your details and vehicle information.</p>
            </div>

            <div className="mt-7 space-y-3">
              <AuthField icon={User} label="Full name" placeholder="Abdul Karim" />
              <AuthField icon={Phone} label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
              <AuthField icon={Mail} label="Email" placeholder="driver@example.com" type="email" />
              <AuthField icon={Lock} label="Password" placeholder="Create a password" type="password" />
              <AuthField icon={Lock} label="Confirm Password" placeholder="Confirm your password" type="password" />
            </div>

            <p className="mt-7 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
              Vehicle information
            </p>
            <div className="mt-3 space-y-3">
              <AuthField icon={IdCard} label="Vehicle registration number" placeholder="Dhaka Metro Cha 11-1111" />
              <AuthSelect icon={Ambulance} label="Ambulance type" options={ambulanceTypes} value={type} onChange={setType} />
            </div>

            <div className="mt-auto pt-8 space-y-2.5">
              <PrimaryButton onClick={() => setDone(true)}>Create Driver Account</PrimaryButton>
              <p className="pt-1 text-center text-[13px] text-muted-foreground">
                Already have an account?{" "}
                <Link to="/patient/auth/login" className="font-semibold text-primary">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </AuthScreen>
  );
}
