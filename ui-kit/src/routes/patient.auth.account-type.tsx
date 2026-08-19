import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthScreen, AuthHeader, PrimaryButton, SecondaryButton } from "@/components/medlink/auth/auth-kit";
import { AccountTypeCards } from "@/components/medlink/auth/account-type-cards";
import type { AccountRole } from "@/lib/medlink/auth-roles";
import { Globe, X } from "lucide-react";

export const Route = createFileRoute("/patient/auth/account-type")({
  head: () => ({
    meta: [
      { title: "Select account type · MedLink" },
      { name: "description", content: "Choose whether you are a general user, an ambulance driver, or a hospital." },
      { property: "og:title", content: "Select your MedLink account type" },
      { property: "og:description", content: "General user, ambulance driver or hospital — pick the right account." },
    ],
  }),
  component: AccountType,
});

function AccountType() {
  const navigate = useNavigate();
  const [webNotice, setWebNotice] = useState(false);

  const select = (role: AccountRole) => {
    if (role === "hospital") return setWebNotice(true);
    navigate({ to: role === "driver" ? "/patient/auth/driver-signup" : "/patient/auth/signup" });
  };

  return (
    <AuthScreen label="Auth · Account type">
      <div className="soft-in flex min-h-full flex-col px-6 pb-8">
        <AuthHeader back="/patient/auth" />

        <div className="mt-6">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">Select account type</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Pick the option that describes you best.</p>
        </div>

        <div className="mt-6">
          <AccountTypeCards onSelect={select} showWebOnlyBadge />
        </div>

        {webNotice && (
          <div className="absolute inset-0 z-40 flex items-end bg-foreground/40 p-4 backdrop-blur-sm">
            <div className="soft-in w-full rounded-[28px] border border-border/70 bg-surface p-6 shadow-dialog">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-info/10 text-info">
                  <Globe className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-bold">Hospitals register on the web</p>
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
      </div>
    </AuthScreen>
  );
}
