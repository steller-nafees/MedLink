import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PatientShell } from "@/components/medlink/patient-shell";
import {
  Section, SelectCard, Chip, TierBadge, FavoriteHospitalCard, ToggleRow, type Tier,
} from "@/components/medlink/profile-ui";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, Search, Sparkles, Award, Scale, Timer, BedDouble, Activity, Siren,
  Heart, Baby, Ambulance, Ribbon, Bone, Brain, Building2, Venus, Check, Languages,
} from "lucide-react";

export const Route = createFileRoute("/patient/preferences")({
  head: () => ({
    meta: [
      { title: "Healthcare Preferences · MedLink" },
      { name: "description", content: "Choose your hospital tier, favourite hospitals, emergency routing style and ICU preferences — used by MedLink SOS and the AI assistant." },
      { property: "og:title", content: "Healthcare Preferences · MedLink" },
      { property: "og:description", content: "Define how MedLink recommends hospitals during an emergency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Preferences,
});

type Lang = "en" | "bn";

const copy = {
  en: {
    title: "Healthcare preferences",
    subtitle: "Used by Emergency SOS and your AI assistant",
    tier: "Preferred hospital tier",
    tierHint: "Balance quality, travel time and availability",
    guide: "Tier guide",
    favorites: "Favourite hospitals",
    favoritesHint: "Drag to reorder — the top one is tried first",
    search: "Search hospitals",
    type: "Preferred hospital type",
    typeHint: "We prioritise these specialities when they match your case",
    emergency: "Emergency preference",
    emergencyHint: "How should we choose during an emergency?",
    icu: "ICU & bed preference",
    language: "Preferred language",
    save: "Save preferences",
  },
  bn: {
    title: "স্বাস্থ্যসেবা পছন্দ",
    subtitle: "জরুরি SOS এবং আপনার এআই সহকারী এটি ব্যবহার করে",
    tier: "পছন্দের হাসপাতাল টিয়ার",
    tierHint: "মান, ভ্রমণ সময় ও প্রাপ্যতার ভারসাম্য",
    guide: "টিয়ার নির্দেশিকা",
    favorites: "প্রিয় হাসপাতাল",
    favoritesHint: "ক্রম বদলাতে টেনে আনুন — উপরেরটি আগে বিবেচিত হবে",
    search: "হাসপাতাল খুঁজুন",
    type: "পছন্দের হাসপাতালের ধরন",
    typeHint: "আপনার প্রয়োজনের সাথে মিললে এগুলোকে অগ্রাধিকার দেওয়া হবে",
    emergency: "জরুরি অবস্থার পছন্দ",
    emergencyHint: "জরুরি অবস্থায় আমরা কীভাবে বেছে নেব?",
    icu: "আইসিইউ ও বেড পছন্দ",
    language: "পছন্দের ভাষা",
    save: "পছন্দ সংরক্ষণ করুন",
  },
} as const;

const tierOptions = [
  {
    id: "a",
    en: { title: "Tier A only", desc: "Premium hospitals with the best specialists and advanced facilities. Highest success rates, highest cost, and sometimes a longer drive.", meta: "Best quality · fewer options" },
    bn: { title: "শুধু টিয়ার A", desc: "সেরা বিশেষজ্ঞ ও উন্নত সুবিধাসহ প্রিমিয়াম হাসপাতাল। সর্বোচ্চ মান, বেশি খরচ, কখনও দূরত্ব বেশি।", meta: "সর্বোচ্চ মান · কম বিকল্প" },
    tier: "A" as Tier,
  },
  {
    id: "ab",
    en: { title: "Tier A + Tier B", desc: "Premium first, then standard hospitals with good facilities and qualified specialists at moderate pricing.", meta: "Recommended · balanced quality and speed" },
    bn: { title: "টিয়ার A + টিয়ার B", desc: "আগে প্রিমিয়াম, এরপর ভালো সুবিধা ও যোগ্য বিশেষজ্ঞসহ মানসম্মত হাসপাতাল, মাঝারি খরচে।", meta: "প্রস্তাবিত · মান ও গতির ভারসাম্য" },
    tier: "B" as Tier,
  },
  {
    id: "all",
    en: { title: "All hospitals", desc: "Includes basic Tier C hospitals with limited facilities — useful when higher tiers are full or far away.", meta: "Fastest access · widest coverage" },
    bn: { title: "সব হাসপাতাল", desc: "সীমিত সুবিধার টিয়ার C হাসপাতালও অন্তর্ভুক্ত — উপরের টিয়ার পূর্ণ বা দূরে থাকলে কাজে দেয়।", meta: "দ্রুততম · সর্বাধিক বিকল্প" },
    tier: "C" as Tier,
  },
];

const emergencyOptions = [
  { id: "best", icon: Award, en: { t: "Prioritise best care", d: "Always recommend the highest-quality hospital first, even if it is a few minutes further." }, bn: { t: "সেরা সেবা অগ্রাধিকার", d: "সর্বদা সর্বোচ্চ মানের হাসপাতাল আগে সুপারিশ করা হবে, কিছুটা দূরে হলেও।" } },
  { id: "balanced", icon: Scale, en: { t: "Balanced", d: "Weigh hospital quality against live bed availability and arrival time." }, bn: { t: "ভারসাম্যপূর্ণ", d: "হাসপাতালের মান, বেড প্রাপ্যতা ও পৌঁছানোর সময় বিবেচনা করা হবে।" } },
  { id: "fast", icon: Timer, en: { t: "Fastest available", d: "Recommend whichever capable hospital can receive you soonest." }, bn: { t: "দ্রুততম উপলব্ধ", d: "যে সক্ষম হাসপাতাল সবচেয়ে দ্রুত গ্রহণ করতে পারবে সেটিই সুপারিশ।" } },
];

const typeChips = [
  { id: "general", label: "General", bn: "সাধারণ", icon: Building2 },
  { id: "cardiac", label: "Cardiac", bn: "কার্ডিয়াক", icon: Heart },
  { id: "children", label: "Children's", bn: "শিশু", icon: Baby },
  { id: "trauma", label: "Trauma centre", bn: "ট্রমা সেন্টার", icon: Ambulance },
  { id: "cancer", label: "Cancer", bn: "ক্যান্সার", icon: Ribbon },
  { id: "women", label: "Women's", bn: "নারী", icon: Venus },
  { id: "ortho", label: "Orthopedic", bn: "অর্থোপেডিক", icon: Bone },
  { id: "neuro", label: "Neurology", bn: "নিউরোলজি", icon: Brain },
];

const initialFavorites: { id: string; name: string; tier: Tier; type: string }[] = [
  { id: "f1", name: "St. Mercy Medical Center", tier: "A", type: "General · Trauma" },
  { id: "f2", name: "Metro Heart Institute", tier: "A", type: "Cardiac speciality" },
  { id: "f3", name: "Northshore Regional", tier: "B", type: "General · Paediatrics" },
];

function Preferences() {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];
  const [tier, setTier] = useState("ab");
  const [emg, setEmg] = useState("balanced");
  const [types, setTypes] = useState<string[]>(["general", "cardiac"]);
  const [favs, setFavs] = useState(initialFavorites);

  const move = (i: number, dir: -1 | 1) => {
    setFavs((prev) => {
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.splice(i + dir, 0, item);
      return next;
    });
  };

  return (
    <PatientShell label="Patient · Preferences" hideSos>
      <header className="flex items-center justify-between gap-3 px-5 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/patient/profile" className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <ChevronLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-[21px] font-extrabold leading-tight tracking-tight">{t.title}</h1>
            <p className="text-[11.5px] text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center rounded-full border border-border/70 bg-surface p-0.5 shadow-card">
          {(["en", "bn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10.5px] font-extrabold transition",
                lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {l === "en" ? "EN" : "বাং"}
            </button>
          ))}
        </div>
      </header>

      {/* summary */}
      <div className="mx-5 flex items-center gap-3 rounded-[26px] gradient-primary p-4 text-primary-foreground shadow-float">
        <div className="grid size-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Sparkles className="size-5" />
        </div>
        <p className="text-[11.5px] font-semibold leading-snug opacity-95">
          {lang === "en"
            ? "MedLink applies these preferences the moment you press SOS — no questions asked."
            : "আপনি SOS চাপার সাথে সাথেই MedLink এই পছন্দগুলো প্রয়োগ করবে — কোনো প্রশ্ন ছাড়াই।"}
        </p>
      </div>

      {/* tier guide */}
      <Section title={t.guide} flush>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-5 pb-1">
          {(["A", "B", "C"] as Tier[]).map((tr) => (
            <div key={tr} className="w-[190px] shrink-0 rounded-[24px] border border-border/60 bg-surface p-3.5 shadow-card">
              <TierBadge tier={tr} />
              <p className="mt-2 text-[12.5px] font-bold">
                {tr === "A" ? (lang === "en" ? "Premium hospitals" : "প্রিমিয়াম হাসপাতাল") : tr === "B" ? (lang === "en" ? "Standard hospitals" : "মানসম্মত হাসপাতাল") : (lang === "en" ? "Basic hospitals" : "সাধারণ হাসপাতাল")}
              </p>
              <ul className="mt-1.5 space-y-1 text-[10.5px] leading-snug text-muted-foreground">
                {(tr === "A"
                  ? lang === "en" ? ["Best specialists", "Advanced facilities", "Higher success rates", "Higher cost"] : ["সেরা বিশেষজ্ঞ", "উন্নত সুবিধা", "উচ্চ সাফল্যের হার", "খরচ বেশি"]
                  : tr === "B"
                  ? lang === "en" ? ["Good facilities", "Qualified specialists", "Moderate pricing"] : ["ভালো সুবিধা", "যোগ্য বিশেষজ্ঞ", "মাঝারি খরচ"]
                  : lang === "en" ? ["Limited facilities", "Use when others are full"] : ["সীমিত সুবিধা", "অন্যরা পূর্ণ হলে ব্যবহার"]
                ).map((li) => (
                  <li key={li} className="flex items-start gap-1.5">
                    <Check className="mt-[2px] size-3 shrink-0 text-primary" strokeWidth={3} />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* tier selection */}
      <Section title={t.tier} hint={t.tierHint} flush>
        <div className="space-y-2.5 px-5">
          {tierOptions.map((o) => (
            <SelectCard
              key={o.id}
              selected={tier === o.id}
              onSelect={() => setTier(o.id)}
              title={o[lang].title}
              description={o[lang].desc}
              meta={o[lang].meta}
              leading={<div className="mt-0.5"><TierBadge tier={o.tier} /></div>}
            />
          ))}
        </div>
      </Section>

      {/* favourites */}
      <Section title={t.favorites} hint={t.favoritesHint} flush>
        <div className="mx-5 mb-2.5 flex items-center gap-2 rounded-full border border-border/60 bg-surface px-4 py-2.5 shadow-card">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder={t.search}
            className="w-full bg-transparent text-[12.5px] font-medium outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2.5 px-5">
          {favs.map((f, i) => (
            <FavoriteHospitalCard
              key={f.id}
              name={f.name}
              tier={f.tier}
              type={f.type}
              index={i}
              onUp={i > 0 ? () => move(i, -1) : undefined}
              onDown={i < favs.length - 1 ? () => move(i, 1) : undefined}
              onRemove={() => setFavs((p) => p.filter((x) => x.id !== f.id))}
            />
          ))}
        </div>
      </Section>

      {/* types */}
      <Section title={t.type} hint={t.typeHint} flush>
        <div className="flex flex-wrap gap-2 px-5">
          {typeChips.map((c) => (
            <Chip
              key={c.id}
              icon={c.icon}
              label={lang === "en" ? c.label : c.bn}
              selected={types.includes(c.id)}
              onClick={() => setTypes((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))}
            />
          ))}
        </div>
      </Section>

      {/* emergency preference */}
      <Section title={t.emergency} hint={t.emergencyHint} flush>
        <div className="space-y-2.5 px-5">
          {emergencyOptions.map((o) => {
            const Icon = o.icon;
            const active = emg === o.id;
            return (
              <SelectCard
                key={o.id}
                selected={active}
                onSelect={() => setEmg(o.id)}
                title={o[lang].t}
                description={o[lang].d}
                leading={
                  <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl transition", active ? "gradient-primary text-primary-foreground shadow-float" : "bg-surface-variant text-foreground/60")}>
                    <Icon className="size-5" />
                  </div>
                }
              />
            );
          })}
        </div>
      </Section>

      {/* ICU */}
      <Section title={t.icu}>
        <ToggleRow icon={Activity} tone="info" label={lang === "en" ? "Prefer hospitals with ICU availability" : "আইসিইউ আছে এমন হাসপাতাল অগ্রাধিকার"} defaultChecked />
        <ToggleRow icon={BedDouble} tone="primary" label={lang === "en" ? "Auto-request general bed during SOS" : "SOS-এ স্বয়ংক্রিয় সাধারণ বেড অনুরোধ"} defaultChecked />
        <ToggleRow icon={Siren} tone="emergency" label={lang === "en" ? "Auto-request ICU bed when required" : "প্রয়োজনে স্বয়ংক্রিয় আইসিইউ বেড অনুরোধ"} />
      </Section>

      {/* language */}
      <Section title={t.language} flush>
        <div className="mx-5 grid grid-cols-2 gap-2.5">
          {(["en", "bn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "flex items-center gap-2.5 rounded-[24px] border p-4 text-left transition active:scale-[0.98]",
                lang === l ? "border-primary/50 bg-primary-container/60 shadow-float" : "border-border/60 bg-surface shadow-card"
              )}
            >
              <Languages className={cn("size-4", lang === l ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="text-[13px] font-bold">{l === "en" ? "English" : "বাংলা"}</p>
                <p className="text-[10px] text-muted-foreground">{l === "en" ? "Default" : "Bengali"}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4 z-20 mx-5 mt-7">
        <button className="w-full rounded-full gradient-primary py-3.5 text-[14px] font-extrabold text-primary-foreground shadow-float transition active:scale-[0.98]">
          {t.save}
        </button>
      </div>
      <div className="pb-2" />
    </PatientShell>
  );
}
