import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/medlink/phone-frame";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Sparkles,
  Thermometer,
  Wind,
  Brain,
  Stethoscope,
  Clock,
  ShieldCheck,
  Pill,
  Utensils,
  Moon,
  HeartPulse,
  AlertTriangle,
  Building2,
  Phone,
  Navigation,
  Download,
  BookmarkPlus,
  ChevronRight,
  FileText,
  Star,
  MapPin,
  FlaskConical,
  Home as HomeIcon,
  Syringe,
  Salad,
  Activity,
  Info,
  Send,
  Plus,
  ArrowUp,
  Check,
  X,
  BookOpen,
  Droplets,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/ai")({
  head: () => ({
    meta: [
      { title: "AI Medical Assistant · MedLink" },
      { name: "description", content: "Your personal AI healthcare concierge — consultations, doctors, tests, medicines, and more." },
    ],
  }),
  component: AI,
});

/* -------------------- Types -------------------- */
type CardKind =
  | "consultation"
  | "doctor"
  | "hospital"
  | "test"
  | "medicine"
  | "advice"
  | "vaccine"
  | "report";

type Message =
  | { role: "user"; text: string; id: string }
  | { role: "assistant"; text?: string; card?: CardKind; followups?: string[]; id: string };

/* -------------------- Prompt seeds -------------------- */
const promptSeeds: { label: string; icon: any; kind: CardKind; query: string }[] = [
  { label: "I have a fever & sore throat", icon: Thermometer, kind: "consultation", query: "I have had a fever and sore throat for two days." },
  { label: "Find a cardiologist", icon: HeartPulse, kind: "doctor", query: "I need a heart specialist." },
  { label: "CBC blood test near me", icon: FlaskConical, kind: "test", query: "I need to do a CBC blood test." },
  { label: "Hospitals with MRI", icon: Building2, kind: "hospital", query: "Which hospitals have MRI facilities?" },
  { label: "About Paracetamol", icon: Pill, kind: "medicine", query: "Tell me about Paracetamol." },
  { label: "Lower blood pressure naturally", icon: Salad, kind: "advice", query: "How can I reduce high blood pressure naturally?" },
  { label: "Newborn vaccines", icon: Syringe, kind: "vaccine", query: "Which vaccines does a newborn need?" },
  { label: "Explain my blood test", icon: FileText, kind: "report", query: "Explain my blood test results." },
];

const quickChips = [
  "I have a fever",
  "Find a cardiologist",
  "I need a CBC test",
  "Find MRI facilities",
  "Explain my blood report",
  "Vaccination schedule",
  "Healthy diet tips",
  "Manage diabetes",
];

/* -------------------- Root -------------------- */
function AI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const uid = () => Math.random().toString(36).slice(2, 9);

  const send = (query: string, kind?: CardKind) => {
    if (!query.trim()) return;
    const userMsg: Message = { role: "user", text: query, id: uid() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const resolved = kind ?? inferKind(query);
      const asst: Message = { role: "assistant", card: resolved, followups: followupsFor(resolved), id: uid(), text: introFor(resolved) };
      setMessages((m) => [...m, asst]);
      setThinking(false);
    }, 1400);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const reset = () => setMessages([]);

  return (
    <PhoneFrame label="Patient · AI Assistant">
      <div className="relative flex h-full min-h-full flex-col bg-background">
        {/* Header */}
        <header className="glass-dark sticky top-0 z-20 flex items-center justify-between border-b border-border/50 px-4 py-3">
          <Link to="/patient" className="grid size-9 place-items-center rounded-full bg-surface shadow-card">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative grid size-8 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-float">
              <Sparkles className="size-4" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-surface" />
            </span>
            <div className="leading-tight">
              <p className="text-[13.5px] font-bold">Medical Assistant</p>
              <p className="text-[10.5px] text-muted-foreground">Doctor-reviewed · Private</p>
            </div>
          </div>
          <button onClick={reset} className="grid size-9 place-items-center rounded-full bg-surface shadow-card" aria-label="New chat">
            <Plus className="size-4" />
          </button>
        </header>

        {/* Scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar">
          {messages.length === 0 ? (
            <EmptyState onPick={(q, k) => send(q, k)} />
          ) : (
            <div className="space-y-4 px-4 pt-4 pb-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <UserBubble key={m.id} text={m.text} />
                ) : (
                  <AssistantMessage key={m.id} msg={m} onFollowup={(q) => send(q)} />
                )
              )}
              {thinking && <TypingBubble />}
            </div>
          )}
        </div>

        {/* Composer */}
        <Composer input={input} setInput={setInput} onSend={() => send(input)} />
      </div>
    </PhoneFrame>
  );
}

