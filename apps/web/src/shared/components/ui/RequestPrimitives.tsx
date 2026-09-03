import type { ComponentType, ReactNode } from "react";
import { BedDouble, FlaskConical, HeartPulse, Siren, Stethoscope } from "lucide-react";
import type { HospitalRequestKind, HospitalRequestPayment, HospitalRequestStatus, HospitalServiceRequest } from "@/types/hospital";
import { Button } from "@/shared/components/ui/Button";

const kindIcons: Record<HospitalRequestKind, ComponentType<{ className?: string }>> = { consultation: Stethoscope, diagnostic: FlaskConical, bed: BedDouble, icu: HeartPulse, emergency: Siren };
const statusLabels: Record<HospitalRequestStatus, string> = { pending: "Pending", accepted: "Accepted", confirmed: "Confirmed", scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };
const paymentLabels: Record<HospitalRequestPayment, string> = { unpaid: "Unpaid", pending: "Pending payment", paid: "Paid", collected: "Collected", settled: "Settled" };

export function RequestAction({ tone = "ghost", children, onClick }: { tone?: "primary" | "ghost" | "danger"; children: ReactNode; onClick?: () => void }) {
  return <Button variant={tone === "primary" ? "primary" : "secondary"} className={`request-action request-action-${tone}`} onClick={onClick}>{children}</Button>;
}

export function RequestRow({ request, actions }: { request: HospitalServiceRequest; actions?: ReactNode }) {
  const Icon = kindIcons[request.kind];
  return <div className="request-row"><div className={`request-kind request-kind-${request.kind}`}><Icon /></div><div className="request-patient"><strong>{request.patient}</strong><span>{request.title} · {request.department}</span></div><div className="request-date">{request.date}<br />{request.time}</div><div className="request-charge"><span>Charge </span><strong>BDT {request.charge}</strong><span> · fee </span><strong>BDT {request.serviceFee}</strong></div><div className="request-badges"><span className={`request-status request-status-${request.status}`}>{statusLabels[request.status]}</span><span className={`request-payment request-payment-${request.payment}`}>{paymentLabels[request.payment]}</span></div><div className="request-row-actions">{actions}</div></div>;
}

export function RequestPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="request-panel"><header><div><h2>{title}</h2><p>{subtitle}</p></div></header>{children}</section>;
}