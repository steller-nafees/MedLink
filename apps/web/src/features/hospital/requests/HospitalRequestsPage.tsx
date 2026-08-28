import { useCallback, useEffect, useMemo, useState } from "react";
import type { HospitalServiceRequest } from "@/types/hospital";
import { approveReservation, getHospitalIncomingRequests } from "@/services/hospital.service";
import { PageHead } from "@/shared/components/ui/ReservationPrimitives";
import { RequestAction, RequestPanel, RequestRow } from "@/shared/components/ui/RequestPrimitives";
import { RequestDetailsModal } from "./components/RequestDetailsModal";

const tabs = ["All", "Consultations", "Diagnostics", "Beds & ICU", "Emergency"] as const;

export function HospitalRequestsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [requests, setRequests] = useState<HospitalServiceRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<HospitalServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleRequests = useMemo(() => requests.filter((request) => tab === "All" || tab === "Consultations" && request.kind === "consultation" || tab === "Diagnostics" && request.kind === "diagnostic" || tab === "Beds & ICU" && (request.kind === "bed" || request.kind === "icu") || tab === "Emergency" && request.kind === "emergency"), [requests, tab]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRequests(await getHospitalIncomingRequests());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load incoming requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function approveRequest(request: HospitalServiceRequest) {
    setIsApproving(request.id);
    setError(null);
    try {
      await approveReservation(request.id);
      setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: "confirmed" } : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to approve request");
    } finally {
      setIsApproving(null);
    }
  }

  return <main className="hospital-requests"><PageHead title="Incoming requests" subtitle="Live reservations and emergency cases from the hospital API" /><div className="request-tabs">{tabs.map((currentTab) => <button key={currentTab} type="button" className={currentTab === tab ? "active" : ""} onClick={() => setTab(currentTab)}>{currentTab}</button>)}</div>{error && <p role="alert" className="request-empty">{error}</p>}<RequestPanel title="Requests" subtitle={isLoading ? "Loading..." : `${visibleRequests.length} shown`}>{isLoading ? <p className="request-empty">Loading requests...</p> : visibleRequests.map((request) => <RequestRow key={`${request.kind}-${request.id}`} request={request} actions={<>{request.status === "pending" && (request.kind === "bed" || request.kind === "icu") && <RequestAction tone="primary" onClick={() => void approveRequest(request)}>{isApproving === request.id ? "Approving..." : "Approve"}</RequestAction>}<RequestAction onClick={() => setActiveRequest(request)}>View</RequestAction></>} />)}{!isLoading && visibleRequests.length === 0 && <p className="request-empty">No API-backed requests in this category.</p>}</RequestPanel>{activeRequest && <RequestDetailsModal request={activeRequest} onClose={() => setActiveRequest(null)} />}</main>;
}
