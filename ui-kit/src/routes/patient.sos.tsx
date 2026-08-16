import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientShell } from "@/components/medlink/patient-shell";
import { useEffect, useMemo, useState } from "react";
import { StylizedMap, hospitalMarkers } from "@/components/medlink/stylized-map";
import { hospitals, ambulances, type Hospital, type Ambulance } from "@/lib/medlink/data";
import { Heart, Sparkles, PhoneCall, Truck, Droplet, ShieldPlus, MapPin, BedDouble, Activity, ArrowRight, Check, Star, Info, CheckCircle2, Video } from "lucide-react";
import { matchDonors, type BloodGroup, type RankedDonor } from "@/lib/medlink/blood";
import { BloodSupportHeader, DonorCard, ConfirmDonationRequest } from "@/components/medlink/blood/blood-kit";
import { AmbulanceCard } from "@/components/medlink/ambulance-card";
import { cn } from "@/lib/utils";
import { useEmergencySync } from "@/lib/medlink/offline-sync";
import {
  SyncStatusBanner,
  OfflineResources,
} from "@/components/medlink/sos/offline-kit";

export const Route = createFileRoute("/patient/sos")({
  validateSearch: (search: Record<string, unknown>) => ({
    guest: String(search.guest) === "1" || String(search.guest) === "true",
    name: typeof search.name === "string" ? search.name : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
    location: typeof search.location === "string" ? search.location : undefined,
    lat: typeof search.lat === "string" ? search.lat : undefined,
    lng: typeof search.lng === "string" ? search.lng : undefined,
  }),
  head: () => ({ meta: [{ title: "Emergency SOS · MedLink Patient" }, { name: "description", content: "AI-guided emergency command center." }] }),
  component: SOS,
});

const suggestions = [
  "My grandmother had a heart attack.",
  "Severe allergic reaction, face swelling.",
  "Car accident, head injury.",
  "High fever and seizure in a child.",
];

const SOS_COORDINATION_FEE_BDT = 1000;

type SosSummary = {
  hospitalName: string;
  bedReserved: boolean;
  icuReserved: boolean;
  ambulance?: { callSign: string };
  donorsContacted: number;
};

// Preferred (tier A) hospitals first, then by tier, then by distance.
function sortHospitals(list: Hospital[]) {
  const tierRank = (h: Hospital) => (h.tier === "A" ? 0 : h.tier === "B" ? 1 : 2);
  return [...list].sort((a, b) => tierRank(a) - tierRank(b) || a.distanceKm - b.distanceKm);
}

