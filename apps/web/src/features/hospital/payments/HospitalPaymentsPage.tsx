import { useState } from "react";
import { getHospitalRequests } from "@/services/hospital.service";
import { Action, PageHead, Panel, PaymentPill, StatusPill } from "@/shared/components/ui/ReservationPrimitives";

export function HospitalPaymentsPage() {
	const [collected, setCollected] = useState<string[]>([]);
	const rows = getHospitalRequests()
		.filter((request) => request.charge > 0)
		.map((request) => collected.includes(request.id) ? { ...request, payment: "collected" as const } : request);
	const pending = rows.filter((request) => request.payment === "unpaid" || request.payment === "pending");
	const owed = rows.filter((request) => request.payment !== "settled").reduce((sum, request) => sum + request.serviceFee, 0);
	const settled = rows.filter((request) => request.payment === "settled").reduce((sum, request) => sum + request.serviceFee, 0);
	const stats = [
		{ label: "Fees pending", value: `$${pending.reduce((sum, request) => sum + request.serviceFee, 0).toFixed(2)}`, sub: `${pending.length} services` },
		{ label: "Owed to MedLink", value: `$${owed.toFixed(2)}`, sub: "Current cycle" },
		{ label: "Settled", value: `$${settled.toFixed(2)}`, sub: "This month" },
	];

	return <main className="hospital-payments">
		<PageHead title="Payment tracking" subtitle="MedLink service fees charged after successful service completion" />
		<div className="payment-stats">{stats.map((stat) => <div key={stat.label} className="payment-stat"><p>{stat.label}</p><strong>{stat.value}</strong><span>{stat.sub}</span></div>)}</div>
		<Panel title="Service fee ledger" subtitle="Hospital charge vs. MedLink fee">
			<div className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Service</th><th>Patient</th><th>Hospital charge</th><th>MedLink fee</th><th>Status</th><th>Payment</th><th /></tr></thead><tbody>
				{rows.map((request) => <tr key={request.id}><td><strong>{request.title}</strong><span>{request.department}</span></td><td>{request.patient}</td><td className="tabular-nums">${request.charge}</td><td className="payment-fee tabular-nums">${request.serviceFee}</td><td><StatusPill status={request.status} /></td><td><PaymentPill payment={request.payment} /></td><td className="payment-action">{(request.payment === "unpaid" || request.payment === "pending") && <Action tone="primary" onClick={() => setCollected((current) => [...current, request.id])}>Mark collected</Action>}</td></tr>)}
			</tbody></table></div>
		</Panel>
	</main>;
}