/* -------------------- Helpers -------------------- */
function inferKind(q: string): CardKind {
  const s = q.toLowerCase();
  if (/(cardio|heart specialist|doctor|specialist|neurolog|dermatolog)/.test(s)) return "doctor";
  if (/(mri|ct scan|x-?ray|hospital)/.test(s)) return "hospital";
  if (/(test|cbc|blood test|lab|diagnostic)/.test(s)) return "test";
  if (/(paracetamol|ibuprofen|medicine|drug|dosage)/.test(s)) return "medicine";
  if (/(vaccin|immuniz|newborn)/.test(s)) return "vaccine";
  if (/(blood report|report|explain.*result)/.test(s)) return "report";
  if (/(diet|blood pressure|diabetes|lifestyle|natural|advice)/.test(s)) return "advice";
  return "consultation";
}

function introFor(kind: CardKind): string {
  switch (kind) {
    case "consultation": return "I've reviewed your symptoms. Here's a digital consultation prepared from doctor-approved protocols.";
    case "doctor": return "Here are the top specialists near you, ranked by availability and patient ratings.";
    case "hospital": return "I found 3 hospitals nearby with the facilities you asked about.";
    case "test": return "Here's where you can get this test done today, with pricing and wait times.";
    case "medicine": return "Here's what you should know about this medication.";
    case "advice": return "Here's a gentle plan you can start today. Small, consistent changes work best.";
    case "vaccine": return "This is the recommended immunization schedule for a newborn.";
    case "report": return "I've summarized your report in plain language. Here's what stands out.";
  }
}

function followupsFor(kind: CardKind): string[] {
  switch (kind) {
    case "consultation": return ["Download prescription", "Explain in simple terms", "Show nearby hospitals"];
    case "doctor": return ["Find another specialist", "Compare doctors", "Book appointment"];
    case "hospital": return ["Compare hospitals", "Show only ICU", "Get directions"];
    case "test": return ["Book home collection", "Compare centers", "What does this test show?"];
    case "medicine": return ["Any interactions?", "Safe during pregnancy?", "Cheaper alternatives"];
    case "advice": return ["Weekly meal plan", "Track my progress", "Warning signs"];
    case "vaccine": return ["Set reminders", "Nearby clinics", "Side effects to watch"];
    case "report": return ["What should I ask my doctor?", "Recommended follow-ups", "Save to history"];
  }
}

/* -------------------- Empty State -------------------- */
function EmptyState({ onPick }: { onPick: (q: string, k: CardKind) => void }) {
  return (
    <div className="px-5 pt-6 pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] gradient-hero p-6 shadow-card">
        <div className="flex items-center gap-2 text-primary">
          <span className="grid size-8 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-float">
            <Sparkles className="size-4" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Medical Assistant</p>
        </div>
        <h1 className="mt-4 text-[26px] font-bold leading-[1.1] tracking-tight">
          Hello, Shirley.
          <br />
          <span className="text-primary">How can I help?</span>
        </h1>
        <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-muted-foreground">
          Ask about symptoms, find a doctor, look up a medicine, or understand a report.
        </p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-surface/80 p-2.5 shadow-card backdrop-blur">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <p className="text-[11.5px] leading-snug text-muted-foreground">
            Private & doctor-reviewed. Not a replacement for in-person care.
          </p>
        </div>
      </div>

      {/* Suggested actions */}
      <p className="mt-7 mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Try asking
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {promptSeeds.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.label}
              onClick={() => onPick(p.query, p.kind)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border/70 bg-surface p-3.5 text-left shadow-card transition active:scale-[0.97]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary-container text-primary">
                <Icon className="size-4" />
              </span>
              <span className="text-[12.5px] font-semibold leading-snug">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick chips */}
      <p className="mt-7 mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Quick prompts
      </p>
      <div className="flex flex-wrap gap-2">
        {quickChips.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c, inferKind(c))}
            className="rounded-full border border-border/70 bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground shadow-card active:scale-95"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Bubbles -------------------- */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end soft-in">
      <div className="max-w-[82%] rounded-[22px] rounded-tr-lg gradient-primary px-4 py-2.5 text-[13.5px] font-medium leading-snug text-primary-foreground shadow-float">
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 soft-in">
      <AssistantAvatar />
      <div className="flex items-center gap-1 rounded-2xl bg-surface px-3.5 py-3 shadow-card">
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground shadow-card">
      <Sparkles className="size-3.5" />
    </span>
  );
}

