import { useState } from "react";
import { useEffect } from "react";
import { approveReservation, getHospitalReservationsFromApi } from "@/services/hospital.service";
import type { ReservationStatus } from "@/types/hospital";
import { Action, PageHead, Panel, RequestRow } from "@/shared/components/ui/ReservationPrimitives";

export function HospitalReservationsPage() {
	const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});
	const [occupied, setOccupied] = useState<string[]>([]);
	const [all, setAll] = useState<ReturnType<typeof mapReservation>[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => { getHospitalReservationsFromApi().then((records) => setAll(records.map(mapReservation))).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load reservations")); }, []);
	const visible = all.map((request) => ({ ...request, status: overrides[request.id] ?? request.status }));
 const groups = [{ title: "Bed reservations", list: visible.filter((request) => request.kind === "bed") }, { title: "ICU reservations", list: visible.filter((request) => request.kind === "icu") }];
 const setStatus = (id: string, status: ReservationStatus) => setOverrides((current) => ({ ...current, [id]: status }));
 const approve = (id: string) => approveReservation(id).then(() => setStatus(id, "confirmed")).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to approve reservation"));

 if (error) return <main className="hospital-reservations"><p role="alert">{error}</p></main>;
 if (!all.length) return <main className="hospital-reservations"><p>Loading reservations...</p></main>;

 return <main className="hospital-reservations"><PageHead title="Reservations" subtitle="Bed and ICU requests from MedLink patients" />{groups.map((group) => <Panel key={group.title} title={group.title} subtitle={`${group.list.length} total`}>{group.list.map((request) => <RequestRow key={request.id} request={request} actions={<>{request.status === "pending" && <><Action tone="primary" onClick={() => approve(request.id)}>Approve</Action><Action tone="danger" onClick={() => setStatus(request.id, "cancelled")}>Reject</Action></>}{(request.status === "accepted" || request.status === "confirmed") && (occupied.includes(request.id) ? <Action onClick={() => setStatus(request.id, "completed")}>Mark released</Action> : <Action tone="primary" onClick={() => setOccupied((current) => [...current, request.id])}>Mark occupied</Action>)}{request.status === "completed" && <span className="reservation-released">Released</span>}</>} />)}{!group.list.length && <p className="reservation-empty">No reservations.</p>}</Panel>)}</main>;
}

function mapReservation(record: Record<string, unknown>) {
	const mode = String(record.reservation_mode ?? "BED").toLowerCase();
	return { id: String(record.reservation_id), kind: mode.includes("icu") ? "icu" as const : "bed" as const, title: mode.includes("icu") ? "ICU Reservation" : "Bed Reservation", department: String(record.ward_name ?? "Hospital ward"), patient: `Patient ${String(record.user_id ?? "") .slice(0, 8)}`, date: String(record.requested_at ?? "").slice(0, 10), time: "", status: String(record.reservation_status ?? "PENDING").toLowerCase().replace("approved", "confirmed") as ReservationStatus, charge: 0, serviceFee: 0, payment: "pending" as const };
}