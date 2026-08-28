import { useEffect } from "react";
import { FileText, Stethoscope, Tag, User, X } from "lucide-react";
import type { HospitalServiceRequest } from "@/types/hospital";

const kindLabels = { consultation: "Consultation", diagnostic: "Diagnostic", bed: "Bed reservation", icu: "ICU reservation", emergency: "Emergency SOS" } as const;

function formatLabel(key: string) { return key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase()); }
function formatValue(value: unknown) { return typeof value === "object" && value !== null ? JSON.stringify(value) : String(value); }
function pick(object: Record<string, unknown>, keys: string[]) { return keys.filter((key) => object[key] !== undefined && object[key] !== null && object[key] !== "").map((key) => ({ key, label: formatLabel(key), value: formatValue(object[key]) })); }

function InfoCard({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) { return <div className="request-info-card"><div className="request-info-title"><Icon /><h3>{title}</h3></div><div className="request-info-content">{children}</div></div>; }
function DetailRow({ label, value }: { label: string; value: string }) { return <div className="request-detail-row"><span>{label}</span><strong>{value}</strong></div>; }

export function RequestDetailsModal({ request, onClose }: { request: HospitalServiceRequest; onClose: () => void }) {
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, [onClose]);
  const record = request as unknown as Record<string, unknown>;
  const patientFields = pick(record, ["patient", "age", "gender", "phone", "contact"]);
  const requestFields = pick(record, ["doctor", "department", "date", "time", "createdAt", "roomType", "priority"]);
  const noteFields = pick(record, ["notes", "reason", "symptoms", "description"]);
  const knownKeys = new Set(["id", "kind", "status", "title", "hospital", "charge", "serviceFee", "payment", ...patientFields.map((field) => field.key), ...requestFields.map((field) => field.key), ...noteFields.map((field) => field.key)]);
  const otherFields = Object.entries(record).filter(([key, value]) => !knownKeys.has(key) && value !== null && value !== undefined && value !== "").map(([key, value]) => ({ key, label: formatLabel(key), value: formatValue(value) }));
  return <div className="request-modal-backdrop" onClick={onClose}><div className="request-modal" onClick={(event) => event.stopPropagation()}><div className="request-modal-header"><div><div className="request-modal-kind">{kindLabels[request.kind]} <span>#{request.id}</span></div><span className={`request-status request-status-${request.status}`}>{request.status}</span></div><button type="button" className="request-modal-close" onClick={onClose} aria-label="Close request details"><X /></button></div><div className="request-modal-body">{patientFields.length > 0 && <InfoCard icon={User} title="Patient">{patientFields.map((field) => <DetailRow key={field.key} label={field.label} value={field.value} />)}</InfoCard>}{requestFields.length > 0 && <InfoCard icon={Stethoscope} title="Request info">{requestFields.map((field) => <DetailRow key={field.key} label={field.label} value={field.value} />)}</InfoCard>}{noteFields.length > 0 && <InfoCard icon={FileText} title="Notes">{noteFields.map((field) => <p key={field.key}>{field.value}</p>)}</InfoCard>}{otherFields.length > 0 && <InfoCard icon={Tag} title="Other details">{otherFields.map((field) => <DetailRow key={field.key} label={field.label} value={field.value} />)}</InfoCard>}</div></div></div>;
}