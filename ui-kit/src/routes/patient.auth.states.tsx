import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen, AuthHeader, StatePanel, PrimaryButton, SecondaryButton, OtpInput } from "@/components/medlink/auth/auth-kit";
import { Loader2, WifiOff, TriangleAlert, ShieldCheck, Inbox, Siren } from "lucide-react";

export const Route = createFileRoute("/patient/auth/states")({
  head: () => ({
    meta: [
      { title: "Auth states · MedLink design system" },
      { name: "description", content: "Loading, offline, error, empty and OTP verification states for MedLink authentication." },
      { property: "og:title", content: "MedLink auth states" },
      { property: "og:description", content: "Consistent loading, offline, error and verification states." },
    ],
  }),
  component: States,
});

function States() {
  return (
    <AuthScreen label="Auth · States">
      <div className="soft-in flex min-h-full flex-col px-5 pb-8">
        <AuthHeader back="/patient/auth" />
        <h1 className="mt-6 px-1 text-[26px] font-bold tracking-tight">System states</h1>
        <p className="mt-1 px-1 text-[13px] text-muted-foreground">Loading, connectivity, errors and verification.</p>

        <div className="mt-6 space-y-4">
          <StatePanel
            icon={Loader2}
            spinning
            title="Signing you in"
            description="Securing your session and syncing your medical profile."
          />

          <div className="rounded-[28px] border border-border/70 bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-container text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-[14.5px] font-bold">Verify it&apos;s you</p>
                <p className="text-[12px] text-muted-foreground">Code sent to +880 17XX-XXXXXX</p>
              </div>
            </div>
            <div className="mt-4">
              <OtpInput length={5} value="418" />
            </div>
            <div className="mt-4">
              <PrimaryButton>Verify</PrimaryButton>
            </div>
          </div>

          <StatePanel
            icon={WifiOff}
            tone="muted"
            title="No internet connection"
            description="Emergency SOS still works over your carrier network."
            action={
              <div className="space-y-2.5">
                <SecondaryButton>Try again</SecondaryButton>
                <PrimaryButton tone="emergency" to="/patient/sos" search={{ guest: "1" }}>
                  <Siren className="size-4" /> Emergency SOS
                </PrimaryButton>
              </div>
            }
          />

          <StatePanel
            icon={TriangleAlert}
            tone="emergency"
            title="Something went wrong"
            description="We couldn't verify your credentials. Please check and try again."
            action={<SecondaryButton>Retry</SecondaryButton>}
          />

          <StatePanel
            icon={Inbox}
            tone="muted"
            title="Nothing here yet"
            description="Once you sign in, your appointments and records will appear here."
            action={<PrimaryButton to="/patient/auth/signup">Create Account</PrimaryButton>}
          />
        </div>
      </div>
    </AuthScreen>
  );
}
