import { useState } from "react";
import { useEffect } from "react";
import { getHospitalPaymentsFromApi, type HospitalPayment } from "@/services/hospital.service";
import { PageHead, Panel, PaymentPill, StatusPill } from "@/shared/components/ui/ReservationPrimitives";

export function HospitalPaymentsPage() {
	const [rows, setRows] = useState<HospitalPayment[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => { getHospitalPaymentsFromApi().then(setRows).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payments")); }, []);
	const pending = rows.filter((request) => request.payment_status === "UNPAID" || request.payment_status === "PENDING");
	const owed = rows.filter((request) => request.payment_status !== "SETTLED").reduce((sum, request) => sum + Number(request.total_amount), 0);
	const settled = rows.filter((request) => request.payment_status === "SETTLED").reduce((sum, request) => sum + Number(request.total_amount), 0);
	const stats = [
		{ label: "Fees pending", value: `$${pending.reduce((sum, request) => sum + Number(request.total_amount), 0).toFixed(2)}`, sub: `${pending.length} services` },
		{ label: "Owed to MedLink", value: `$${owed.toFixed(2)}`, sub: "Current cycle" },
		{ label: "Settled", value: `$${settled.toFixed(2)}`, sub: "This month" },
	];

	if (error) return <main className="hospital-payments"><p role="alert">{error}</p></main>;
	if (!rows.length) return <main className="hospital-payments"><p>Loading payments...</p></main>;
	return <main className="hospital-payments">
		<PageHead title="Payment tracking" subtitle="MedLink service fees charged after successful service completion" />
		<div className="payment-stats">{stats.map((stat) => <div key={stat.label} className="payment-stat"><p>{stat.label}</p><strong>{stat.value}</strong><span>{stat.sub}</span></div>)}</div>
		<Panel title="Service fee ledger" subtitle="Hospital charge vs. MedLink fee">
			<div className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Service</th><th>Patient</th><th>Hospital charge</th><th>MedLink fee</th><th>Status</th><th>Payment</th><th /></tr></thead><tbody>
				{rows.map((request) => <tr key={request.payment_id}><td><strong>{request.reservation_mode} reservation</strong><span>{request.reservation_id}</span></td><td>{request.patient_first_name ?? "Patient"} {request.patient_last_name ?? request.patient_id.slice(0, 8)}</td><td className="tabular-nums">${Number(request.total_amount).toFixed(2)}</td><td className="payment-fee tabular-nums">Not provided</td><td><StatusPill status={request.reservation_status.toLowerCase() as "pending"} /></td><td><PaymentPill payment={request.payment_status.toLowerCase() as "unpaid"} /></td><td className="payment-action" /></tr>)}
			</tbody></table></div>
		</Panel>
	</main>;
}
