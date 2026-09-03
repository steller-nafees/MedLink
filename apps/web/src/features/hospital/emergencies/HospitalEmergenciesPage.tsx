import { useCallback, useEffect, useState } from "react";
import { Activity, BedDouble, Check, Filter, HeartPulse, RefreshCw, Siren, Sparkles, TriangleAlert, X } from "lucide-react";
import { approveEmergencyCase, assignBedToEvent, completeEmergencyCase, getActiveCases, getHospitalBedsFromApi, redirectEmergencyCase, severityStyle, type HospitalActiveCase, type HospitalBed } from "@/services/hospital.service";
import type { EmergencyCase, Severity } from "@/types/hospital";

export function HospitalEmergenciesPage() {
	const [cases, setCases] = useState<EmergencyCase[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [severity, setSeverity] = useState<Severity | "all">("all");
	const [caseStates, setCaseStates] = useState<Record<string, EmergencyCase["status"]>>({});
	const [assignedBeds, setAssignedBeds] = useState<Record<string, string>>({});
	const [assignedICUs, setAssignedICUs] = useState<Record<string, string>>({});
	const [beds, setBeds] = useState<HospitalBed[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [bedModalOpen, setBedModalOpen] = useState(false);
	const [icuModalOpen, setICUModalOpen] = useState(false);

	const loadCases = useCallback(() => {
		setError(null);
		setIsLoading(true);
		getActiveCases()
			.then((activeCases) => {
				const mapped = activeCases.map(mapCase);
				setCases(mapped);
				setSelectedId(mapped[0]?.id ?? null);
				const initialBeds: Record<string, string> = {};
				const initialICUs: Record<string, string> = {};
				activeCases.forEach((activeCase) => {
					const isIcu = activeCase.reservation_mode?.toUpperCase() === "ICU" || activeCase.ward_name?.toUpperCase().includes("ICU");
					if (activeCase.bed_number != null) {
						(isIcu ? initialICUs : initialBeds)[activeCase.event_id] = String(activeCase.bed_number);
					}
				});
				setAssignedBeds(initialBeds);
				setAssignedICUs(initialICUs);
			})
			.catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load emergency cases"))
			.finally(() => setIsLoading(false));
	}, []);

	useEffect(() => { loadCases(); }, [loadCases]);

	useEffect(() => { getHospitalBedsFromApi().then(setBeds).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load beds")); }, []);

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
		if (isUpdating || !selected) return;
		setError(null);
		setIsUpdating(true);
		try {
			if (status === "accepted") await approveEmergencyCase(selected.id);
			if (status === "completed") await completeEmergencyCase(selected.id);
			if (status === "pending") await redirectEmergencyCase(selected.id);
			if (status === "pending") {
				setCases((current) => current.filter((emergencyCase) => emergencyCase.id !== selected.id));
				setSelectedId(null);
				setBedModalOpen(false);
				setICUModalOpen(false);
			}
			setCaseStates((current) => ({ ...current, [selected.id]: status }));
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to update this emergency case");
		} finally {
			setIsUpdating(false);
		}
	};

	if (error) return <div className="hospital-emergencies"><ErrorState message={error} onRetry={loadCases} /></div>;
	if (isLoading) return <div className="hospital-emergencies"><LoadingState /></div>;
	if (cases.length === 0) return <div className="hospital-emergencies"><EmptyState /></div>;
	if (!selected) return null;

	return (
		<div className="hospital-emergencies">
			<div className="hospital-emergency-queue">
				<div className="hospital-emergency-heading">
					<div><h1>Emergency queue</h1><p>{cases.filter(c => c.status === "pending").length} pending cases · AI-triaged</p></div>
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
								<div className="hospital-emergency-copy"><div className="emergency-name"><strong>{emergencyCase.patient}</strong><span className={`severity-pill ${style.bg} ${style.text}`}>{emergencyCase.severity}</span><span className="hospital-case-id">#{emergencyCase.id}</span></div><p className="hospital-muted emergency-summary">{emergencyCase.summary}</p><div className="hospital-case-chips"><span>ETA {emergencyCase.eta}</span><span>{emergencyCase.ambulance}</span><span className="hospital-chip-primary">{status.replace("_", " ")}</span><span>{emergencyCase.createdAt}</span></div></div>
						</button>;
					})}
				</div>
			</div>

			<aside className="hospital-emergency-detail">
				<div className="hospital-detail-header"><div><p className="hospital-eyebrow">Case detail</p><h2>{selected.patient}</h2><p>#{selected.id} · reported {selected.createdAt}</p></div><span className="hospital-live">{caseStates[selected.id] ?? selected.status}</span></div>
				<div className="hospital-ai-summary"><div><Sparkles className="hospital-icon" /> <strong>AI summary</strong></div><p>{selected.summary}</p><div className="hospital-symptoms">{selected.symptoms.map((symptom) => <span key={symptom}>{symptom}</span>)}</div><p><strong>Patient contact:</strong> {selected.patientPhone ?? "Phone unavailable"}</p></div>
				<div className="hospital-mini-stats"><MiniStat label="ETA" value={selected.eta} icon={Activity} /><BedCard currentBed={assignedBeds[selected.id] ?? "Unassigned"} onOpenModal={() => setBedModalOpen(true)} /><ICUCard currentICU={assignedICUs[selected.id] ?? "Unassigned"} onOpenModal={() => setICUModalOpen(true)} /></div>
				<div className="hospital-detail-actions"><button type="button" className="accept-button" disabled={isUpdating} onClick={() => void updateStatus("accepted")}><Check className="hospital-icon" /> {isUpdating ? "Accepting..." : "Accept case"}</button><button type="button" className="hospital-redirect" disabled={isUpdating} onClick={() => void updateStatus("pending")}><X className="hospital-icon" /> Redirect</button></div>
				<div className="hospital-detail-actions"><button type="button" className="hospital-outline-emergency" onClick={() => updateStatus("completed")}>Complete case</button></div>
				<div className="hospital-prepare"><p className="hospital-eyebrow">Prepare</p><ul><li><Check className="hospital-icon" /> Cardiology team paged</li><li><Check className="hospital-icon" /> Cath lab on standby</li><li><Check className="hospital-icon" /> Blood O- confirmed available</li></ul></div>
			</aside>

			{bedModalOpen && <BedSelectionModal beds={beds} currentBed={assignedBeds[selected.id] ?? ""} onSelectBed={async (bed) => { try { const bedNumber = bed.split("#")[1]?.trim() || bed; await assignBedToEvent(selected.id, bedNumber); setAssignedBeds(prev => ({ ...prev, [selected.id]: bed })); setBedModalOpen(false); } catch (err) { setError(err instanceof Error ? err.message : "Failed to assign bed"); } }} onClose={() => setBedModalOpen(false)} />}
			{icuModalOpen && <ICUSelectionModal beds={beds} currentICU={assignedICUs[selected.id] ?? ""} onSelectICU={async (icu) => { try { const icuNumber = icu.split("#")[1]?.trim() || icu; await assignBedToEvent(selected.id, icuNumber); setAssignedICUs(prev => ({ ...prev, [selected.id]: icu })); setICUModalOpen(false); } catch (err) { setError(err instanceof Error ? err.message : "Failed to assign ICU"); } }} onClose={() => setICUModalOpen(false)} />}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Empty state — shown once loading has finished and no active cases   */
/* exist. Calm and clinical: the queue is empty because nothing is     */
/* wrong, not because something broke.                                 */
/* ------------------------------------------------------------------ */

function EmptyState() {
	return (
		<div className="ee-wrap">
			<style>{`
				.ee-wrap {
					grid-column: 1 / -1;
					width: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					text-align: center;
					min-height: 560px;
					padding: 48px 24px;
					font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
				}
				.ee-medallion {
					position: relative;
					width: 84px;
					height: 84px;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 28px;
				}
				.ee-ring {
					position: absolute;
					inset: 0;
					border-radius: 999px;
					border: 1px solid rgba(52, 199, 89, 0.35);
					animation: ee-breathe 3.2s ease-in-out infinite;
				}
				.ee-ring.ee-ring-delay {
					animation-delay: 0.9s;
				}
				.ee-core {
					width: 64px;
					height: 64px;
					border-radius: 999px;
					background: linear-gradient(180deg, #EFFBF3 0%, #E3F7EA 100%);
					border: 1px solid rgba(52, 199, 89, 0.25);
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 1px 2px rgba(16, 24, 32, 0.04);
				}
				.ee-core svg {
					width: 26px;
					height: 26px;
					color: #1F8A4C;
					stroke-width: 2;
				}
				.ee-title {
					font-size: 20px;
					line-height: 1.3;
					font-weight: 600;
					letter-spacing: -0.01em;
					color: #1D1D1F;
					margin: 0 0 8px;
				}
				.ee-body {
					font-size: 15px;
					line-height: 1.5;
					color: #6E6E73;
					max-width: 320px;
					margin: 0;
				}
				.ee-status {
					display: inline-flex;
					align-items: center;
					gap: 7px;
					margin-top: 32px;
					padding: 7px 14px;
					border-radius: 999px;
					background: #F5F5F7;
					border: 1px solid #E5E5EA;
				}
				.ee-status-dot {
					width: 7px;
					height: 7px;
					border-radius: 999px;
					background: #34C759;
					animation: ee-blink 2s ease-in-out infinite;
				}
				.ee-status-text {
					font-size: 12.5px;
					font-weight: 500;
					color: #6E6E73;
				}
				@keyframes ee-breathe {
					0% { transform: scale(0.9); opacity: 0.6; }
					60% { transform: scale(1.35); opacity: 0; }
					100% { transform: scale(1.35); opacity: 0; }
				}
				@keyframes ee-blink {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.35; }
				}
				@media (prefers-reduced-motion: reduce) {
					.ee-ring { animation: none; opacity: 0; }
					.ee-status-dot { animation: none; }
				}
			`}</style>

			<div className="ee-medallion">
				<span className="ee-ring" />
				<span className="ee-ring ee-ring-delay" />
				<div className="ee-core">
					<HeartPulse />
				</div>
			</div>

			<h2 className="ee-title">No active emergencies</h2>
			<p className="ee-body">Incoming cases will appear here the moment they're triaged.</p>

			<div className="ee-status">
				<span className="ee-status-dot" />
				<span className="ee-status-text">Watching dispatch feed</span>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Loading state — mirrors the final two-column layout so nothing      */
/* shifts once data arrives.                                           */
/* ------------------------------------------------------------------ */

function LoadingState() {
	return (
		<div className="ls-wrap">
			<style>{`
				.ls-wrap {
					display: grid;
					grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
					gap: 24px;
					font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
				}
				.ls-block {
					border-radius: 14px;
					background: linear-gradient(90deg, #F0F0F2 25%, #F8F8FA 37%, #F0F0F2 63%);
					background-size: 400% 100%;
					animation: ls-shimmer 1.6s ease-in-out infinite;
				}
				.ls-card {
					display: flex;
					gap: 14px;
					align-items: center;
					padding: 16px;
					border-radius: 14px;
					border: 1px solid #EDEDEF;
					margin-bottom: 12px;
				}
				.ls-avatar { width: 40px; height: 40px; border-radius: 999px; flex-shrink: 0; }
				.ls-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
				.ls-line { height: 10px; border-radius: 6px; }
				.ls-panel { border: 1px solid #EDEDEF; border-radius: 16px; padding: 20px; }
				@keyframes ls-shimmer {
					0% { background-position: 100% 0; }
					100% { background-position: 0 0; }
				}
				@media (prefers-reduced-motion: reduce) {
					.ls-block { animation: none; background: #F0F0F2; }
				}
			`}</style>

			<div>
				<div className="ls-block ls-line" style={{ width: 180, height: 22, marginBottom: 24 }} />
				{[0, 1, 2, 3].map((i) => (
					<div className="ls-card" key={i}>
						<div className="ls-block ls-avatar" />
						<div className="ls-lines">
							<div className="ls-block ls-line" style={{ width: "55%" }} />
							<div className="ls-block ls-line" style={{ width: "85%" }} />
						</div>
					</div>
				))}
			</div>

			<div className="ls-panel">
				<div className="ls-block ls-line" style={{ width: "60%", height: 18, marginBottom: 16 }} />
				<div className="ls-block ls-line" style={{ width: "100%", height: 90, borderRadius: 12, marginBottom: 16 }} />
				<div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
					{[0, 1, 2].map((i) => <div className="ls-block ls-line" key={i} style={{ flex: 1, height: 64, borderRadius: 12 }} />)}
				</div>
				<div className="ls-block ls-line" style={{ width: "100%", height: 40, borderRadius: 10 }} />
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Error state                                                         */
/* ------------------------------------------------------------------ */

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<div className="es-wrap">
			<style>{`
				.es-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					text-align: center;
					min-height: 560px;
					padding: 48px 24px;
					font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
				}
				.es-icon {
					width: 64px;
					height: 64px;
					border-radius: 999px;
					background: #FDEEEE;
					border: 1px solid rgba(255, 59, 48, 0.2);
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 24px;
				}
				.es-icon svg { width: 26px; height: 26px; color: #E0342A; stroke-width: 2; }
				.es-title { font-size: 20px; font-weight: 600; letter-spacing: -0.01em; color: #1D1D1F; margin: 0 0 8px; }
				.es-body { font-size: 15px; line-height: 1.5; color: #6E6E73; max-width: 340px; margin: 0 0 24px; }
				.es-retry {
					display: inline-flex; align-items: center; gap: 8px;
					padding: 10px 18px; border-radius: 999px; border: none;
					background: #1D1D1F; color: #fff; font-size: 14px; font-weight: 500;
					cursor: pointer; transition: opacity 0.15s ease;
				}
				.es-retry:hover { opacity: 0.85; }
				.es-retry svg { width: 15px; height: 15px; }
			`}</style>
			<div className="es-icon"><TriangleAlert /></div>
			<h2 className="es-title">Couldn't load the queue</h2>
			<p className="es-body">{message}</p>
			<button type="button" className="es-retry" onClick={onRetry}><RefreshCw /> Try again</button>
		</div>
	);
}

function mapCase(activeCase: HospitalActiveCase): EmergencyCase {
	const severity = ["critical", "high", "moderate", "low"].includes(activeCase.severity.toLowerCase()) ? activeCase.severity.toLowerCase() as Severity : "moderate";
	const patient = [activeCase.first_name, activeCase.last_name].filter(Boolean).join(" ") || "Unnamed patient";
	const requestDate = activeCase.request_created_at ?? activeCase.created_at;
	return { id: activeCase.event_id, patient, patientPhone: activeCase.phone ?? undefined, age: 0, severity, summary: activeCase.user_description || "Active medical event", symptoms: [], eta: "—", hospital: "Assigned hospital", ambulance: "—", status: activeCase.event_status.toLowerCase().replace("_", "_") as EmergencyCase["status"], createdAt: new Date(requestDate).toLocaleString() };
}

function BedCard({ currentBed, onOpenModal }: { currentBed: string; onOpenModal: () => void }) {
	return (
		<button type="button" className="hospital-mini-stat" onClick={onOpenModal} style={{ cursor: "pointer", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
			<div className="hospital-mini-icon primary">
				<BedDouble className="hospital-icon" />
			</div>
			<strong style={{ fontSize: "14px" }}>{currentBed}</strong>
			<span>Bed</span>
		</button>
	);
}

function BedSelectionModal({ beds, currentBed, onSelectBed, onClose }: { beds: HospitalBed[]; currentBed: string; onSelectBed: (bed: string) => void; onClose: () => void }) {
	const availableBeds = beds.filter((bed) => (bed.bed_status === "AVAILABLE" || bed.bed_status === "RESERVED") && !bed.ward_name.toUpperCase().includes("ICU"));
	const bedsByWard = Array.from(new Set(availableBeds.map((bed) => bed.ward_name))).map((wardName) => ({
		ward: wardName,
		beds: availableBeds.filter((bed) => bed.ward_name === wardName),
	}));

	return (
		<div className="bed-modal-overlay" onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
			<div className="bed-modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", width: "90%" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Select Bed</h2>
					<button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
				</div>

				{bedsByWard.map((wardGroup) => (
					<div key={wardGroup.ward} style={{ marginBottom: "24px" }}>
						<h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#666" }}>{wardGroup.ward}</h3>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
							{wardGroup.beds.map((bed) => (
								<button
									key={bed.bed_id}
									type="button"
									onClick={() => onSelectBed(`${wardGroup.ward} #${bed.bed_number}`)}
									style={{
										padding: "16px 8px",
										border: `2px solid ${bed.bed_status === "OCCUPIED" ? "#e74c3c" : currentBed.includes(String(bed.bed_number)) ? "#3498db" : "#e0e0e0"}`,
										borderRadius: "8px",
										backgroundColor: bed.bed_status === "OCCUPIED" ? "#ffe0e0" : currentBed.includes(String(bed.bed_number)) ? "#e3f2fd" : "#f9f9f9",
										cursor: bed.bed_status === "OCCUPIED" ? "not-allowed" : "pointer",
										opacity: bed.bed_status === "OCCUPIED" ? 0.6 : 1,
										fontWeight: "500",
										fontSize: "13px",
										textAlign: "center",
									}}
									disabled={bed.bed_status === "OCCUPIED"}
								>
									#{bed.bed_number}
									<div style={{ fontSize: "11px", marginTop: "4px", color: "#666" }}>{bed.bed_status === "OCCUPIED" ? "Occupied" : "Available"}</div>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ICUCard({ currentICU, onOpenModal }: { currentICU: string; onOpenModal: () => void }) {
	return (
		<button type="button" className="hospital-mini-stat" onClick={onOpenModal} style={{ cursor: "pointer", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
			<div className="hospital-mini-icon emergency">
				<Activity className="hospital-icon" />
			</div>
			<strong style={{ fontSize: "14px" }}>{currentICU}</strong>
			<span>ICU</span>
		</button>
	);
}

function ICUSelectionModal({ beds, currentICU, onSelectICU, onClose }: { beds: HospitalBed[]; currentICU: string; onSelectICU: (icu: string) => void; onClose: () => void }) {
	const availableICUs = beds.filter((bed) => (bed.bed_status === "AVAILABLE" || bed.bed_status === "RESERVED") && bed.ward_name.toUpperCase().includes("ICU"));
	const icusByWard = Array.from(new Set(availableICUs.map((bed) => bed.ward_name))).map((wardName) => ({
		ward: wardName,
		beds: availableICUs.filter((bed) => bed.ward_name === wardName),
	}));

	return (
		<div className="icu-modal-overlay" onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
			<div className="icu-modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", width: "90%" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Select ICU</h2>
					<button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
				</div>

				{icusByWard.length === 0 ? (
					<p style={{ textAlign: "center", color: "#666", padding: "20px" }}>No available ICU beds at the moment</p>
				) : (
					icusByWard.map((wardGroup) => (
						<div key={wardGroup.ward} style={{ marginBottom: "24px" }}>
							<h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#666" }}>{wardGroup.ward}</h3>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
								{wardGroup.beds.map((bed) => (
									<button
										key={bed.bed_id}
										type="button"
										onClick={() => onSelectICU(`${wardGroup.ward} #${bed.bed_number}`)}
										style={{
											padding: "16px 8px",
											border: `2px solid ${bed.bed_status === "OCCUPIED" ? "#e74c3c" : currentICU.includes(String(bed.bed_number)) ? "#e74c3c" : "#e0e0e0"}`,
											borderRadius: "8px",
											backgroundColor: bed.bed_status === "OCCUPIED" ? "#ffe0e0" : currentICU.includes(String(bed.bed_number)) ? "#ffe0e0" : "#f9f9f9",
											cursor: bed.bed_status === "OCCUPIED" ? "not-allowed" : "pointer",
											opacity: bed.bed_status === "OCCUPIED" ? 0.6 : 1,
											fontWeight: "500",
											fontSize: "13px",
											textAlign: "center",
										}}
										disabled={bed.bed_status === "OCCUPIED"}
									>
										#{bed.bed_number}
										<div style={{ fontSize: "11px", marginTop: "4px", color: "#666" }}>{bed.bed_status === "OCCUPIED" ? "Occupied" : "Available"}</div>
									</button>
								))}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function MiniStat({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof Activity; tone?: "default" | "primary" | "emergency" }) {
	return <div className="hospital-mini-stat"><div className={`hospital-mini-icon ${tone}`}><Icon className="hospital-icon" /></div><strong>{value}</strong><span>{label}</span></div>;
}