import { useState } from "react";
import { getHospitalReservations } from "@/services/hospital.service";
import type { ReservationStatus } from "@/types/hospital";
import { Action, PageHead, Panel, RequestRow } from "@/shared/components/ui/ReservationPrimitives";

export function HospitalReservationsPage() {
	const [overrides, setOverrides] = useState<Record<string, ReservationStatus>>({});
	const [occupied, setOccupied] = useState<string[]>([]);
	const all = getHospitalReservations().map((request) => ({ ...request, status: overrides[request.id] ?? request.status }));
 const groups = [{ title: "Bed reservations", list: all.filter((request) => request.kind === "bed") }, { title: "ICU reservations", list: all.filter((request) => request.kind === "icu") }];
 const setStatus = (id: string, status: ReservationStatus) => setOverrides((current) => ({ ...current, [id]: status }));

 return <main className="hospital-reservations"><PageHead title="Reservations" subtitle="Bed and ICU requests from MedLink patients" />{groups.map((group) => <Panel key={group.title} title={group.title} subtitle={`${group.list.length} total`}>{group.list.map((request) => <RequestRow key={request.id} request={request} actions={<>{request.status === "pending" && <><Action tone="primary" onClick={() => setStatus(request.id, "confirmed")}>Approve</Action><Action tone="danger" onClick={() => setStatus(request.id, "cancelled")}>Reject</Action></>}{(request.status === "accepted" || request.status === "confirmed") && (occupied.includes(request.id) ? <Action onClick={() => setStatus(request.id, "completed")}>Mark released</Action> : <Action tone="primary" onClick={() => setOccupied((current) => [...current, request.id])}>Mark occupied</Action>)}{request.status === "completed" && <span className="reservation-released">Released</span>}</>} />)}{!group.list.length && <p className="reservation-empty">No reservations.</p>}</Panel>)}</main>;
}