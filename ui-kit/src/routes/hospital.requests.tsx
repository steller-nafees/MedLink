import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { hospitalRequests, type ServiceRequest } from "@/lib/medlink/data";
import { PageHead, Panel, RequestRow, Action } from "@/components/medlink/hospital-kit";
import { cn } from "@/lib/utils";
import { X, User, Stethoscope, CalendarClock, FileText, Tag } from "lucide-react";

export const Route = createFileRoute("/hospital/requests")({
  head: () => ({
    meta: [
      { title: "Incoming Requests · MedLink Hospital" },
      { name: "description", content: "Accept, reject and complete patient requests across all MedLink services." },
      { property: "og:title", content: "Incoming Requests · MedLink Hospital" },
      { property: "og:description", content: "One inbox for consultations, tests, beds, ICU and emergencies." },
    ],
  }),
  component: Requests,
});

const tabs = ["All", "Consultations", "Diagnostics", "Beds & ICU", "Emergency"] as const;

function Requests() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [overrides, setOverrides] = useState<Record<string, ServiceRequest["status"]>>({});
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);

  const set = (id: string, status: ServiceRequest["status"]) =>
    setOverrides((o) => ({ ...o, [id]: status }));

  const list = hospitalRequests
    .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id] } : r))
    .filter((r) => {
      if (tab === "Consultations") return r.kind === "consultation";
      if (tab === "Diagnostics") return r.kind === "diagnostic";
      if (tab === "Beds & ICU") return r.kind === "bed" || r.kind === "icu";
      if (tab === "Emergency") return r.kind === "emergency";
      return true;
    });

  return (
    <div>
      <PageHead title="Incoming requests" subtitle="Consultations, diagnostics, reservations and emergency SOS in one inbox" />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-4 py-2 text-[12.5px] font-semibold transition active:scale-95",
              tab === t ? "border-transparent bg-foreground text-background" : "border-border/70 bg-surface text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Panel title="Requests" subtitle={`${list.length} shown`}>
        {list.map((r) => (
          <RequestRow
            key={r.id}
            req={r}
            actions={
              <>
                {r.status === "pending" && (
                  <>
                    <Action tone="primary" onClick={() => set(r.id, "accepted")}>Accept</Action>
                    <Action tone="danger" onClick={() => set(r.id, "cancelled")}>Reject</Action>
                  </>
                )}
                {(r.status === "accepted" || r.status === "confirmed" || r.status === "scheduled") && (
                  <Action tone="primary" onClick={() => set(r.id, "completed")}>Mark completed</Action>
                )}
                <Action onClick={() => setActiveRequest(r)}>View</Action>
              </>
            }
          />
        ))}
        {!list.length && <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">No requests in this category.</p>}
      </Panel>

      {activeRequest && (
        <RequestDetailsModal request={activeRequest} onClose={() => setActiveRequest(null)} />
      )}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  accepted: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  confirmed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const kindLabels: Record<string, string> = {
  consultation: "Consultation",
  diagnostic: "Diagnostic",
  bed: "Bed reservation",
  icu: "ICU reservation",
  emergency: "Emergency SOS",
};

function RequestDetailsModal({ request, onClose }: { request: ServiceRequest; onClose: () => void }) {
  const r = request as Record<string, unknown>;

  const patientFields = pick(r, ["patientName", "name", "age", "gender", "phone", "contact"]);
  const requestFields = pick(r, ["doctor", "department", "date", "time", "createdAt", "roomType", "priority"]);
  const noteFields = pick(r, ["notes", "reason", "symptoms", "description"]);

  const knownKeys = new Set([
    "id", "kind", "status",
    ...patientFields.map((f) => f.key),
    ...requestFields.map((f) => f.key),
    ...noteFields.map((f) => f.key),
  ]);
  const otherFields = Object.entries(r)
    .filter(([key, value]) => !knownKeys.has(key) && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({ key, label: formatLabel(key), value: formatValue(value) }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/70 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between border-b border-border/60 bg-surface/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {kindLabels[request.kind] ?? request.kind}
              </span>
              <span className="text-[11px] text-muted-foreground">#{request.id}</span>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold capitalize",
                statusStyles[request.status] ?? "bg-muted text-muted-foreground"
              )}
            >
              {request.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 p-1.5 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {patientFields.length > 0 && (
            <InfoCard icon={User} title="Patient">
              {patientFields.map((f) => (
                <DetailRow key={f.key} label={f.label} value={f.value} />
              ))}
            </InfoCard>
          )}

          {requestFields.length > 0 && (
            <InfoCard icon={Stethoscope} title="Request info">
              {requestFields.map((f) => (
                <DetailRow key={f.key} label={f.label} value={f.value} />
              ))}
            </InfoCard>
          )}

          {noteFields.length > 0 && (
            <InfoCard icon={FileText} title="Notes">
              {noteFields.map((f) => (
                <p key={f.key} className="text-[13px] leading-relaxed text-foreground">
                  {f.value}
                </p>
              ))}
            </InfoCard>
          )}

          {otherFields.length > 0 && (
            <InfoCard icon={Tag} title="Other details">
              {otherFields.map((f) => (
                <DetailRow key={f.key} label={f.label} value={f.value} />
              ))}
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function pick(obj: Record<string, unknown>, keys: string[]) {
  return keys
    .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== "")
    .map((k) => ({ key: k, label: formatLabel(k), value: formatValue(obj[k]) }));
}

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown) {
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}