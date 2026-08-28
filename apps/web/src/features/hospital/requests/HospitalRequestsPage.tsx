import { useState } from "react";
import type { HospitalRequestStatus, HospitalServiceRequest } from "@/types/hospital";
import { getHospitalRequests } from "@/services/hospital.service";
import { PageHead } from "@/shared/components/ui/ReservationPrimitives";
import { RequestAction, RequestPanel, RequestRow } from "@/shared/components/ui/RequestPrimitives";
import { RequestDetailsModal } from "./components/RequestDetailsModal";

const tabs = ["All", "Consultations", "Diagnostics", "Beds & ICU", "Emergency"] as const;

export function HospitalRequestsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [overrides, setOverrides] = useState<Record<string, HospitalRequestStatus>>({});
  const [activeRequest, setActiveRequest] = useState<HospitalServiceRequest | null>(null);
  const requests = getHospitalRequests().map((request) => ({ ...request, status: overrides[request.id] ?? request.status })).filter((request) => tab === "All" || tab === "Consultations" && request.kind === "consultation" || tab === "Diagnostics" && request.kind === "diagnostic" || tab === "Beds & ICU" && (request.kind === "bed" || request.kind === "icu") || tab === "Emergency" && request.kind === "emergency");
  const setStatus = (id: string, status: HospitalRequestStatus) => setOverrides((current) => ({ ...current, [id]: status }));

  return <main className="hospital-requests"><PageHead title="Incoming requests" subtitle="Consultations, diagnostics, reservations and emergency SOS in one inbox" /><div className="request-tabs">{tabs.map((currentTab) => <button key={currentTab} type="button" className={currentTab === tab ? "active" : ""} onClick={() => setTab(currentTab)}>{currentTab}</button>)}</div><RequestPanel title="Requests" subtitle={`${requests.length} shown`}>{requests.map((request) => <RequestRow key={request.id} request={request} actions={<>{request.status === "pending" && <><RequestAction tone="primary" onClick={() => setStatus(request.id, "accepted")}>Accept</RequestAction><RequestAction tone="danger" onClick={() => setStatus(request.id, "cancelled")}>Reject</RequestAction></>}{["accepted", "confirmed", "scheduled"].includes(request.status) && <RequestAction tone="primary" onClick={() => setStatus(request.id, "completed")}>Mark completed</RequestAction>}<RequestAction onClick={() => setActiveRequest(request)}>View</RequestAction></>} />)}{requests.length === 0 && <p className="request-empty">No requests in this category.</p>}</RequestPanel>{activeRequest && <RequestDetailsModal request={activeRequest} onClose={() => setActiveRequest(null)} />}</main>;
}