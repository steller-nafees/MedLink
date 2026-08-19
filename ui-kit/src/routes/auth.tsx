import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AccountTypeCards } from "@/components/medlink/auth/account-type-cards";
import { accountTypes, ambulanceTypes, hospitalTypes, detectRole, type AccountRole } from "@/lib/medlink/auth-roles";
import { Logo } from "@/components/medlink/logo";
import { cn } from "@/lib/utils";
import { bloodGroups } from "@/lib/medlink/blood";
import { Siren, ArrowLeft, ShieldCheck, Stethoscope, Ambulance, Building2, MapPin, LocateFixed, X, Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "MedLink Web Portal — Sign in or create an account" },
      { name: "description", content: "One portal for patients, ambulance drivers and hospitals. Emergency SOS works without an account." },
      { property: "og:title", content: "MedLink Web Portal" },
      { property: "og:description", content: "Sign in or register as a patient, ambulance driver or hospital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WebAuth,
});

type Mode = "login" | "choose" | "form";
type LocationMode = "manual" | "auto";

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[14.5px] text-foreground shadow-card outline-none transition placeholder:text-muted-foreground focus:border-primary/50"
      />
    </label>
  );
}

function Select({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[14.5px] text-foreground shadow-card outline-none transition focus:border-primary/50"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileField({ label, hint }: { label: string; hint?: string }) {
  const [files, setFiles] = useState<string[]>([]);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">{label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-4 shadow-card transition hover:border-primary/50">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
          <Upload className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-foreground">
            {files.length ? files.join(", ") : "Upload documents"}
          </span>
          {hint && <span className="block text-[12px] text-muted-foreground">{hint}</span>}
        </span>
      </span>
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
    </label>
  );
}



function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-float transition active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
    >
      {children}
    </button>
  );
}

function GuestSosModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("auto");
  const [manualLocation, setManualLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Location isn't available on this device. Enter it manually instead.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocateError("Couldn't get your location. Allow location access or enter it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasLocation = locationMode === "auto" ? !!coords : manualLocation.trim().length > 0;
  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && hasLocation;

  const submit = () => {
    navigate({
      to: "/patient/sos",
      search: {
        guest: true,
        name: name.trim(),
        phone: phone.trim(),
        ...(locationMode === "auto" && coords
          ? { lat: String(coords.lat), lng: String(coords.lng) }
          : { location: manualLocation.trim() }),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-10 sm:items-center sm:p-6">
      <div className="w-full max-w-[420px] rounded-[28px] border border-border/70 bg-surface p-6 shadow-dialog">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl gradient-emergency text-white">
              <Siren className="size-5" />
            </span>
            <div>
              <p className="text-[17px] font-bold leading-tight">Emergency SOS</p>
              <p className="text-[12.5px] text-muted-foreground">Quick details so help can reach you.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-surface-variant"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <Field label="Full name" placeholder="Your name" value={name} onChange={setName} />
          <Field label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" value={phone} onChange={setPhone} />

          <div>
            <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">Location</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocationMode("auto")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-[12.5px] font-semibold transition",
                  locationMode === "auto"
                    ? "border-primary/50 bg-primary-container text-primary"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                <LocateFixed className="size-3.5" /> Use my location
              </button>
              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-[12.5px] font-semibold transition",
                  locationMode === "manual"
                    ? "border-primary/50 bg-primary-container text-primary"
                    : "border-border bg-surface text-muted-foreground"
                )}
              >
                <MapPin className="size-3.5" /> Enter manually
              </button>
            </div>

            {locationMode === "auto" ? (
              <div className="mt-3 rounded-2xl border border-border bg-surface-variant px-4 py-3.5">
                {coords ? (
                  <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                    <LocateFixed className="size-4 text-primary" />
                    Location detected ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    className="flex items-center gap-2 text-[13px] font-semibold text-primary"
                  >
                    {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                    {locating ? "Detecting your location…" : "Tap to detect my location"}
                  </button>
                )}
                {locateError && <p className="mt-2 text-[12px] text-destructive">{locateError}</p>}
              </div>
            ) : (
              <div className="mt-3">
                <Field
                  label=""
                  placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                  value={manualLocation}
                  onChange={setManualLocation}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Primary onClick={submit} disabled={!canSubmit}>
            Request ambulance
          </Primary>
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          You're continuing as a guest. Create an account anytime to track this request and save your details.
        </p>
      </div>
    </div>
  );
}

function WebAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<AccountRole>("patient");
  const [identifier, setIdentifier] = useState("");
  const [ambType, setAmbType] = useState<string>(ambulanceTypes[0]);
  const [hospType, setHospType] = useState<string>(hospitalTypes[0]);
  const [bloodGroup, setBloodGroup] = useState<string>(bloodGroups[0]);
  const [showSos, setShowSos] = useState(false);

  const login = () => {
    const detected = detectRole(identifier);
    navigate({ to: accountTypes.find((t) => t.id === detected)!.dashboard });
  };

  const register = () => navigate({ to: accountTypes.find((t) => t.id === role)!.dashboard });

  const RoleIcon = role === "hospital" ? Building2 : role === "driver" ? Ambulance : Stethoscope;

  return (
    <div className="min-h-screen gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setShowSos(true)}
          className="flex items-center gap-2 rounded-full gradient-emergency px-4 py-2.5 text-[13px] font-semibold text-white shadow-float transition hover:brightness-110"
        >
          <Siren className="size-4" /> Emergency SOS
        </button>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <section className="hidden lg:block">
          <h1 className="max-w-lg text-[44px] font-bold leading-[1.05] tracking-tight">
            One portal for <span className="text-primary">every</span> MedLink account.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Patients, ambulance drivers and hospitals sign in here. Your role loads the right dashboard automatically —
            no role picking, no extra steps.
          </p>
          <ul className="mt-8 space-y-3">
            {accountTypes.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-3xl border border-border/70 bg-surface/70 p-4 shadow-card backdrop-blur">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-variant text-[18px]">{t.emoji}</span>
                <div>
                  <p className="text-[14px] font-bold">{t.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{t.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-[460px] rounded-[32px] border border-border/70 bg-surface p-7 shadow-dialog sm:p-9">
          {mode === "login" && (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1 text-[11.5px] font-semibold text-primary">
                <ShieldCheck className="size-3.5" /> Secure sign in
              </span>
              <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">Welcome back</h2>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">We detect your account role automatically.</p>

              <div className="mt-7 space-y-3">
                <Field label="Email or phone number" placeholder="you@example.com" value={identifier} onChange={setIdentifier} />
                <Field label="Password" placeholder="Enter your password" type="password" />
              </div>

              <div className="mt-6 space-y-3">
                <Primary onClick={login}>Login</Primary>
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="flex w-full items-center justify-center rounded-full border border-primary/40 bg-surface py-4 text-[15px] font-semibold text-primary shadow-card transition active:scale-[0.99]"
                >
                  Create Account
                </button>
              </div>
            </>
          )}

          {mode === "choose" && (
            <>
              <button
                type="button"
                onClick={() => setMode("login")}
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
                    <Field label="Hospital name" placeholder="United Care Hospital" />
                    <Select label="Hospital type" options={hospitalTypes} value={hospType} onChange={setHospType} />
                    <Field label="Contact person" placeholder="Dr. Nadia Rahman" />
                    <Field label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
                    <Field label="Email" placeholder="admin@hospital.com" type="email" />
                    <Field label="Password" placeholder="Create a password" type="password" />
                    <Field label="Confirm password" placeholder="Re-enter your password" type="password" />
                    <p className="pt-2 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                      Legal documents
                    </p>
                    <FileField
                      label="Hospital licence & registration documents"
                      hint="PDF, JPG or PNG · up to 5 files"
                    />
                  </>
                ) : (
                  <>
                    <Field label="Full name" placeholder={role === "driver" ? "Abdul Karim" : "Shirley Rahman"} />
                    <Field label="Phone number" placeholder="+880 17XX-XXXXXX" type="tel" />
                    <Field label="Email" placeholder="you@example.com" type="email" />
                    <Field label="Password" placeholder="Create a password" type="password" />
                    <Field label="Confirm password" placeholder="Re-enter your password" type="password" />
                    {role === "patient" && (
                      <Select label="Blood group" options={bloodGroups} value={bloodGroup} onChange={setBloodGroup} />
                    )}
                    {role === "driver" && (
                      <>
                        <p className="pt-2 px-1 text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                          Vehicle information
                        </p>
                        <Field label="Vehicle registration number" placeholder="Dhaka Metro Cha 11-1111" />
                        <Select label="Ambulance type" options={ambulanceTypes} value={ambType} onChange={setAmbType} />
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6">
                <Primary onClick={register}>
                  {role === "hospital" ? "Register Hospital" : role === "driver" ? "Create Driver Account" : "Create Account"}
                </Primary>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-[11.5px] text-muted-foreground">
            Emergency SOS is always available without an account.
          </p>
        </section>
      </main>

{showSos &&(
          <GuestSosModal onClose={() => setShowSos(false)} />
        )}
    </div>
  )
}