import { useEffect, useState } from "react";
import { Activity, BedDouble, Check, Filter, PhoneCall, Siren, Sparkles, X } from "lucide-react";
import { approveEmergencyCase, getActiveCases, severityStyle, type HospitalActiveCase } from "@/services/hospital.service";
import type { EmergencyCase, Severity } from "@/types/hospital";

export function HospitalEmergenciesPage() {
	const [cases, setCases] = useState<EmergencyCase[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [severity, setSeverity] = useState<Severity | "all">("all");
	const [caseStates, setCaseStates] = useState<Record<string, EmergencyCase["status"]>>({});
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => { getActiveCases().then((activeCases) => { const mapped = activeCases.map(mapCase); setCases(mapped); setSelectedId(mapped[0]?.id ?? null); }).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load emergency cases")); }, []);

	useEffect(() => {
		document.title = "Emergencies · Hospital Dashboard";
		let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
		if (!description) {
			description = document.createElement("meta");
			description.name = "description";
			document.head.append(description);
		}
		description.content = "Live emergency case queue.";
	}, []);

	const selected = cases.find((emergencyCase) => emergencyCase.id === selectedId) ?? cases[0];
	const visibleCases = severity === "all" ? cases : cases.filter((emergencyCase) => emergencyCase.severity === severity);
	const updateStatus = async (status: EmergencyCase["status"]) => {
		if (isUpdating) return;
		setError(null);
		setIsUpdating(true);
		try {
			if (status === "accepted") await approveEmergencyCase(selected.id);
			setCaseStates((current) => ({ ...current, [selected.id]: status }));
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to update this emergency case");
		} finally {
			setIsUpdating(false);
		}
	};
	if (error) return <div className="hospital-emergencies"><p role="alert">{error}</p></div>;
	if (!selected) return <div className="hospital-emergencies"><p>Loading emergency cases...</p></div>;

	return (
		<div className="hospital-emergencies">
			<div className="hospital-emergency-queue">
				<div className="hospital-emergency-heading">
					<div><h1>Emergency queue</h1><p>{cases.length} active cases · AI-triaged</p></div>
					<div className="hospital-emergency-filters">
						<label className="hospital-filter"><Filter className="hospital-icon" /><select aria-label="Filter by severity" value={severity} onChange={(event) => setSeverity(event.target.value as Severity | "all")}><option value="all">Severity</option><option value="critical">Critical</option><option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option></select></label>
						<button type="button" className="hospital-filter">Today</button>
					</div>
				</div>
				<div className="hospital-emergency-cases">
					{visibleCases.map((emergencyCase) => {
						const style = severityStyle(emergencyCase.severity);
						const active = selected.id === emergencyCase.id;
						const status = caseStates[emergencyCase.id] ?? emergencyCase.status;
						return <button type="button" key={emergencyCase.id} className={`hospital-emergency-card${active ? " active" : ""}`} onClick={() => setSelectedId(emergencyCase.id)}>
							<div className={`emergency-symbol ${style.bg}`}><Siren className="hospital-icon" /></div>
							<div className="hospital-emergency-copy"><div className="emergency-name"><strong>{emergencyCase.patient}, {emergencyCase.age}</strong><span className={`severity-pill ${style.bg} ${style.text}`}>{emergencyCase.severity}</span><span className="hospital-case-id">#{emergencyCase.id}</span></div><p className="hospital-muted emergency-summary">{emergencyCase.summary}</p><div className="hospital-case-chips"><span>ETA {emergencyCase.eta}</span><span>{emergencyCase.ambulance}</span><span className="hospital-chip-primary">{status.replace("_", " ")}</span><span>{emergencyCase.createdAt}</span></div></div>
						</button>;
					})}
				</div>
			</div>

			<aside className="hospital-emergency-detail">
				<div className="hospital-detail-header"><div><p className="hospital-eyebrow">Case detail</p><h2>{selected.patient}, {selected.age}</h2><p>#{selected.id} · reported {selected.createdAt}</p></div><span className="hospital-live">{caseStates[selected.id] ?? selected.status}</span></div>
				<div className="hospital-ai-summary"><div><Sparkles className="hospital-icon" /> <strong>AI summary</strong></div><p>{selected.summary}</p><div className="hospital-symptoms">{selected.symptoms.map((symptom) => <span key={symptom}>{symptom}</span>)}</div><p><strong>Patient contact:</strong> {selected.patientPhone ?? "Phone unavailable"}</p></div>
				<div className="hospital-mini-stats"><MiniStat label="ETA" value={selected.eta} icon={Activity} /><MiniStat label="Bed" value="Bay 3" icon={BedDouble} tone="primary" /><MiniStat label="ICU" value={selected.severity === "critical" ? "ICU-4" : "—"} icon={Activity} tone="emergency" /></div>
				{error && <p role="alert" className="request-empty">{error}</p>}
				<div className="hospital-detail-actions"><button type="button" className="accept-button" disabled={isUpdating} onClick={() => void updateStatus("accepted")}><Check className="hospital-icon" /> {isUpdating ? "Accepting..." : "Accept case"}</button><button type="button" className="hospital-redirect" disabled={isUpdating} onClick={() => void updateStatus("pending")}><X className="hospital-icon" /> Redirect</button></div>
				<div className="hospital-detail-actions"><button type="button" className="hospital-outline-primary" onClick={() => updateStatus("dispatched")}>Assign ambulance</button><button type="button" className="hospital-outline-emergency" onClick={() => updateStatus("completed")}>Complete case</button></div>
				<div className="hospital-dispatch"><p className="hospital-eyebrow">Dispatch</p><div><strong>{selected.ambulance}</strong><span> · Dr. Priya Rao</span></div><button type="button" onClick={() => window.location.href = `tel:${selected.ambulance}`}><PhoneCall className="hospital-icon" /> Contact driver</button></div>
				<div className="hospital-prepare"><p className="hospital-eyebrow">Prepare</p><ul><li><Check className="hospital-icon" /> Cardiology team paged</li><li><Check className="hospital-icon" /> Cath lab on standby</li><li><Check className="hospital-icon" /> Blood O- confirmed available</li></ul></div>
			</aside>
		</div>
	);
}

function mapCase(activeCase: HospitalActiveCase): EmergencyCase {
	const severity = ["critical", "high", "moderate", "low"].includes(activeCase.severity.toLowerCase()) ? activeCase.severity.toLowerCase() as Severity : "moderate";
	const patient = [activeCase.first_name, activeCase.last_name].filter(Boolean).join(" ") || "Unnamed patient";
	return { id: activeCase.event_id, patient, patientPhone: activeCase.phone ?? undefined, age: 0, severity, summary: activeCase.user_description || "Active medical event", symptoms: [], eta: "—", hospital: "Assigned hospital", ambulance: "—", status: activeCase.event_status.toLowerCase().replace("_", "_") as EmergencyCase["status"], createdAt: new Date(activeCase.created_at).toLocaleString() };
}

function MiniStat({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof Activity; tone?: "default" | "primary" | "emergency" }) {
	return <div className="hospital-mini-stat"><div className={`hospital-mini-icon ${tone}`}><Icon className="hospital-icon" /></div><strong>{value}</strong><span>{label}</span></div>;
}