function SOS() {
  const { guest, name: guestName, phone: guestPhone } = Route.useSearch();
  const [phase, setPhase] = useState<"input" | "analyzing" | "command" | "summary">("input");
  const [text, setText] = useState("");
  const [reserved, setReserved] = useState<{ bed?: boolean; icu?: boolean; ambulance?: string }>({});
  const [pendingDonor, setPendingDonor] = useState<RankedDonor | null>(null);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SosSummary | null>(null);
  const { online, cache, justSynced } = useEmergencySync();

  useEffect(() => {
    if (phase === "analyzing") {
      const t = setTimeout(() => setPhase("command"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const submit = (val: string) => {
    setText(val);
    setPhase("analyzing");
  };

  const endSOS = (s: SosSummary) => {
    setSummary(s);
    setPhase("summary");
  };

  const resetAndExit = () => {
    setPhase("input");
    setText("");
    setReserved({});
    setPendingDonor(null);
    setSentTo([]);
    setSummary(null);
  };

  return (
    <PatientShell label={guest ? "Guest · Emergency SOS" : "Patient · Emergency SOS"} hideNav={guest}>
      {guest && (
        <div className="px-5 pt-3">
          <div className="flex items-center gap-3 rounded-2xl border border-emergency/25 bg-emergency/8 px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl gradient-emergency text-white">
              <ShieldPlus className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-widest text-emergency">Guest emergency session</p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {guestName || "Guest"}{guestPhone ? ` · ${guestPhone}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}
      {online && (
        <div className="px-5 pt-3">
          <SyncStatusBanner syncedAt={cache?.syncedAt} justSynced={justSynced} />
        </div>
      )}
      {/* Once offline, every phase collapses into the resources-only view — there is
          nothing an unauthenticated network call can do for input/analyzing/summary. */}
      {!online ? (
        <OfflineCommandPhase guest={guest} selectedHospitalId={selectedHospitalId} cache={cache} />
      ) : (
        <>
          {phase === "input" && <InputPhase text={text} setText={setText} submit={submit} />}
          {phase === "analyzing" && <AnalyzingPhase text={text} />}
          {phase === "command" && (
            <CommandPhase
              text={text}
              reserved={reserved}
              setReserved={setReserved}
              selectedHospitalId={selectedHospitalId}
              setSelectedHospitalId={setSelectedHospitalId}
            />
          )}
          {phase === "summary" && summary && <SummaryPhase summary={summary} onDone={resetAndExit} />}
        </>
      )}
    </PatientShell>
  );

  function InputPhase({ text, setText, submit }: { text: string; setText: (v: string) => void; submit: (v: string) => void }) {
    return (
      <div className="soft-in px-5 pt-2">
        <div className="flex items-center justify-between">
          <Link to={guest ? "/patient/auth" : "/patient"} className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <span className="rounded-full bg-emergency/10 px-3 py-1 text-[11px] font-semibold text-emergency">Emergency mode</span>
        </div>

        <div className="mt-5">
          <div className="relative mx-auto grid size-28 place-items-center">
            <span className="absolute inset-0 rounded-full bg-emergency/15 sos-ring" />
            <div className="relative grid size-24 place-items-center rounded-full gradient-emergency text-white shadow-float">
              <Heart className="size-9" strokeWidth={2.4} />
            </div>
          </div>
          <h1 className="mt-6 text-center text-[28px] font-bold leading-tight tracking-tight">Tell us what's happening</h1>
          <p className="mx-auto mt-2 max-w-[300px] text-center text-[13.5px] text-muted-foreground">
            Describe the emergency in your own words. Our AI will do the rest.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. My grandmother is having chest pain and can't breathe…"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
            <button
              disabled={!text.trim()}
              onClick={() => submit(text.trim())}
              className="flex items-center gap-2 rounded-full gradient-emergency px-4 py-2 text-[13px] font-semibold text-white shadow-float transition disabled:opacity-40"
            >
              Get help now <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-widest text-muted-foreground">Or tap a common scenario</p>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => submit(s)} className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-surface p-3.5 text-left shadow-card transition active:scale-[0.99]">
                <span className="text-[13.5px]">{s}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function AnalyzingPhase({ text }: { text: string }) {
    const steps = ["Understanding your description", "Assessing severity", "Locating nearest hospitals", "Checking ICU & bed availability", "Preparing first-aid guidance"];
    return (
      <div className="soft-in flex min-h-full flex-col items-center px-5 pt-6">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-0 rounded-full bg-primary/15 sos-ring" />
          <div className="relative grid size-20 place-items-center rounded-full gradient-primary text-primary-foreground shadow-float">
            <Sparkles className="size-8" />
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] font-semibold uppercase tracking-widest text-primary">AI analyzing</p>
        <p className="mt-2 max-w-[280px] text-center text-[15px] italic text-muted-foreground">"{text}"</p>
        <div className="mt-8 w-full max-w-[320px] space-y-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3" style={{ animation: `soft-in 300ms ${i * 200}ms both` }}>
              <span className="grid size-7 place-items-center rounded-full bg-primary-container text-primary">
                <Check className="size-3.5" />
              </span>
              <span className="text-[13.5px] text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Offline: nothing here calls the network. We pick the same "primary" hospital
   * the online flow would have (whatever was selected before connectivity dropped,
   * falling back to the top-ranked nearest hospital), then derive an ambulance
   * provider and the best-ranked compatible donor for that hospital — all from
   * local/cached data via matchDonors, which is a pure lookup, not a network call.
   */
  function OfflineCommandPhase({
    guest,
    selectedHospitalId,
    cache,
  }: {
    guest: boolean;
    selectedHospitalId: string | null;
    cache: ReturnType<typeof useEmergencySync>["cache"];
  }) {
    const sortedHospitals = useMemo(() => sortHospitals(hospitals), []);
    const nearestHospital = sortedHospitals.find((h) => h.id === selectedHospitalId) ?? sortedHospitals[0];
    const ambulanceProvider = ambulances[0];
    const requiredGroup: BloodGroup = "O+";
    const nearestDonor = matchDonors(requiredGroup, nearestHospital.id, { limit: 1 })[0];

    return (
      <div className="soft-in space-y-4 px-5 pt-2 pb-6">
        <div className="flex items-center justify-between">
          <Link to={guest ? "/patient/auth" : "/patient"} className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">Offline · Last known data</span>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface-variant p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-muted-foreground" />
            <p className="text-[13px] font-bold">You're offline</p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            AI triage, hospital booking, and donor requests need a connection. Meanwhile, here's what's saved locally for {nearestHospital.name} — reachable right now without the internet.
          </p>
        </div>

        <SectionTitle title="Emergency resources" hint="Available offline" />
        {cache ? (
          <OfflineResources cache={cache} online={false} />
        ) : (
          <p className="px-1 text-[12px] text-muted-foreground">Connect once to synchronize emergency resources.</p>
        )}

        <a
          href={`tel:${nearestHospital.phone}`}
          className="flex w-full items-center justify-center gap-2 rounded-full gradient-emergency py-3.5 text-[13.5px] font-semibold text-white shadow-float"
        >
          <PhoneCall className="size-4" /> Call {nearestHospital.name}
        </a>
      </div>
    );
  }

  function CommandPhase({
    text,
    reserved,
    setReserved,
    selectedHospitalId,
    setSelectedHospitalId,
  }: {
    text: string;
    reserved: any;
    setReserved: (r: any) => void;
    selectedHospitalId: string | null;
    setSelectedHospitalId: (id: string | null) => void;
  }) {
    const [showMoreHospitals, setShowMoreHospitals] = useState(false);
    const [bloodRequired, setBloodRequired] = useState<boolean | null>(null);
    const [assessingBlood, setAssessingBlood] = useState(false);
    const sortedHospitals = useMemo(() => sortHospitals(hospitals), []);
    const primary = sortedHospitals.find((h) => h.id === selectedHospitalId) ?? sortedHospitals[0];
    const hospitalSelected = selectedHospitalId !== null;
    const amb = ambulances[0];
    const requiredGroup: BloodGroup = "O+";
    const matchedDonors = hospitalSelected && bloodRequired ? matchDonors(requiredGroup, primary.id, { limit: 5 }) : [];
    const bookedAmbulance = ambulances.find((a) => a.id === reserved.ambulance);

    // This phase only ever renders while online (see the branch in SOS()), so the
    // AI assessment always has a live hospital to check against.
    useEffect(() => {
      if (!hospitalSelected || bloodRequired !== null) return;
      setAssessingBlood(true);
      const t = setTimeout(() => {
        setBloodRequired(true); // AI assessment: critical cardiac case → donor outreach recommended
        setAssessingBlood(false);
      }, 1100);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hospitalSelected, bloodRequired, primary.id]);

    return (
      <div className="soft-in space-y-4 px-5 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <Link to={guest ? "/patient/auth" : "/patient"} className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <span className="flex items-center gap-1.5 rounded-full bg-emergency/10 px-3 py-1 text-[11px] font-semibold text-emergency">
            <span className="size-1.5 animate-pulse rounded-full bg-emergency" />
            Live · Command center
          </span>
        </div>

        {/* AI summary */}
        <div className="rounded-3xl border border-emergency/20 bg-emergency/5 p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emergency px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">Critical</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emergency">AI summary</span>
          </div>
          <h2 className="mt-2 text-[18px] font-bold leading-tight">Suspected acute cardiac event</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
            Adult female · likely myocardial infarction based on described symptoms. Immediate advanced life support recommended. Notifying Cardiology at nearest facility.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Chest pain", "Shortness of breath", "Elderly patient"].map((t) => (
              <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-foreground/80">{t}</span>
            ))}
          </div>
        </div>

        {/* First aid */}
        <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <ShieldPlus className="size-4 text-primary" />
            <p className="text-[13px] font-bold">Do this now — first aid</p>
          </div>
          <ol className="mt-3 space-y-2 text-[13px]">
            {[
              "Keep the patient seated, calm and still.",
              "Loosen tight clothing. Do not give food or water.",
              "If prescribed, help them take nitroglycerin.",
              "If unresponsive & not breathing, begin CPR (30:2).",
            ].map((s, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-container text-[10px] font-bold text-primary">{i + 1}</span>
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Talk to a medical professional — coming soon */}
        <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Video className="size-4 text-primary" />
              <p className="text-[13px] font-bold">Talk to a medical professional</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              Coming soon
            </span>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Get connected live over video or voice with a doctor while help is on the way.
          </p>
          <button
            disabled
            className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-border/70 py-2.5 text-[12.5px] font-semibold text-muted-foreground opacity-60"
          >
            <Video className="size-4" /> Coming soon
          </button>
        </div>

        {/* Map */}
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-card">
          <StylizedMap
            className="h-44"
            markers={[
              { x: 50, y: 60, kind: "patient", label: "You" },
              { x: primary.coord.x, y: primary.coord.y, kind: "hospital", label: primary.name.split(" ")[0] },
              { x: 40, y: 48, kind: "ambulance", label: amb.callSign },
            ]}
            route={{ from: { x: 40, y: 48 }, to: { x: 50, y: 60 } }}
            compact
          />
          <div className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/70">
            <Stat label="Distance" value={`${amb.distanceKm} km`} icon={MapPin} />
            <Stat label="Ambulance ETA" value={`${amb.etaMin} min`} icon={Truck} tone="emergency" />
            <Stat label="Hospital ETA" value={`${primary.etaMin} min`} icon={Activity} />
          </div>
        </div>

        {/* Recommended hospital */}
        <SectionTitle title="Nearby hospitals" hint="Select admission first" />
        <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold">{primary.name}</p>
                {primary.tier === "A" && (
                  <span className="flex items-center gap-0.5 rounded-full bg-primary-container px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    <Star className="size-2.5 fill-current" /> PREFERRED
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{primary.address} · {primary.distanceKm} km</p>
            </div>
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-bold text-success">Ready</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Beds" value={primary.beds.available} icon={BedDouble} />
            <MiniStat label="ICU" value={primary.icu.available} icon={Activity} tone="emergency" />
            <MiniStat label="Blood O-" value="✓" icon={Droplet} tone="info" />
          </div>

          {/* Reserve buttons — stacked, not side-by-side */}
          <div className="mt-3 space-y-2">
            <ActionButton
              active={hospitalSelected}
              onClick={() => {
                setSelectedHospitalId(primary.id);
                setBloodRequired(null);
              }}
              label={hospitalSelected ? "Hospital selected" : "Select this hospital"}
              icon={Check}
            />
            <ActionButton
              active={reserved.bed}
              onClick={() => setReserved({ ...reserved, bed: !reserved.bed })}
              label={reserved.bed ? "Bed reserved" : "Reserve emergency bed"}
              icon={BedDouble}
            />
            <ActionButton
              active={reserved.icu}
              onClick={() => setReserved({ ...reserved, icu: !reserved.icu })}
              label={reserved.icu ? "ICU reserved" : "Reserve ICU bed"}
              icon={Activity}
              tone="emergency"
            />
          </div>

          <a href={`tel:${primary.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-full border border-border/70 py-2.5 text-[13px] font-semibold">
            <PhoneCall className="size-4" /> Call hospital · {primary.phone}
          </a>
          <a href={`tel:${primary.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-full gradient-emergency py-2.5 text-[13px] font-semibold text-white shadow-float">
            <PhoneCall className="size-4" /> Call emergency department
          </a>
        </div>

        {/* Best matched & nearest hospitals */}
        <button
          type="button"
          onClick={() => setShowMoreHospitals((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 py-3 text-[13px] font-semibold text-primary transition active:scale-[0.99]"
        >
          {showMoreHospitals ? "Hide other hospitals" : "Show all nearby hospitals"}
        </button>

        {showMoreHospitals && (
          <div className="space-y-2">
            {sortedHospitals.map((h) => (
              <div
                key={h.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-3.5 shadow-card transition",
                  h.id === selectedHospitalId ? "border-primary/50 bg-primary-container/40" : "border-border/70 bg-surface"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13.5px] font-semibold">{h.name}</p>
                    {h.tier === "A" && (
                      <span className="shrink-0 rounded-full bg-primary-container px-1.5 py-0.5 text-[9px] font-bold text-primary">PREFERRED</span>
                    )}
                  </div>
                  <p className="truncate text-[11.5px] text-muted-foreground">{h.address} · {h.distanceKm} km · ETA {h.etaMin} min</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHospitalId(h.id);
                    setBloodRequired(null);
                    setReserved({ bed: false, icu: false, ambulance: reserved.ambulance });
                  }}
                  className="shrink-0 rounded-full border border-primary/30 px-3 py-1.5 text-[11.5px] font-semibold text-primary disabled:opacity-40"
                >
                  {h.id === selectedHospitalId ? "Selected" : "Select"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Blood support — only appears once a hospital has been selected */}
        {hospitalSelected && (
          <>
            <SectionTitle title="Blood assessment" hint="AI-assessed" />

            {assessingBlood && (
              <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                    <Sparkles className="size-4 animate-pulse" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">AI assessing blood requirement…</p>
                    <p className="text-[11.5px] text-muted-foreground">Checking case severity against {primary.name}'s blood bank</p>
                  </div>
                </div>
              </div>
            )}
            {!assessingBlood && bloodRequired === false && (
              <p className="rounded-2xl bg-success/10 px-4 py-3 text-[12.5px] font-semibold text-success">
                AI assessment: no donor outreach needed for this admission.
              </p>
            )}

            {bloodRequired && <>
        <SectionTitle title="Compatible donors" hint="Ranked from selected hospital" />
        <BloodSupportHeader group={requiredGroup} hospitalName={primary.name} units={2} />
        <div className="space-y-2">
          <p className="px-1 text-[11.5px] font-semibold uppercase tracking-widest text-muted-foreground">
            Nearby eligible donors · {matchedDonors.length} found
          </p>
          {matchedDonors.map((d) => (
            <DonorCard
              key={d.id}
              donor={d}
              requested={sentTo.includes(d.id)}
              onRequest={() => setPendingDonor(d)}
            />
          ))}
        </div>
        <ConfirmDonationRequest
          open={!!pendingDonor}
          donorName={pendingDonor?.name ?? ""}
          group={requiredGroup}
          hospitalName={primary.name}
          onCancel={() => setPendingDonor(null)}
          onConfirm={() => {
            if (pendingDonor) setSentTo((s) => [...s, pendingDonor.id]);
            setPendingDonor(null);
          }}
        />
            </>}
          </>
        )}

        {/* Ambulance */}
        <SectionTitle
          title={reserved.ambulance ? "Your ambulance" : "Nearest ambulance"}
          hint={reserved.ambulance ? "Request accepted" : `${ambulances.length} units nearby`}
        />
        <div className="space-y-3">
          {(reserved.ambulance
            ? ambulances.filter((a) => a.id === reserved.ambulance)
            : ambulances.slice(0, 2)
          ).map((a) => (
            <AmbulanceCard
              key={a.id}
              ambulance={a}
              booked={reserved.ambulance === a.id}
              onRequest={() => setReserved({ ...reserved, ambulance: a.id })}
              onCancel={() => setReserved({ ...reserved, ambulance: undefined })}
            />
          ))}
        </div>
        {reserved.ambulance && (
          <Link to="/patient/tracking" className="mt-1 block text-center text-[12.5px] font-semibold text-primary">Open live tracking →</Link>
        )}

        {/* End SOS */}
        <div className="mt-2 space-y-2.5 border-t border-border/70 pt-4">
          <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-surface-variant p-3.5">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              A coordination fee of <span className="font-semibold text-foreground">BDT {SOS_COORDINATION_FEE_BDT.toLocaleString()}</span> will be added to the hospital bill once this SOS is marked complete.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              endSOS({
                hospitalName: primary.name,
                bedReserved: !!reserved.bed,
                icuReserved: !!reserved.icu,
                ambulance: bookedAmbulance ? { callSign: bookedAmbulance.callSign } : undefined,
                donorsContacted: sentTo.length,
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-full border border-emergency/40 py-3.5 text-[13.5px] font-semibold text-emergency transition active:scale-[0.99]"
          >
            <CheckCircle2 className="size-4" /> End SOS
          </button>
        </div>
      </div>
    );
  }

  function SummaryPhase({ summary, onDone }: { summary: SosSummary; onDone: () => void }) {
    return (
      <div className="soft-in px-5 pb-6 pt-6">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success shadow-card">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="mt-5 text-center text-[24px] font-bold leading-tight tracking-tight">SOS completed</h1>
        <p className="mx-auto mt-2 max-w-[290px] text-center text-[13.5px] leading-relaxed text-muted-foreground">
          Emergency coordination has ended. Here's a summary of what was arranged for you.
        </p>

        <div className="mt-6 rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
          <SummaryRow label="Hospital" value={summary.hospitalName} icon={MapPin} />
          <SummaryRow label="Emergency bed" value={summary.bedReserved ? "Reserved" : "Not reserved"} icon={BedDouble} />
          <SummaryRow label="ICU bed" value={summary.icuReserved ? "Reserved" : "Not reserved"} icon={Activity} />
          <SummaryRow label="Ambulance" value={summary.ambulance ? `Dispatched · ${summary.ambulance.callSign}` : "Not requested"} icon={Truck} />
          <SummaryRow label="Blood donors contacted" value={String(summary.donorsContacted)} icon={Droplet} last />
        </div>

        <div className="mt-4 rounded-3xl border border-emergency/20 bg-emergency/5 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold">Coordination fee</p>
            <p className="text-[19px] font-bold text-emergency">BDT {SOS_COORDINATION_FEE_BDT.toLocaleString()}</p>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
            This fee will be added to your bill at {summary.hospitalName}. No separate payment is needed right now.
          </p>
        </div>

        <Link
          to={guest ? "/patient/auth" : "/patient"}
          onClick={onDone}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full gradient-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-float transition active:scale-[0.98]"
        >
          Back to home
        </Link>
      </div>
    );
  }
}

function SummaryRow({ label, value, icon: Icon, last }: any) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-2.5", !last && "border-b border-border/70")}>
      <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </span>
      <span className="text-[12.5px] font-semibold text-right">{value}</span>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone = "muted" }: any) {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <Icon className={cn("size-3.5", tone === "emergency" ? "text-emergency" : "text-muted-foreground")} />
      <p className={cn("text-[14px] font-bold", tone === "emergency" && "text-emergency")}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, tone = "primary" }: any) {
  const toneCls = tone === "emergency" ? "bg-emergency/10 text-emergency" : tone === "info" ? "bg-info/10 text-info" : "bg-primary-container text-primary";
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-variant py-2.5">
      <div className={cn("grid size-7 place-items-center rounded-full", toneCls)}><Icon className="size-3.5" /></div>
      <p className="text-[14px] font-bold leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionButton({ label, icon: Icon, onClick, active, tone }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12.5px] font-semibold transition",
        active ? "bg-success text-white" : tone === "emergency" ? "border border-emergency/30 text-emergency" : "border border-primary/30 text-primary"
      )}
    >
      {active ? <Check className="size-4" /> : <Icon className="size-4" />} {label}
    </button>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <p className="text-[13px] font-bold">{title}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}