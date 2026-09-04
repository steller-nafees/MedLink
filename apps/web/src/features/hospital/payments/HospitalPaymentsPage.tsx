import { useEffect, useMemo, useState } from "react";
import { Activity, BedDouble, Check, CreditCard, FileText, Plus, Trash2, X } from "lucide-react";
import { createHospitalPayment, getHospitalPaymentsFromApi, getHospitalReservationsFromApi, type HospitalPayment, type HospitalReservationRecord } from "@/services/hospital.service";
import { PageHead, Panel, PaymentPill } from "@/shared/components/ui/ReservationPrimitives";
import invoiceLogo from "@/assets/images/Logos/medlink-dashboard-logo.png";

const COORDINATION_FEE = 1000;
const BED_RATES: Record<string, number> = { "icu": 12000, "emergency ward": 8000, "general ward": 3500, "pediatric ward": 4500 };
const DEFAULT_BED_RATE = 3500;
const EMPTY_SERVICE = { name: "", quantity: 1, unitPrice: 0 };
type InvoiceService = { name: string; quantity: number; unitPrice: number };
type InvoiceLineItem = { description: string; quantity: number; unitPrice: number; amount: number };

export function HospitalPaymentsPage() {
	const [rows, setRows] = useState<HospitalPayment[]>([]);
	const [reservations, setReservations] = useState<HospitalReservationRecord[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedReservationId, setSelectedReservationId] = useState("");
	const [services, setServices] = useState<InvoiceService[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const selectedReservation = reservations.find((reservation) => reservation.reservation_id === selectedReservationId);
	const bedRate = getBedRate(selectedReservation);
	const invoice = useMemo(() => calculateInvoice(selectedReservation, bedRate, services), [selectedReservation, bedRate, services]);

	const loadPayments = () => Promise.all([getHospitalPaymentsFromApi(), getHospitalReservationsFromApi()]).then(([paymentRecords, reservationRecords]) => {
		setRows(paymentRecords);
		setReservations(reservationRecords);
	});

	useEffect(() => { loadPayments().catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payments")); }, []);

	useEffect(() => {
		if (!isModalOpen) return;
		const refreshReservations = () => getHospitalReservationsFromApi().then(setReservations).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to refresh reservation status"));
		const intervalId = window.setInterval(refreshReservations, 5000);
		return () => window.clearInterval(intervalId);
	}, [isModalOpen]);

	useEffect(() => {
		if (!isModalOpen) return;
		const header = document.querySelector<HTMLElement>(".invoice-modal .payment-modal-head");
		if (!header) return;
		const actions = document.createElement("div");
		actions.className = "invoice-actions";
		const addAction = (label: string, onClick: () => void) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "invoice-action-button";
			button.title = label;
			button.textContent = label;
			button.addEventListener("click", onClick);
			actions.append(button);
		};
		addAction("Print", () => printInvoice(selectedReservation, invoice, services));
		addAction("Save PDF", () => printInvoice(selectedReservation, invoice, services));
		addAction("Send", () => sendInvoice(selectedReservation, invoice));
		header.append(actions);
		return () => actions.remove();
	}, [invoice, isModalOpen, selectedReservation, services]);

	useEffect(() => {
		const table = document.querySelector<HTMLTableElement>(".payment-table");
		if (!table || !rows.length) return;
		const headerRow = table.tHead?.rows[0];
		if (headerRow && !headerRow.querySelector(".payment-download-heading")) {
			const heading = document.createElement("th");
			heading.className = "payment-download-heading";
			heading.textContent = "Actions";
			headerRow.append(heading);
		}
		table.tBodies[0]?.querySelectorAll("tr").forEach((row, index) => {
			if (!rows[index] || row.querySelector(".payment-download-cell")) return;
			const cell = document.createElement("td");
			cell.className = "payment-download-cell";
			const button = document.createElement("button");
			button.type = "button";
			button.className = "payment-download-button";
			button.textContent = "Download";
			button.title = "Download invoice";
			button.addEventListener("click", () => downloadPaymentInvoice(rows[index]));
			cell.append(button);
			row.append(cell);
		});
		return () => {
			headerRow?.querySelector(".payment-download-heading")?.remove();
			table.tBodies[0]?.querySelectorAll(".payment-download-cell").forEach((cell) => cell.parentElement?.removeChild(cell));
		};
	}, [rows]);

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
		setServices([]);
		setError(null);
		setIsModalOpen(true);
	};

	const selectReservation = (reservationId: string) => {
		setSelectedReservationId(reservationId);
	};

	const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedReservationId || !invoice.valid) return;
		setSubmitting(true);
		setError(null);
		try {
			await createHospitalPayment({ reservationId: selectedReservationId, totalAmount: invoice.total, paymentMethod: "CASH", paymentStatus: "PAID" });
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
				{rows.map((request) => <tr key={request.payment_id}><td><span className="invoice-id"><CreditCard size={16} /> {request.payment_id.slice(0, 8)}</span></td><td>{formatDate(request.paid_at ?? request.created_at)}</td><td><strong>{[request.patient_first_name, request.patient_last_name].filter(Boolean).join(" ") || "Unnamed patient"}</strong></td><td><PaymentPill payment={request.payment_status.toLowerCase() as "unpaid"} /></td><td>{request.reservation_mode} reservation</td><td className="tabular-nums payment-amount">BDT {Number(request.total_amount).toFixed(2)}</td></tr>)}
				{!rows.length ? <tr><td className="payment-empty" colSpan={6}>No payments created yet.</td></tr> : null}
			</tbody></table></div>
		</Panel>
		{isModalOpen ? <div className="payment-modal-backdrop" role="presentation"><div className="payment-modal invoice-modal" role="dialog" aria-modal="true" aria-labelledby="new-payment-title"><div className="payment-modal-head"><div><div className="invoice-kicker"><FileText size={14} /> Invoice draft</div><h2 id="new-payment-title">Create invoice</h2><p>Build a clear final bill for this reservation.</p></div><button className="payment-close-button" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close"><X size={18} /></button></div><form onSubmit={submitPayment}><div className="invoice-layout"><div className="invoice-editor"><label htmlFor="payment-patient">Reservation</label><select id="payment-patient" value={selectedReservationId} onChange={(event) => selectReservation(event.target.value)} required><option value="">Select a patient</option>{pendingReservations.map((reservation) => <option key={reservation.reservation_id} value={reservation.reservation_id}>{patientLabel(reservation)} · {reservation.reservation_mode}</option>)}</select>{selectedReservation ? <div className="invoice-reservation-card"><div className="invoice-bed-icon"><BedDouble size={18} /></div><div><strong>{selectedReservation.ward_name ?? "Hospital ward"}</strong><span>Bed {selectedReservation.bed_number ?? "Not assigned"} · {selectedReservation.reservation_mode}</span></div><Check size={16} /></div> : null}<div className="invoice-section-heading"><span>Stay calculation</span><span className="invoice-auto-label"><Activity size={13} /> Automatic</span></div><div className="invoice-time-grid"><div><label htmlFor="invoice-start">Reservation start</label><input id="invoice-start" value={formatDateTime(selectedReservation?.requested_at)} readOnly /></div><div><label htmlFor="invoice-completion">SOS completed</label><input id="invoice-completion" value={formatDateTime(selectedReservation?.event_updated_at)} readOnly placeholder="Waiting for completion" /></div></div><div className="invoice-day-pill"><span>Billable days</span><strong>{invoice.days}</strong></div><div className="invoice-section-heading"><span>Additional support</span><button className="invoice-add-service" type="button" onClick={() => setServices((current) => [...current, { ...EMPTY_SERVICE }])}><Plus size={14} /> Add support</button></div><div className="invoice-support-hint">Add each extra support separately: service name, unit, and price per unit.</div><div className="invoice-services">{services.map((service, index) => <div className="invoice-service-row" key={`service-${index}`}><input aria-label="Service name" placeholder="Service name (e.g. Oxygen support)" value={service.name} onChange={(event) => updateService(setServices, services, index, "name", event.target.value)} /><input aria-label="Quantity" type="number" min="1" step="1" placeholder="Unit" value={service.quantity} onChange={(event) => updateService(setServices, services, index, "quantity", Math.max(1, Number(event.target.value)))} /><input aria-label="Unit price" type="number" min="0" step="0.01" placeholder="Price per unit" value={service.unitPrice || ""} onChange={(event) => updateService(setServices, services, index, "unitPrice", Math.max(0, Number(event.target.value)))} /><button type="button" aria-label="Remove service" onClick={() => setServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index))}><Trash2 size={15} /></button></div>)}{!services.length ? <p className="invoice-empty-services">No additional support added.</p> : null}</div></div><aside className="invoice-summary"><div className="invoice-summary-top"><span>Invoice total</span><strong>BDT {invoice.total.toFixed(2)}</strong></div><div className="invoice-summary-rule" /><div className="invoice-line"><span>Bed · {invoice.days} days</span><strong>BDT {invoice.bedSubtotal.toFixed(2)}</strong></div>{services.filter((service) => service.name.trim()).map((service, index) => <div className="invoice-line" key={`summary-service-${index}`}><span>{service.name} · {service.quantity} × BDT {service.unitPrice.toFixed(2)}</span><strong>BDT {(service.quantity * service.unitPrice).toFixed(2)}</strong></div>)}<div className="invoice-line"><span>MedLink coordination</span><strong>BDT {COORDINATION_FEE.toFixed(2)}</strong></div><div className="invoice-summary-rule" /><div className="invoice-total-line"><span>Total due</span><strong>BDT {invoice.total.toFixed(2)}</strong></div>{!invoice.valid ? <p className="invoice-validation">{invoice.error}</p> : <p className="invoice-note">Calculated from reservation time to SOS completion, </p>}<button className="payment-submit-button invoice-submit" type="submit" disabled={submitting || !selectedReservationId || !invoice.valid}>{submitting ? "Creating invoice..." : "Create invoice"}</button></aside></div></form></div></div> : null}
	</main>;
}

function patientLabel(reservation: HospitalReservationRecord) {
	return [reservation.patient_first_name, reservation.patient_last_name].filter(Boolean).join(" ") || "Unnamed patient";
}

function formatInvoiceNumber(id: string) {
	return `INV-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/**
 * Builds a polished, print-ready invoice document. Shared by the draft
 * invoice (Print / Save PDF) and the ledger's Download action so every
 * invoice a patient receives looks the same.
 */
function buildInvoiceHtml(options: {
	invoiceNumber: string;
	status: "DRAFT" | "PAID";
	issueDate: string;
	patientName: string;
	wardName: string;
	bedNumber?: string | number | null;
	reservationMode: string;
	lineItems: InvoiceLineItem[];
	coordinationFee: number;
	total: number;
	paidDate?: string | null;
}) {
	const { invoiceNumber, status, issueDate, patientName, wardName, bedNumber, reservationMode, lineItems, coordinationFee, total, paidDate } = options;
	const money = (value: number) => `BDT ${value.toFixed(2)}`;
	const itemsHtml = lineItems.map((item) => `
		<tr>
			<td class="desc">${item.description}</td>
			<td class="num">${item.quantity}</td>
			<td class="num">${money(item.unitPrice)}</td>
			<td class="num amount">${money(item.amount)}</td>
		</tr>`).join("");

	return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${invoiceNumber} · MedLink Invoice</title>
<style>
	* { box-sizing: border-box; }
	body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #1c2b33; margin: 0; padding: 48px; background: #ffffff; }
	.sheet { max-width: 760px; margin: 0 auto; }
	.top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 24px; margin-bottom: 32px; }
	.brand { display: flex; align-items: center; gap: 12px; }
	.brand-mark { width: 44px; height: 44px; border-radius: 10px; background: #0f766e; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
	.brand-name { font-size: 20px; font-weight: 700; color: #0f172a; }
	.brand-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
	.title-block { text-align: right; }
	.title-block h1 { margin: 0; font-size: 26px; letter-spacing: 1px; color: #0f172a; }
	.invoice-number { font-size: 13px; color: #64748b; margin-top: 4px; }
	.status-badge { display: inline-block; margin-top: 10px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
	.status-badge.paid { background: #dcfce7; color: #15803d; }
	.status-badge.draft { background: #fef3c7; color: #b45309; }
	.meta { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
	.meta h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8; margin: 0 0 8px; }
	.meta p { margin: 0 0 4px; font-size: 14px; color: #334155; }
	.meta strong { color: #0f172a; font-size: 15px; }
	table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
	table.items thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; padding: 8px 6px; }
	table.items td { padding: 12px 6px; font-size: 14px; border-bottom: 1px solid #eef2f4; color: #334155; }
	table.items td.num { text-align: right; width: 110px; }
	table.items td.desc { color: #0f172a; font-weight: 500; }
	table.items td.amount { font-weight: 600; color: #0f172a; }
	.totals { margin-left: auto; width: 280px; }
	.totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
	.totals .grand { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 14px; font-size: 18px; font-weight: 700; color: #0f172a; }
	.footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
	.footer p { margin: 0; font-size: 12px; color: #94a3b8; }
	.thanks { font-size: 13px; color: #334155; font-style: italic; }
	@media print {
		body { padding: 0; }
		.sheet { max-width: none; padding: 32px; }
	}
</style>
</head>
<body>
	<div class="sheet">
		<div class="top">
			<div class="brand">
				<div><img src="${invoiceLogo}" style="max-width: 180px;" alt="Medlink Logo" /></div>
			</div>
			<div class="title-block">
				<h1>INVOICE</h1>
				<div class="invoice-number">${invoiceNumber}</div>
				<span class="status-badge ${status === "PAID" ? "paid" : "draft"}">${status === "PAID" ? "PAID" : "DRAFT"}</span>
			</div>
		</div>
		<div class="meta">
			<div>
				<h3>Billed to</h3>
				<p><strong>${patientName}</strong></p>
				<p>${wardName}${bedNumber ? ` · Bed ${bedNumber}` : ""}</p>
				<p>${reservationMode} reservation</p>
			</div>
			<div style="text-align:right">
				<h3>Invoice details</h3>
				<p><strong>Issue date</strong> &nbsp; ${issueDate}</p>
				${paidDate ? `<p><strong>Paid on</strong> &nbsp; ${paidDate}</p>` : ""}
			</div>
		</div>
		<table class="items">
			<thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead>
			<tbody>${itemsHtml}</tbody>
		</table>
		<div class="totals">
			<div class="row"><span>Subtotal</span><span>${money(total - coordinationFee)}</span></div>
			<div class="row"><span>MedLink coordination fee</span><span>${money(coordinationFee)}</span></div>
			<div class="row grand"><span>Total due</span><span>${money(total)}</span></div>
		</div>
		<div class="footer">
			<p class="thanks">Thank you for trusting MedLink with your care coordination.</p>
			<p>Generated ${new Date().toLocaleString()}</p>
		</div>
	</div>
</body>
</html>`;
}

/**
 * Opens the invoice in a new tab and triggers the browser's native print
 * dialog, so patients get the standard "Save as PDF / Print" chooser
 * instead of a raw file download.
 */
function openInvoicePrintView(html: string) {
	const printWindow = window.open("", "_blank", "width=900,height=700");
	if (!printWindow) return;
	printWindow.document.write(html);
	printWindow.document.close();
	printWindow.focus();
	// Give the new document a tick to lay out before invoking print.
	printWindow.onload = () => {
		printWindow.print();
	};
	setTimeout(() => printWindow.print(), 300);
}

function printInvoice(reservation: HospitalReservationRecord | undefined, invoice: ReturnType<typeof calculateInvoice>, services: InvoiceService[]) {
	if (!reservation || !invoice.valid) return;
	const lineItems: InvoiceLineItem[] = [
		{ description: `Bed stay (${invoice.days} day${invoice.days === 1 ? "" : "s"})`, quantity: invoice.days, unitPrice: invoice.bedSubtotal / invoice.days, amount: invoice.bedSubtotal },
		...services.filter((service) => service.name.trim()).map((service) => ({ description: service.name, quantity: service.quantity, unitPrice: service.unitPrice, amount: service.quantity * service.unitPrice })),
	];
	const html = buildInvoiceHtml({
		invoiceNumber: formatInvoiceNumber(reservation.reservation_id),
		status: "DRAFT",
		issueDate: formatDate(reservation.updated_at),
		patientName: patientLabel(reservation),
		wardName: reservation.ward_name ?? "Hospital ward",
		bedNumber: reservation.bed_number,
		reservationMode: reservation.reservation_mode,
		lineItems,
		coordinationFee: COORDINATION_FEE,
		total: invoice.total,
	});
	openInvoicePrintView(html);
}

function sendInvoice(reservation: HospitalReservationRecord | undefined, invoice: ReturnType<typeof calculateInvoice>) {
	if (!reservation || !invoice.valid) return;
	const patient = patientLabel(reservation);
	const subject = `MedLink invoice for ${patient}`;
	const body = `Invoice for ${patient}\n\nTotal: BDT ${invoice.total.toFixed(2)}\nBed stay: BDT ${invoice.bedSubtotal.toFixed(2)}\nCoordination fee: BDT ${COORDINATION_FEE.toFixed(2)}${invoice.servicesTotal ? `\nAdditional services: BDT ${invoice.servicesTotal.toFixed(2)}` : ""}`;
	window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function downloadPaymentInvoice(payment: HospitalPayment) {
	const patient = [payment.patient_first_name, payment.patient_last_name].filter(Boolean).join(" ") || "Unnamed patient";
	const total = Number(payment.total_amount);
	const html = buildInvoiceHtml({
		invoiceNumber: formatInvoiceNumber(payment.payment_id),
		status: "PAID",
		issueDate: formatDate(payment.created_at),
		patientName: patient,
		wardName: payment.ward_name ?? "Hospital ward",
		bedNumber: payment.bed_number,
		reservationMode: payment.reservation_mode,
		lineItems: [{ description: `${payment.reservation_mode} reservation · hospital services`, quantity: 1, unitPrice: total - COORDINATION_FEE, amount: total - COORDINATION_FEE }],
		coordinationFee: COORDINATION_FEE,
		total,
		paidDate: payment.paid_at ? formatDate(payment.paid_at) : undefined,
	});
	openInvoicePrintView(html);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function getBedRate(reservation?: HospitalReservationRecord) {
	const ward = (reservation?.ward_name ?? reservation?.reservation_mode ?? "").toLowerCase();
	return Object.entries(BED_RATES).find(([name]) => ward.includes(name))?.[1] ?? DEFAULT_BED_RATE;
}

function calculateInvoice(reservation: HospitalReservationRecord | undefined, nightlyRate: number, services: InvoiceService[]) {
	if (!reservation) return { valid: false, error: "Select a reservation to start the invoice.", baseDays: 0, days: 0, bedSubtotal: 0, servicesTotal: 0, total: 0 };
	const start = Date.parse(reservation.requested_at);
	const completion = reservation.event_updated_at ? Date.parse(reservation.event_updated_at) : Number.NaN;
	if (!Number.isFinite(start) || !Number.isFinite(completion) || completion < start) return { valid: false, error: "SOS completion time is required to calculate the stay.", baseDays: 0, days: 0, bedSubtotal: 0, servicesTotal: 0, total: 0 };
	const baseDays = Math.max(1, Math.ceil((completion - start) / 86400000));
	const servicesTotal = services.reduce((sum, service) => sum + service.quantity * service.unitPrice, 0);
	const bedSubtotal = baseDays * nightlyRate;
	return { valid: services.every((service) => service.name.trim() && service.quantity > 0 && service.unitPrice >= 0), error: "Complete each service row or remove it.", baseDays, days: baseDays, bedSubtotal, servicesTotal, total: roundMoney(bedSubtotal + servicesTotal + COORDINATION_FEE) };
}

function updateService(setServices: React.Dispatch<React.SetStateAction<InvoiceService[]>>, services: InvoiceService[], index: number, field: keyof InvoiceService, value: string | number) {
	setServices(services.map((service, serviceIndex) => serviceIndex === index ? { ...service, [field]: value } : service));
}

function roundMoney(value: number) {
	return Math.round(value * 100) / 100;
}

function formatDateTime(value?: string | null) {
	if (!value) return "Not available";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Not available" : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}