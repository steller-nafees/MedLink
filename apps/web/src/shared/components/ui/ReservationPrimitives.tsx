import type { ReactNode } from "react";
import { BedDouble, Droplet } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { HospitalReservation, HospitalRequestPayment, HospitalRequestStatus, ReservationStatus } from "@/types/hospital";

const statusLabels: Record<ReservationStatus, string> = { pending: "Pending", accepted: "Accepted", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" };
const statusClasses: Record<ReservationStatus, string> = { pending: "reservation-status-pending", accepted: "reservation-status-accepted", confirmed: "reservation-status-confirmed", completed: "reservation-status-completed", cancelled: "reservation-status-cancelled" };
const requestStatusLabels: Record<HospitalRequestStatus, string> = { pending: "Pending", accepted: "Accepted", confirmed: "Confirmed", scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };
const paymentLabels: Record<HospitalRequestPayment, string> = { unpaid: "Unpaid", pending: "Pending payment", paid: "Paid", collected: "Collected", settled: "Settled" };

export function PageHead({ title, subtitle }: { title: string; subtitle: string }) {
	return <header className="reservation-page-head"><div><h1>{title}</h1><p>{subtitle}</p></div></header>;
}

export function Action({ tone = "ghost", children, onClick }: { tone?: "primary" | "ghost" | "danger"; children: ReactNode; onClick?: () => void }) {
	return <Button variant={tone === "primary" ? "primary" : "secondary"} className={`reservation-action reservation-action-${tone}`} onClick={onClick}>{children}</Button>;
}

export function StatusPill({ status }: { status: HospitalRequestStatus }) {
	return <span className={`payment-status payment-status-${status}`}>{requestStatusLabels[status]}</span>;
}

export function PaymentPill({ payment }: { payment: HospitalRequestPayment }) {
	return <span className={`payment-pill payment-pill-${payment}`}>{paymentLabels[payment]}</span>;
}

export function RequestRow({ request, actions }: { request: HospitalReservation; actions?: ReactNode }) {
	const Icon = request.kind === "icu" ? Droplet : BedDouble;
	return <div className="reservation-request-row"><div className={`reservation-kind reservation-kind-${request.kind}`}><Icon /></div><div className="reservation-patient"><strong>{request.patient}</strong><span>{request.title} · {request.department}</span></div><div className="reservation-date">{request.date}<br />{request.time}</div><div className="reservation-charge"><span>Charge </span><strong>${request.charge}</strong><span> · fee </span><strong>${request.serviceFee}</strong></div><div className="reservation-badges"><span className={`reservation-status ${statusClasses[request.status]}`}>{statusLabels[request.status]}</span><span className="reservation-payment">{request.payment === "pending" ? "Pending payment" : request.payment[0].toUpperCase() + request.payment.slice(1)}</span></div><div className="reservation-row-actions">{actions}</div></div>;
}

export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
	return <section className="reservation-panel"><header><div><h2>{title}</h2><p>{subtitle}</p></div></header>{children}</section>;
}