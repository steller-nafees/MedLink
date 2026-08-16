import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PatientShell } from "@/components/medlink/patient-shell";
import { patient, hospitals } from "@/lib/medlink/data";
import { useAppSettings } from "@/lib/medlink/app-settings";
import {
  SectionTitle,
  ProfileHeader,
  InformationCard,
  MedicalInformationCard,
  EmergencyContactCard,
  ContactEditor,
  HospitalPreferenceCard,
  FavoriteHospitalCard,
  SegmentedControl,
  ToggleSwitch,
  type Contact,
  type Tier,
} from "@/components/medlink/profile/profile-kit";
import { myDonation, eligibilityFrom, formatDate } from "@/lib/medlink/blood";
import { EligibilityPill } from "@/components/medlink/blood/blood-kit";
import {
  Heart,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [
      { title: "Your Health Profile · MedLink" },
      { name: "description", content: "A calm, Apple Health inspired profile: personal details, medical info, emergency contacts and healthcare preferences." },
      { property: "og:title", content: "Your Health Profile · MedLink" },
      { property: "og:description", content: "Manage medical ID, emergency contacts and hospital preferences in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

type TierPref = "a" | "ab" | "all";
type EmergencyPref = "best" | "balanced" | "nearest";

const tierOf = (rating: number): Tier => (rating >= 4.8 ? "A" : rating >= 4.5 ? "B" : "C");
const typeOf = (departments: string[]) =>
  departments.includes("Cardiac Surgery") ? "Specialty · Cardiac" : departments.includes("Pediatrics") ? "General · Pediatrics" : "General hospital";

function Profile() {
  const { t } = useAppSettings();

  const [personal, setPersonal] = useState({
    fullName: patient.name,
    dob: "14 March 1992",
    gender: "Female",
    blood: patient.bloodType,
    address: "1420 Bayview Terrace, San Francisco",
  });
  const [allergies, setAllergies] = useState<string[]>(patient.allergies);
  const [conditions, setConditions] = useState<string[]>(patient.conditions);
  const [medications, setMedications] = useState<string[]>(patient.medications);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "c1", ...patient.emergencyContact },
    { id: "c2", name: "Dr. Amara Osei", relation: "Family physician", phone: "+1 (415) 555-0181" },
  ]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [tierPref, setTierPref] = useState<TierPref>("ab");
  const [emergencyPref, setEmergencyPref] = useState<EmergencyPref>("balanced");
  const [favorites, setFavorites] = useState<string[]>(["h-mercy"]);
  const [query, setQuery] = useState("");
  const [donorAvailable, setDonorAvailable] = useState(myDonation.available);
  const donationEligibility = eligibilityFrom(myDonation.lastDonation);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return hospitals.filter((h) => h.name.toLowerCase().includes(q) && !favorites.includes(h.id)).slice(0, 4);
  }, [query, favorites]);

  const favoriteHospitals = hospitals.filter((h) => favorites.includes(h.id));

  return (
    <PatientShell label="Patient · Profile">
      <header className="px-5 pb-3 pt-4">
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight">{t("profile")}</h1>
        <p className="text-[13px] text-muted-foreground">{t("profileSub")}</p>
      </header>

      <div className="space-y-7 px-4 pb-6">
        {/* Header */}
        <ProfileHeader
          name={personal.fullName}
          email="shirley.ramirez@mail.com"
          phone="+1 (415) 555-0134"
          initials="SR"
          editLabel={t("editProfile")}
          onEdit={() => document.getElementById("personal-info")?.scrollIntoView({ behavior: "smooth", block: "center" })}
        />

        {/* Personal */}
        <section id="personal-info">
          <SectionTitle title={t("personalInformation")} />
          <InformationCard
            editLabel={t("editProfile")}
            saveLabel={t("save")}
            cancelLabel={t("cancel")}
            fields={[
              { key: "fullName", label: t("fullName"), value: personal.fullName },
              { key: "dob", label: t("dateOfBirth"), value: personal.dob },
              { key: "gender", label: t("gender"), value: personal.gender },
              { key: "blood", label: t("bloodGroup"), value: personal.blood },
              { key: "address", label: t("address"), value: personal.address },
            ]}
            onChange={(key, value) => setPersonal((p) => ({ ...p, [key]: value }))}
          />
        </section>

        {/* Medical */}
        <section>
          <SectionTitle title={t("medicalInformation")} />
          <div className="space-y-3">
            <MedicalInformationCard
              icon={ShieldAlert}
              tone="emergency"
              title={t("allergies")}
              items={allergies}
              emptyLabel={t("none")}
              addLabel={t("addItem")}
              onAdd={(v) => setAllergies((a) => [...a, v])}
              onRemove={(v) => setAllergies((a) => a.filter((x) => x !== v))}
            />
            <MedicalInformationCard
              icon={Heart}
              tone="warning"
              title={t("conditions")}
              items={conditions}
              emptyLabel={t("none")}
              addLabel={t("addItem")}
              onAdd={(v) => setConditions((a) => [...a, v])}
              onRemove={(v) => setConditions((a) => a.filter((x) => x !== v))}
            />
            <MedicalInformationCard
              icon={Pill}
              tone="info"
              title={t("medications")}
              items={medications}
              emptyLabel={t("none")}
              addLabel={t("addItem")}
              onAdd={(v) => setMedications((a) => [...a, v])}
              onRemove={(v) => setMedications((a) => a.filter((x) => x !== v))}
            />
          </div>
        </section>

        {/* Blood donation */}
        <section id="blood-donation">
          <SectionTitle title="Blood donation" />
          <div className="rounded-[28px] border border-border/50 bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-emergency/10 text-[15px] font-extrabold text-emergency">{myDonation.group}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Blood group</p>
                <p className="text-[15px] font-bold leading-tight">{myDonation.group}</p>
              </div>
              <EligibilityPill eligibility={donationEligibility} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3.5">
              <div>
                <p className="text-[13.5px] font-semibold">Last donation</p>
                <p className="text-[11.5px] text-muted-foreground">{formatDate(myDonation.lastDonation)}</p>
              </div>
              <span className="rounded-full bg-surface-variant px-3 py-1.5 text-[11.5px] font-bold text-foreground/70">
                {donationEligibility.eligible ? "Ready" : `${donationEligibility.daysLeft} days left`}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3.5">
              <div className="pr-3">
                <p className="text-[13.5px] font-semibold">Donation availability</p>
                <p className="text-[11.5px] leading-snug text-muted-foreground">
                  {donorAvailable ? "You may receive emergency donation requests." : "You won't receive donation requests."}
                </p>
              </div>
              <ToggleSwitch checked={donorAvailable} onChange={setDonorAvailable} label="Donation availability" />
            </div>
          </div>
        </section>

        {/* Emergency contacts */}
        <section>
          <SectionTitle
            title={t("emergencyContacts")}
            action={
              <button
                type="button"
                onClick={() => setEditingContact({ id: `c${Date.now()}`, name: "", relation: "", phone: "" })}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-container px-3 py-1.5 text-[11.5px] font-bold text-primary"
              >
                <Plus className="size-3" /> {t("addContact")}
              </button>
            }
          />
          <div className="space-y-3">
            {contacts.map((c) => (
              <EmergencyContactCard
                key={c.id}
                contact={c}
                onEdit={() => setEditingContact(c)}
                onRemove={() => setContacts((list) => list.filter((x) => x.id !== c.id))}
              />
            ))}
            {editingContact && (
              <ContactEditor
                value={editingContact}
                labels={{ name: t("fullName"), relation: t("relationship"), phone: t("phone"), save: t("save"), cancel: t("cancel") }}
                onCancel={() => setEditingContact(null)}
                onSave={(c) => {
                  setContacts((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]));
                  setEditingContact(null);
                }}
              />
            )}
          </div>
        </section>

        {/* Healthcare preferences — highlight */}
        <section className="rounded-[32px] bg-primary-container/40 p-4 ring-1 ring-primary/15">
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-float">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-extrabold leading-tight">{t("healthcarePreferences")}</h2>
              <p className="text-[11.5px] leading-snug text-muted-foreground">{t("healthcarePrefSub")}</p>
            </div>
          </div>

          <p className="mb-2 px-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{t("preferredTier")}</p>
          <div className="space-y-2.5">
            <HospitalPreferenceCard title={t("tierAOnly")} description={t("tierADesc")} tiers={["A"]} selected={tierPref === "a"} onSelect={() => setTierPref("a")} />
            <HospitalPreferenceCard title={t("tierAB")} description={t("tierABDesc")} tiers={["A", "B"]} selected={tierPref === "ab"} onSelect={() => setTierPref("ab")} />
            <HospitalPreferenceCard title={t("allHospitals")} description={t("allDesc")} tiers={["A", "B", "C"]} selected={tierPref === "all"} onSelect={() => setTierPref("all")} />
          </div>

          <p className="mb-2 mt-5 px-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{t("favoriteHospitals")}</p>
          <div className="mb-2.5 flex items-center gap-2 rounded-full border border-border/50 bg-surface px-4 py-2.5 shadow-card">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchHospital")}
              className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground"
            />
          </div>
          {results.length > 0 && (
            <div className="mb-2.5 overflow-hidden rounded-[22px] border border-border/50 bg-surface shadow-card">
              {results.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setFavorites((f) => [...f, h.id]);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 border-b border-border/40 px-4 py-3 text-left last:border-0"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{h.name}</span>
                  <Plus className="size-4 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2.5">
            {favoriteHospitals.length === 0 && <p className="px-1.5 text-[12px] text-muted-foreground">{t("noFavorites")}</p>}
            {favoriteHospitals.map((h) => (
              <FavoriteHospitalCard
                key={h.id}
                name={h.name}
                tier={tierOf(h.rating)}
                type={typeOf(h.departments)}
                onRemove={() => setFavorites((f) => f.filter((id) => id !== h.id))}
              />
            ))}
          </div>

          <p className="mb-1 mt-5 px-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{t("emergencyPreference")}</p>
          <p className="mb-2.5 px-1.5 text-[11.5px] leading-snug text-muted-foreground">{t("emergencyPrefSub")}</p>
          <SegmentedControl<EmergencyPref>
            value={emergencyPref}
            onChange={setEmergencyPref}
            options={[
              { value: "best", label: t("bestHospital") },
              { value: "balanced", label: t("balanced") },
              { value: "nearest", label: t("nearest") },
            ]}
          />
        </section>


        <p className="pb-2 text-center text-[10.5px] text-muted-foreground">MedLink · v2.4.0</p>
      </div>
    </PatientShell>
  );
}
