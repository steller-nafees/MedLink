import { useEffect, useState } from "react";
import { CreditCard, Plus, X } from "lucide-react";
import { createHospitalPayment, getHospitalPaymentsFromApi, getHospitalReservationsFromApi, type HospitalPayment, type HospitalReservationRecord } from "@/services/hospital.service";
import { PageHead, Panel, PaymentPill } from "@/shared/components/ui/ReservationPrimitives";

const COORDINATION_FEE = 1000;

export function HospitalPaymentsPage() {
	const [rows, setRows] = useState<HospitalPayment[]>([]);
	const [reservations, setReservations] = useState<HospitalReservationRecord[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedReservationId, setSelectedReservationId] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const loadPayments = () => Promise.all([getHospitalPaymentsFromApi(), getHospitalReservationsFromApi()]).then(([paymentRecords, reservationRecords]) => {
		setRows(paymentRecords);
		setReservations(reservationRecords);
	});

	useEffect(() => { loadPayments().catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payments")); }, []);

	const paidReservationIds = new Set(rows.map((payment) => payment.reservation_id));
	const pendingReservations = reservations.filter((reservation) => !paidReservationIds.has(reservation.reservation_id));
	const pending = rows.filter((request) => request.payment_status === "UNPAID" || request.payment_status === "PENDING");
	const owed = rows.filter((request) => request.payment_status !== "PAID").reduce((sum, request) => sum + Number(request.total_amount), 0);
	const settled = rows.filter((request) => request.payment_status === "PAID").reduce((sum, request) => sum + Number(request.total_amount), 0);
	const stats = [
		{ label: "In transit", value: `BDT ${pending.reduce((sum, request) => sum + Number(request.total_amount), 0).toFixed(2)}`, sub: `${pending.length} services` },
		{ label: "Total paid", value: `BDT ${settled.toFixed(2)}`, sub: "Current cycle" },
		{ label: "Total unpaid", value: `BDT ${owed.toFixed(2)}`, sub: `${pendingReservations.length} awaiting payment` },
	];

	const openModal = () => {
		setSelectedReservationId(pendingReservations[0]?.reservation_id ?? "");
		setError(null);
		setIsModalOpen(true);
	};

	const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedReservationId) return;
		setSubmitting(true);
		setError(null);
		try {
			await createHospitalPayment({ reservationId: selectedReservationId, totalAmount: COORDINATION_FEE, paymentMethod: "CASH", paymentStatus: "PAID" });
			await loadPayments();
			setIsModalOpen(false);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to create payment");
		} finally {
			setSubmitting(false);
		}
	};

	return <main className="hospital-payments">
		<div className="payment-page-head"><PageHead title="Invoices" subtitle="Track MedLink coordination payments for hospital reservations" /><button className="payment-primary-button" type="button" onClick={openModal} disabled={!pendingReservations.length}><Plus size={16} /> New payment</button></div>
		{error ? <p className="payment-error" role="alert">{error}</p> : null}
		<div className="payment-stats">{stats.map((stat) => <div key={stat.label} className="payment-stat"><p>{stat.label}</p><strong>{stat.value}</strong><span>{stat.sub}</span></div>)}</div>
		<Panel title="Payment ledger" subtitle="Every paid payment is reflected in the patient's activity">
			<div className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Invoice ID</th><th>Issue date</th><th>Patient</th><th>Status</th><th>Service</th><th>Amount</th></tr></thead><tbody>
				{rows.map((request) => <tr key={request.payment_id}><td><span className="invoice-id"><CreditCard size={16} /> {request.payment_id.slice(0, 8)}</span></td><td>{formatDate(request.paid_at ?? request.created_at)}</td><td><strong>{request.patient_first_name ?? "Patient"} {request.patient_last_name ?? request.patient_id.slice(0, 8)}</strong></td><td><PaymentPill payment={request.payment_status.toLowerCase() as "unpaid"} /></td><td>{request.reservation_mode} reservation</td><td className="tabular-nums payment-amount">BDT {Number(request.total_amount).toFixed(2)}</td></tr>)}
				{!rows.length ? <tr><td className="payment-empty" colSpan={6}>No payments created yet.</td></tr> : null}
			</tbody></table></div>
		</Panel>
		{isModalOpen ? <div className="payment-modal-backdrop" role="presentation"><div className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="new-payment-title"><div className="payment-modal-head"><div><h2 id="new-payment-title">New payment</h2><p>Mark a reservation's MedLink coordination fee as paid.</p></div><button className="payment-close-button" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><X size={18} /></button></div><form onSubmit={submitPayment}><label htmlFor="payment-patient">Pending patient</label><select id="payment-patient" value={selectedReservationId} onChange={(event) => setSelectedReservationId(event.target.value)} required><option value="">Select a patient</option>{pendingReservations.map((reservation) => <option key={reservation.reservation_id} value={reservation.reservation_id}>{patientLabel(reservation)} · {reservation.reservation_mode}</option>)}</select><div className="payment-fee-summary"><span>MedLink coordination fee</span><strong>BDT {COORDINATION_FEE.toFixed(2)}</strong></div><button className="payment-submit-button" type="submit" disabled={submitting || !selectedReservationId}>{submitting ? "Creating..." : "Create as paid"}</button></form></div></div> : null}
	</main>;
}

function patientLabel(reservation: HospitalReservationRecord) {
	return `Patient ${reservation.user_id.slice(0, 8)}`;
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