function AssistantMessage({ msg, onFollowup }: { msg: Extract<Message, { role: "assistant" }>; onFollowup: (q: string) => void }) {
  return (
    <div className="soft-in space-y-3">
      {msg.text && (
        <div className="flex items-start gap-2">
          <AssistantAvatar />
          <p className="max-w-[85%] pt-1 text-[13.5px] leading-relaxed text-foreground">{msg.text}</p>
        </div>
      )}
      {msg.card && <div className="pl-9">{renderCard(msg.card)}</div>}
      {msg.followups && (
        <div className="flex flex-wrap gap-2 pl-9">
          {msg.followups.map((f) => (
            <button
              key={f}
              onClick={() => onFollowup(f)}
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-container/60 px-3 py-1.5 text-[11.5px] font-semibold text-primary active:scale-95"
            >
              <Sparkles className="size-3" /> {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function renderCard(kind: CardKind) {
  switch (kind) {
    case "consultation": return <ConsultationCard />;
    case "doctor": return <DoctorCard />;
    case "hospital": return <HospitalCards />;
    case "test": return <TestCard />;
    case "medicine": return <MedicineCard />;
    case "advice": return <AdviceCard />;
    case "vaccine": return <VaccineCard />;
    case "report": return <ReportCard />;
  }
}

/* -------------------- Reusable card chrome -------------------- */
function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-[24px] border border-border/60 bg-surface shadow-card", className)}>
      {children}
    </section>
  );
}
function CardHeader({ icon: Icon, eyebrow, title, tone = "primary" }: { icon: any; eyebrow: string; title: string; tone?: "primary" | "warning" | "success" | "info" }) {
  const map = {
    primary: "bg-primary-container text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  }[tone];
  return (
    <div className="flex items-start gap-3 px-4 pt-4">
      <span className={cn("grid size-10 place-items-center rounded-2xl", map)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h3 className="mt-0.5 text-[15.5px] font-bold leading-tight tracking-tight">{title}</h3>
      </div>
    </div>
  );
}

/* -------------------- 1. Consultation Card -------------------- */
function ConsultationCard() {
  return (
    <CardShell>
      <div className="gradient-hero px-4 pb-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Digital Consultation</p>
            <h3 className="mt-1 text-[17px] font-bold leading-tight">Likely Viral Pharyngitis</h3>
          </div>
          <span className="grid size-9 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-float">
            <FileText className="size-4" />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip tone="warning" dot>Moderate</Chip>
          <Chip tone="primary" icon={Sparkles}>AI-assisted</Chip>
          <Chip tone="surface" icon={Clock}>Today</Chip>
        </div>
      </div>

      {/* Doctor */}
      <div className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-primary-container text-[13px] font-bold text-primary">EM</div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight">Dr. Elena Martínez, MD</p>
          <p className="text-[11px] text-muted-foreground">Internal Medicine · MedLink Reviewed</p>
        </div>
        <Chip tone="success" icon={ShieldCheck}>Verified</Chip>
      </div>

      {/* Meds */}
      <div className="border-t border-border/50 px-4 py-3">
        <SectionTitle icon={Pill}>Medication</SectionTitle>
        <div className="mt-2 space-y-2">
          {[
            { name: "Paracetamol 500mg", dose: "1 tab", freq: "Every 6h", dur: "3 days" },
            { name: "Cetirizine 10mg", dose: "1 tab", freq: "At night", dur: "5 days" },
          ].map((m) => (
            <div key={m.name} className="rounded-2xl bg-surface-variant/50 p-3">
              <p className="text-[12.5px] font-semibold">{m.name}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <MicroCell label="Dose" value={m.dose} />
                <MicroCell label="Frequency" value={m.freq} />
                <MicroCell label="Duration" value={m.dur} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Home care */}
      <div className="border-t border-border/50 px-4 py-3">
        <SectionTitle icon={HomeIcon}>Home care</SectionTitle>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { icon: Droplets, text: "8–10 glasses water" },
            { icon: Moon, text: "Rest 7–8 hours" },
            { icon: Utensils, text: "Warm soups" },
            { icon: Thermometer, text: "Monitor fever" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 rounded-xl bg-surface-variant/50 p-2.5">
              <Icon className="size-3.5 text-primary" />
              <span className="text-[11.5px] font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-start gap-2 rounded-2xl bg-warning/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="text-[12px] font-bold text-warning">See a doctor if</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-foreground/80">
              Fever &gt; 39.5°C for 48h · trouble breathing · rash · severe neck stiffness
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-border/50 px-4 py-3">
        <ActionBtn icon={Download} primary>Download PDF</ActionBtn>
        <ActionBtn icon={BookmarkPlus}>Save to history</ActionBtn>
      </div>
    </CardShell>
  );
}

/* -------------------- 2. Doctor Card -------------------- */
function DoctorCard() {
  const doctors = [
    { name: "Dr. Rajiv Menon", spec: "Cardiologist · MD, DM", hosp: "Metro Heart Institute", exp: 18, rating: 4.9, fee: 45, dist: 2.1, today: true, initials: "RM" },
    { name: "Dr. Sofia Alves", spec: "Cardiologist · MD", hosp: "St. Mercy Medical", exp: 12, rating: 4.8, fee: 40, dist: 3.4, today: true, initials: "SA" },
    { name: "Dr. Kenji Tanaka", spec: "Interventional Cardio", hosp: "Northshore Regional", exp: 22, rating: 4.9, fee: 60, dist: 4.8, today: false, initials: "KT" },
  ];
  return (
    <div className="space-y-2.5">
      {doctors.map((d) => (
        <CardShell key={d.name}>
          <div className="flex items-start gap-3 p-4">
            <div className="relative">
              <div className="grid size-14 place-items-center rounded-2xl gradient-primary text-[15px] font-bold text-primary-foreground shadow-float">
                {d.initials}
              </div>
              {d.today && <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-success ring-2 ring-surface" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold leading-tight">{d.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{d.spec}</p>
                </div>
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-[10.5px] font-bold text-warning">
                  <Star className="size-2.5 fill-warning" /> {d.rating}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Building2 className="size-3" />
                <span className="truncate">{d.hosp}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Chip tone="surface">{d.exp} yrs exp</Chip>
                <Chip tone="surface" icon={MapPin}>{d.dist} km</Chip>
                <Chip tone="primary">${d.fee}</Chip>
                {d.today && <Chip tone="success" dot>Available today</Chip>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 border-t border-border/50 p-2">
            <MiniAction icon={Info}>Profile</MiniAction>
            <MiniAction icon={Phone}>Call</MiniAction>
            <MiniAction icon={Navigation}>Directions</MiniAction>
          </div>
        </CardShell>
      ))}
    </div>
  );
}

/* -------------------- 3. Hospital Cards -------------------- */
function HospitalCards() {
  const hospitals = [
    { name: "St. Mercy Medical Center", dist: 1.8, open: true, services: ["MRI", "CT", "X-Ray", "Lab"], icu: 6, wait: "12 min", price: 220 },
    { name: "Northshore Regional", dist: 3.2, open: true, services: ["MRI", "X-Ray", "Lab"], icu: 9, wait: "20 min", price: 190 },
    { name: "Metro Heart Institute", dist: 5.1, open: true, services: ["MRI", "CT", "Cath Lab"], icu: 4, wait: "8 min", price: 260 },
  ];
  return (
    <div className="space-y-2.5">
      {hospitals.map((h) => (
        <CardShell key={h.name}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold leading-tight">{h.name}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><MapPin className="size-3" /> {h.dist} km</span>
                  <span>·</span>
                  <span className={cn("flex items-center gap-1 font-semibold", h.open ? "text-success" : "text-muted-foreground")}>
                    <span className={cn("size-1.5 rounded-full", h.open ? "bg-success" : "bg-muted-foreground")} />
                    {h.open ? "Open now" : "Closed"}
                  </span>
                </div>
              </div>
              <Chip tone="primary">${h.price}</Chip>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {h.services.map((s) => (
                <Chip key={s} tone="surface">{s}</Chip>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MicroTile icon={Activity} label="ICU beds" value={`${h.icu} free`} />
              <MicroTile icon={Clock} label="Wait time" value={h.wait} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 border-t border-border/50 p-2">
            <MiniAction icon={Phone}>Call</MiniAction>
            <MiniAction icon={Navigation}>Directions</MiniAction>
            <MiniAction icon={Info}>Details</MiniAction>
          </div>
        </CardShell>
      ))}
    </div>
  );
}

/* -------------------- 4. Diagnostic Test Card -------------------- */
function TestCard() {
  const centers = [
    { name: "St. Mercy Lab", price: 18, wait: "15 min", dist: 1.8, home: true },
    { name: "PathCare Diagnostics", price: 15, wait: "10 min", dist: 2.4, home: true },
    { name: "Northshore Lab", price: 22, wait: "25 min", dist: 3.2, home: false },
  ];
  return (
    <CardShell>
      <CardHeader icon={FlaskConical} eyebrow="Diagnostic Test" title="Complete Blood Count (CBC)" />
      <div className="px-4 pb-3 pt-2">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Checks red/white blood cells, hemoglobin & platelets. Fasting not required.
        </p>
      </div>
      <div className="border-t border-border/50">
        {centers.map((c, i) => (
          <div key={c.name} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-border/40")}>
            <span className="grid size-10 place-items-center rounded-2xl bg-primary-container text-primary">
              <FlaskConical className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] font-semibold">{c.name}</p>
                <span className="text-[13px] font-bold text-primary">${c.price}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="size-3" /> {c.dist} km
                <span>·</span>
                <Clock className="size-3" /> {c.wait}
                {c.home && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-success">Home sample</span>
                  </>
                )}
              </div>
            </div>
            <button className="grid size-8 place-items-center rounded-full bg-primary-container text-primary">
              <Phone className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border/50 p-3">
        <ActionBtn icon={HomeIcon} primary>Book home visit</ActionBtn>
        <ActionBtn icon={Info}>View details</ActionBtn>
      </div>
    </CardShell>
  );
}

/* -------------------- 5. Medicine Card -------------------- */
function MedicineCard() {
  return (
    <CardShell>
      <CardHeader icon={Pill} eyebrow="Medicine Information" title="Paracetamol (Acetaminophen)" />
      <div className="px-4 pb-3 pt-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="primary">Analgesic</Chip>
          <Chip tone="primary">Antipyretic</Chip>
          <Chip tone="success" icon={ShieldCheck}>OTC</Chip>
        </div>
      </div>

      <InfoBlock title="Primary uses">
        Relief of mild-to-moderate pain (headache, muscle ache) and reduction of fever.
      </InfoBlock>
      <InfoBlock title="Recommended dosage" tone="primary">
        Adults: 500–1000 mg every 4–6h. Max 4 g/day. Children: weight-based.
      </InfoBlock>
      <InfoBlock title="Common side effects">
        Rare at normal doses. Nausea or rash possible. Overdose harms liver.
      </InfoBlock>
      <InfoBlock title="Drug interactions">
        Caution with warfarin, alcohol, and other paracetamol-containing meds.
      </InfoBlock>
      <InfoBlock title="When not to use" tone="warning">
        Severe liver disease, alcohol dependency, or known hypersensitivity.
      </InfoBlock>

      <div className="grid grid-cols-2 gap-2 border-t border-border/50 p-3">
        <ActionBtn icon={BookOpen} primary>Learn more</ActionBtn>
        <ActionBtn icon={Sparkles}>Ask follow-up</ActionBtn>
      </div>
    </CardShell>
  );
}

/* -------------------- 6. Advice Card -------------------- */
function AdviceCard() {
  return (
    <CardShell>
      <CardHeader icon={Salad} eyebrow="Health Advice" title="Lowering blood pressure naturally" tone="success" />
      <div className="px-4 pb-2 pt-2">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          A calmer heart in 4–6 weeks — with small, sustainable habits. Track weekly.
        </p>
      </div>

      <AdviceRow icon={Activity} title="Lifestyle" points={["Sleep 7–8h", "Limit alcohol", "Quit smoking"]} />
      <AdviceRow icon={Salad} title="Diet" points={["DASH pattern", "Less sodium (<1.5g)", "More potassium"]} />
      <AdviceRow icon={HeartPulse} title="Exercise" points={["30 min walk × 5/wk", "Yoga or swimming", "Strength 2×/wk"]} />
      <AdviceRow icon={X} title="Avoid" tone="warning" points={["Processed food", "Sugary drinks", "Excess caffeine"]} />

      <div className="mx-3 mb-3 flex items-start gap-2 rounded-2xl bg-warning/10 p-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="text-[11.5px] leading-snug text-foreground/80">
          See a doctor if BP stays &gt; 140/90 for 2 weeks, or with chest pain / vision changes.
        </p>
      </div>
    </CardShell>
  );
}

function AdviceRow({ icon: Icon, title, points, tone = "primary" }: { icon: any; title: string; points: string[]; tone?: "primary" | "warning" }) {
  const toneCls = tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary-container text-primary";
  return (
    <div className="border-t border-border/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-7 place-items-center rounded-xl", toneCls)}>
          <Icon className="size-3.5" />
        </span>
        <p className="text-[12.5px] font-bold">{title}</p>
      </div>
      <ul className="mt-2 space-y-1 pl-9">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[12px]">
            <Check className="size-3 text-success" /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- 7. Vaccine Card -------------------- */
function VaccineCard() {
  const timeline = [
    { age: "At birth", vaccines: [{ name: "BCG", purpose: "Tuberculosis" }, { name: "Hep B (1st)", purpose: "Hepatitis B" }, { name: "OPV-0", purpose: "Polio" }] },
    { age: "6 weeks", vaccines: [{ name: "DTP-1", purpose: "Diphtheria, Tetanus, Pertussis" }, { name: "Hib-1", purpose: "Influenzae B" }, { name: "Rotavirus-1", purpose: "Rotavirus" }] },
    { age: "10 weeks", vaccines: [{ name: "DTP-2", purpose: "Second dose" }, { name: "IPV-1", purpose: "Polio (injected)" }] },
    { age: "14 weeks", vaccines: [{ name: "DTP-3", purpose: "Third dose" }, { name: "PCV", purpose: "Pneumococcal" }] },
    { age: "9 months", vaccines: [{ name: "MMR-1", purpose: "Measles, Mumps, Rubella" }] },
  ];
  return (
    <CardShell>
      <CardHeader icon={Syringe} eyebrow="Vaccination Schedule" title="Newborn immunization" tone="info" />
      <div className="px-4 pb-3 pt-2">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          WHO-aligned schedule. Timings may vary by country.
        </p>
      </div>
      <div className="relative border-t border-border/50 px-4 py-3">
        <div className="absolute left-[26px] top-6 bottom-6 w-px bg-border" />
        <div className="space-y-4">
          {timeline.map((row) => (
            <div key={row.age} className="relative flex gap-3">
              <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full gradient-primary text-primary-foreground shadow-card">
                <Syringe className="size-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{row.age}</p>
                <div className="mt-1.5 space-y-1.5">
                  {row.vaccines.map((v) => (
                    <div key={v.name} className="rounded-xl bg-surface-variant/50 p-2.5">
                      <p className="text-[12.5px] font-semibold">{v.name}</p>
                      <p className="text-[11px] text-muted-foreground">{v.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-3 mb-3 flex items-start gap-2 rounded-2xl bg-info/10 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-[11.5px] leading-snug text-foreground/80">
          Keep a vaccination card and set reminders 3 days before each dose.
        </p>
      </div>
    </CardShell>
  );
}

/* -------------------- 8. Report Summary Card -------------------- */
function ReportCard() {
  const findings = [
    { label: "Hemoglobin", value: "11.2 g/dL", range: "12–16", status: "low" as const },
    { label: "WBC", value: "7.8 K/µL", range: "4–11", status: "normal" as const },
    { label: "Platelets", value: "265 K/µL", range: "150–400", status: "normal" as const },
    { label: "Vitamin D", value: "18 ng/mL", range: "30–100", status: "low" as const },
    { label: "Cholesterol", value: "220 mg/dL", range: "<200", status: "high" as const },
  ];
  const statusMap = {
    normal: { c: "bg-success/10 text-success", label: "Normal" },
    low: { c: "bg-info/10 text-info", label: "Low" },
    high: { c: "bg-warning/10 text-warning", label: "High" },
  };
  return (
    <CardShell>
      <CardHeader icon={FileText} eyebrow="Report Summary" title="Blood test · Apr 18, 2026" tone="info" />
      <div className="px-4 pb-3 pt-2">
        <p className="text-[12.5px] leading-relaxed text-foreground/80">
          Most values are in the healthy range. Mild anemia and low Vitamin D — both easily improved.
        </p>
      </div>
      <div className="border-t border-border/50">
        {findings.map((f, i) => {
          const s = statusMap[f.status];
          return (
            <div key={f.label} className={cn("flex items-center justify-between gap-3 px-4 py-2.5", i > 0 && "border-t border-border/40")}>
              <div>
                <p className="text-[12.5px] font-semibold">{f.label}</p>
                <p className="text-[10.5px] text-muted-foreground">Ref: {f.range}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold tabular-nums">{f.value}</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", s.c)}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border/50 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Next steps</p>
        <ul className="mt-2 space-y-1.5 text-[12px]">
          <li className="flex items-start gap-2"><Check className="mt-0.5 size-3 shrink-0 text-success" /> Add iron-rich foods (spinach, lentils, red meat)</li>
          <li className="flex items-start gap-2"><Check className="mt-0.5 size-3 shrink-0 text-success" /> 15 min sunlight daily + Vit D3 supplement</li>
          <li className="flex items-start gap-2"><Check className="mt-0.5 size-3 shrink-0 text-success" /> Recheck lipid profile in 3 months</li>
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border/50 p-3">
        <ActionBtn icon={Download} primary>Download report</ActionBtn>
        <ActionBtn icon={BookmarkPlus}>Save to history</ActionBtn>
      </div>
    </CardShell>
  );
}

/* -------------------- Small primitives -------------------- */
function Chip({ children, tone = "surface", icon: Icon, dot }: { children: React.ReactNode; tone?: "primary" | "warning" | "success" | "surface" | "info"; icon?: any; dot?: boolean }) {
  const map = {
    primary: "bg-primary-container text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    surface: "bg-surface-variant/70 text-foreground",
  }[tone];
  const dotColor = { primary: "bg-primary", warning: "bg-warning", success: "bg-success", info: "bg-info", surface: "bg-muted-foreground" }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", map)}>
      {dot && <span className={cn("size-1.5 rounded-full", dotColor)} />}
      {Icon && <Icon className="size-3" />}
      {children}
    </span>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-primary" />
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{children}</p>
    </div>
  );
}

function MicroCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-1.5 text-center">
      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold">{value}</p>
    </div>
  );
}
function MicroTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-variant/60 p-2.5">
      <span className="grid size-7 place-items-center rounded-lg bg-surface text-primary">
        <Icon className="size-3.5" />
      </span>
      <div>
        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-[11.5px] font-bold">{value}</p>
      </div>
    </div>
  );
}
function ActionBtn({ children, icon: Icon, primary }: { children: React.ReactNode; icon: any; primary?: boolean }) {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-[12px] font-semibold transition active:scale-95",
        primary ? "gradient-primary text-primary-foreground shadow-float" : "bg-surface-variant text-foreground"
      )}
    >
      <Icon className="size-3.5" /> {children}
    </button>
  );
}
function MiniAction({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <button className="flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11.5px] font-semibold text-foreground/80 hover:bg-surface-variant active:scale-95">
      <Icon className="size-3.5" /> {children}
    </button>
  );
}
function InfoBlock({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "primary" | "warning" }) {
  const border = tone === "warning" ? "border-l-warning" : tone === "primary" ? "border-l-primary" : "border-l-border";
  return (
    <div className={cn("border-t border-border/50 px-4 py-2.5")}>
      <p className={cn("border-l-2 pl-2.5", border)}>
        <span className="block text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed">{children}</span>
      </p>
    </div>
  );
}

/* -------------------- Composer -------------------- */
function Composer({ input, setInput, onSend }: { input: string; setInput: (s: string) => void; onSend: () => void }) {
  return (
    <div className="glass-dark sticky bottom-0 z-20 border-t border-border/50 px-3 pt-2 pb-3">
      <div className="flex items-end gap-2 rounded-3xl border border-border/70 bg-surface p-1.5 shadow-card">
        <button className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-variant" aria-label="Attach">
          <Plus className="size-4" />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Ask anything about your health…"
          className="max-h-24 flex-1 resize-none bg-transparent py-2 text-[13.5px] outline-none placeholder:text-muted-foreground/70"
        />
        <button className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-variant" aria-label="Voice">
          <Mic className="size-4" />
        </button>
        <button
          onClick={onSend}
          disabled={!input.trim()}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full transition active:scale-90",
            input.trim() ? "gradient-primary text-primary-foreground shadow-float" : "bg-surface-variant text-muted-foreground"
          )}
          aria-label="Send"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        AI-assisted · Not a substitute for medical care
      </p>
    </div>
  );
}
