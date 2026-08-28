import {
	Activity,
	ArrowUpRight,
	BedDouble,
	Clock,
	Siren,
	TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
	PieChart as RechartsPieChart,
	Pie as RechartsPie,
	Cell as RechartsCell,
	LineChart as RechartsLineChart,
	Line as RechartsLine,
	ResponsiveContainer as RechartsResponsiveContainer,
	XAxis as RechartsXAxis,
	YAxis as RechartsYAxis,
	Tooltip as RechartsTooltip,
	CartesianGrid as RechartsCartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { getActiveCases, getHospitalDashboard, getHospitalDashboardAnalytics, type HospitalActiveCase, type HospitalDashboard, type HospitalDashboardAnalytics } from "@/services/hospital.service";

type Severity = "critical" | "high" | "moderate" | "low";
type Icon = typeof Activity;

type Emergency = {
	id: string;
	patient: string;
	age: number;
	severity: Severity;
	summary: string;
	eta: string;
	ambulance: string;
};

const severityStyle: Record<Severity, { bg: string; text: string }> = {
	critical: { bg: "severity-critical", text: "severity-critical-text" },
	high: { bg: "severity-high", text: "severity-high-text" },
	moderate: { bg: "severity-moderate", text: "severity-moderate-text" },
	low: { bg: "severity-low", text: "severity-low-text" },
};

const severityColors: Record<HospitalDashboardAnalytics["bySeverity"][number]["name"], string> = {
	Critical: "var(--hospital-emergency)",
	High: "var(--hospital-warning)",
	Moderate: "var(--hospital-info)",
	Low: "var(--hospital-primary)",
};

function Kpi({ label, value, delta, icon: IconComponent, tone = "default" }: { label: string; value: string; delta: string; icon: Icon; tone?: "default" | "emergency" | "success" | "warning" }) {
	return <div className="hospital-kpi"><div className="hospital-kpi-top"><div className={`hospital-kpi-icon is-${tone}`}><IconComponent className="hospital-icon" /></div><span className="hospital-kpi-delta">{delta}</span></div><p className="hospital-kpi-value">{value}</p><p className="hospital-kpi-label">{label}</p></div>;
}

export function HospitalDashboardPage() {
	const [summary, setSummary] = useState<HospitalDashboard | null>(null);
	const [analytics, setAnalytics] = useState<HospitalDashboardAnalytics | null>(null);
	const [activeCases, setActiveCases] = useState<HospitalActiveCase[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			getHospitalDashboard(),
			getHospitalDashboardAnalytics().catch(() => ({ weekly: [], bySeverity: [] })),
			getActiveCases(),
		])
			.then(([dashboardSummary, dashboardAnalytics, cases]) => {
				setSummary(dashboardSummary);
				setAnalytics(dashboardAnalytics);
				setActiveCases(cases);
			})
			.catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard"));
	}, []);

	const bedsTotal = summary?.total_beds ?? 0;
	const bedsAvailable = summary?.available_beds ?? 0;
	const icuTotal = summary?.total_icu_beds ?? 0;
	const emergencies = activeCases.slice(0, 3).map((activeCase) => ({
		id: activeCase.event_id,
		patient: activeCase.user_description || "Unnamed patient",
		age: 0,
		severity: activeCase.severity.toLowerCase() as Severity,
		summary: activeCase.user_description || "Active medical event",
		eta: "—",
		ambulance: "—",
	}));
	const weekly = analytics?.weekly ?? [];
	const bySeverity = (analytics?.bySeverity ?? []).map((item) => ({ ...item, color: severityColors[item.name] }));
	const totalWeeklyCases = weekly.reduce((total, item) => total + item.cases, 0);
	const totalSeverityPercent = bySeverity.reduce((total, item) => total + item.value, 0);
	const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
	const activeCount = activeCases.length;
	

	if (error) return <div className="hospital-dashboard"><p role="alert">{error}</p></div>;
	if (!summary || !analytics) return <div className="hospital-dashboard"><p>Loading dashboard...</p></div>;

	return <div className="hospital-dashboard">
		<div className="hospital-dashboard-header"><div><p className="hospital-eyebrow">{today}</p><h1>{summary.hospital_name}</h1><p className="hospital-subline">{activeCount} active {activeCount === 1 ? "emergency" : "emergencies"} · {summary.pending_reservations} pending reservations.</p></div><div className="hospital-actions"><button type="button" className="today-button">Today</button><Link to="/hospital/emergencies" className="emergency-button"><Siren className="hospital-icon" /> Emergency queue</Link></div></div>

		<div className="hospital-kpi-grid"><Kpi label="Active cases" value={String(summary.active_cases)} delta="Live" icon={Activity} tone="emergency" /><Kpi label="Pending reservations" value={String(summary.pending_reservations)} delta="Live" icon={Clock} tone="success" /><Kpi label="Beds occupied" value={`${summary.occupied_beds}/${bedsTotal}`} delta={`${bedsAvailable} available`} icon={BedDouble} /><Kpi label="ICU beds" value={String(icuTotal)} delta="Total capacity" icon={Activity} tone="warning" /></div>

		<div className="hospital-grid hospital-grid-top"><section className="hospital-panel hospital-wide-panel"><div className="hospital-panel-heading"><div><h2>Cases this week</h2><p className="hospital-muted">Incoming case volume from hospital records</p></div><span className="hospital-success"><TrendingUp className="hospital-icon" /> Live DB</span></div><div className="hospital-line-chart">{totalWeeklyCases > 0 ? <RechartsResponsiveContainer width="100%" height="100%"><RechartsLineChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><RechartsCartesianGrid stroke="#d7e4e5" strokeDasharray="3 6" vertical={false} /><RechartsXAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><RechartsYAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><RechartsTooltip /><RechartsLine type="monotone" dataKey="cases" stroke="#16a89c" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} /></RechartsLineChart></RechartsResponsiveContainer> : <ChartEmptyState title="No cases this week" text="New medical events will appear here as they are assigned to this hospital." />}</div></section><section className="hospital-panel"><h2>Severity mix</h2><p className="hospital-muted">Last 30 days</p><div className="hospital-donut-chart">{totalSeverityPercent > 0 ? <RechartsResponsiveContainer width="100%" height="100%"><RechartsPieChart><RechartsPie data={bySeverity} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">{bySeverity.map((item) => <RechartsCell key={item.name} fill={item.color} />)}</RechartsPie></RechartsPieChart></RechartsResponsiveContainer> : <ChartEmptyState title="No severity data" text="Severity percentages will update after cases are recorded." />}</div><ul className="severity-list">{bySeverity.map((item) => <li key={item.name}><span className="severity-dot" style={{ background: item.color }} /><span>{item.name}</span><span className="hospital-muted">{item.value}%</span></li>)}</ul></section><section className="hospital-panel hospital-wide-panel hospital-queue"><div className="hospital-panel-heading"><div><h2>Incoming emergencies</h2><p className="hospital-muted">AI-triaged · live from patient app &amp; dispatch</p></div><Link to="/hospital/emergencies" className="hospital-view-link">View all <ArrowUpRight className="hospital-icon" /></Link></div><div className="emergency-list">{emergencies.length > 0 ? emergencies.map((emergency) => { const style = severityStyle[emergency.severity]; return <div className="emergency-row" key={emergency.id}><div className={`emergency-symbol ${style.bg}`}><Siren className="hospital-icon" /></div><div className="emergency-copy"><div className="emergency-name"><strong>{emergency.patient}</strong><span className={`severity-pill ${style.bg} ${style.text}`}>{emergency.severity}</span></div><p className="hospital-muted emergency-summary">{emergency.summary}</p></div><div className="emergency-eta"><strong>ETA {emergency.eta}</strong><span>{emergency.ambulance}</span></div><button type="button" className="accept-button">Accept</button></div>; }) : <p className="hospital-dashboard-empty">No active emergency cases right now.</p>}</div></section></div>
	</div>;
}

function ChartEmptyState({ title, text }: { title: string; text: string }) {
	return <div className="hospital-chart-empty"><strong>{title}</strong><span>{text}</span></div>;
}
