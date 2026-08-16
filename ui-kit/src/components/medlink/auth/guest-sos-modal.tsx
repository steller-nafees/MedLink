import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Siren, X, UserRound, Phone, MapPin, LocateFixed, Loader2 } from "lucide-react";

/**
 * Premium guest intake modal shown before entering the Emergency SOS Center.
 * Rendered inside the phone frame (absolute), so it overlays the auth screen.
 */
export function GuestSosModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [manualLocation, setManualLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const detect = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn't available on this device. Enter it manually.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ lat: c.latitude, lng: c.longitude });
        setLocating(false);
      },
      () => {
        setError("We couldn't detect your location. Allow access or enter it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasLocation = mode === "auto" ? !!coords : manualLocation.trim().length > 0;
  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && hasLocation;

  const activate = () => {
    navigate({
      to: "/patient/sos",
      search: {
        guest: "1",
        name: name.trim(),
        phone: phone.trim(),
        ...(mode === "auto" && coords
          ? { lat: String(coords.lat), lng: String(coords.lng) }
          : { location: manualLocation.trim() }),
      },
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 backdrop-blur-[2px]">
      <div className="soft-in w-full rounded-[30px] border border-border/70 bg-surface p-5 shadow-dialog">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl gradient-emergency text-white shadow-float">
              <Siren className="size-5" />
            </span>
            <div>
              <p className="text-[16.5px] font-bold leading-tight">Emergency SOS</p>
              <p className="text-[12px] text-muted-foreground">Quick details so help can reach you.</p>
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

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">Full name</span>
            <span className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card focus-within:border-primary/50">
              <UserRound className="size-4 text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name of patient or caller"
                className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-muted-foreground"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">Phone number</span>
            <span className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-card focus-within:border-primary/50">
              <Phone className="size-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 17XX-XXXXXX"
                className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-muted-foreground"
              />
            </span>
          </label>

          <div>
            <span className="mb-1.5 block px-1 text-[12px] font-semibold text-muted-foreground">Current location</span>
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "manual"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-[12px] font-semibold transition",
                    mode === m
                      ? "border-primary/50 bg-primary-container text-primary"
                      : "border-border bg-surface text-muted-foreground"
                  )}
                >
                  {m === "auto" ? <LocateFixed className="size-3.5" /> : <MapPin className="size-3.5" />}
                  {m === "auto" ? "Use my location" : "Enter manually"}
                </button>
              ))}
            </div>

            {mode === "auto" ? (
              <div className="mt-2.5 rounded-2xl border border-border bg-surface-variant px-4 py-3.5">
                {coords ? (
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    <LocateFixed className="size-4 text-primary" /> Location detected ({coords.lat.toFixed(3)}, {coords.lng.toFixed(3)})
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={detect}
                    disabled={locating}
                    className="flex items-center gap-2 text-[13px] font-semibold text-primary"
                  >
                    {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                    {locating ? "Detecting your location…" : "Tap to detect my location"}
                  </button>
                )}
                {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
              </div>
            ) : (
              <input
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="House, road, area, city"
                className="mt-2.5 w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-[14px] shadow-card outline-none focus:border-primary/50"
              />
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={activate}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-4 text-[15px] font-semibold text-white shadow-float transition active:scale-[0.98] disabled:opacity-40"
        >
          <Siren className="size-[18px]" /> Activate Emergency SOS
        </button>
      </div>
    </div>
  );
}
