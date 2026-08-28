import {
	Activity,
	ArrowUpRight,
	BedDouble,
	Clock,
	Siren,
	Sparkles,
	Truck,
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
import { getActiveCases, getHospitalDashboard, type HospitalActiveCase, type HospitalDashboard } from "@/services/hospital.service";

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

const dashboard = {
	hospital: { beds: { total: 300, available: 84 }, icu: { total: 40, available: 8 } },
	avgResponse: 6.4,
	weekly: [
		{ day: "Mon", cases: 142 }, { day: "Tue", cases: 168 }, { day: "Wed", cases: 155 },
		{ day: "Thu", cases: 189 }, { day: "Fri", cases: 221 }, { day: "Sat", cases: 240 }, { day: "Sun", cases: 169 },
	],
	bySeverity: [
		{ name: "Critical", value: 18, color: "var(--hospital-emergency)" }, { name: "High", value: 32, color: "var(--hospital-warning)" },
		{ name: "Moderate", value: 30, color: "var(--hospital-info)" }, { name: "Low", value: 20, color: "var(--hospital-primary)" },
	],
	emergencies: [
		{ id: "e-9021", patient: "Eleanor Chen", age: 74, severity: "critical", summary: "Suspected acute myocardial infarction. Chest pain 25 min, radiating to left arm, diaphoretic. Aspirin 325mg given.", eta: "6 min", ambulance: "Unit 12" },
		{ id: "e-9020", patient: "Marcus Reid", age: 42, severity: "high", summary: "Motor vehicle collision. Conscious, complaining of pelvic pain. C-spine immobilized.", eta: "12 min", ambulance: "Unit 07" },
		{ id: "e-9019", patient: "Amelia Osei", age: 31, severity: "moderate", summary: "Severe asthma exacerbation. SpO2 91%. Nebulizer in progress.", eta: "9 min", ambulance: "Unit 21" },
	] satisfies Emergency[],
};

const severityStyle: Record<Severity, { bg: string; text: string }> = {
	critical: { bg: "severity-critical", text: "severity-critical-text" },
	high: { bg: "severity-high", text: "severity-high-text" },
	moderate: { bg: "severity-moderate", text: "severity-moderate-text" },
	low: { bg: "severity-low", text: "severity-low-text" },
};

function Kpi({ label, value, delta, icon: IconComponent, tone = "default" }: { label: string; value: string; delta: string; icon: Icon; tone?: "default" | "emergency" | "success" | "warning" }) {
	return <div className="hospital-kpi"><div className="hospital-kpi-top"><div className={`hospital-kpi-icon is-${tone}`}><IconComponent className="hospital-icon" /></div><span className="hospital-kpi-delta">{delta}</span></div><p className="hospital-kpi-value">{value}</p><p className="hospital-kpi-label">{label}</p></div>;
}

export function HospitalDashboardPage() {
	const [summary, setSummary] = useState<HospitalDashboard | null>(null);
	const [activeCases, setActiveCases] = useState<HospitalActiveCase[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([getHospitalDashboard(), getActiveCases()])
			.then(([dashboardSummary, cases]) => {
				setSummary(dashboardSummary);
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

	if (error) return <div className="hospital-dashboard"><p role="alert">{error}</p></div>;
	if (!summary) return <div className="hospital-dashboard"><p>Loading dashboard...</p></div>;

	return <div className="hospital-dashboard">
		<div className="hospital-dashboard-header"><div><p className="hospital-eyebrow">Wednesday, April 24</p><h1>Good morning, Dr. Amara</h1><p className="hospital-subline">4 active emergencies · 2 incoming in the next 15 minutes.</p></div><div className="hospital-actions"><button type="button" className="today-button">Today</button><Link to="/hospital/emergencies" className="emergency-button"><Siren className="hospital-icon" /> Emergency queue</Link></div></div>

		<div className="hospital-kpi-grid"><Kpi label="Active cases" value={String(summary.active_cases)} delta="Live" icon={Activity} tone="emergency" /><Kpi label="Pending reservations" value={String(summary.pending_reservations)} delta="Live" icon={Clock} tone="success" /><Kpi label="Beds occupied" value={`${summary.occupied_beds}/${bedsTotal}`} delta={`${bedsAvailable} available`} icon={BedDouble} /><Kpi label="ICU beds" value={String(icuTotal)} delta="Total capacity" icon={Activity} tone="warning" /></div>

		<div className="hospital-grid hospital-grid-top"><section className="hospital-panel hospital-wide-panel"><div className="hospital-panel-heading"><div><h2>Cases this week</h2><p className="hospital-muted">Incoming volume and average response time</p></div><span className="hospital-success"><TrendingUp className="hospital-icon" /> +12% vs last week</span></div><div className="hospital-line-chart"><RechartsResponsiveContainer width="100%" height="100%"><RechartsLineChart data={dashboard.weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><RechartsCartesianGrid stroke="#d7e4e5" strokeDasharray="3 6" vertical={false} /><RechartsXAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><RechartsYAxis tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} /><RechartsTooltip /><RechartsLine type="monotone" dataKey="cases" stroke="#16a89c" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} /></RechartsLineChart></RechartsResponsiveContainer></div></section><section className="hospital-panel"><h2>Severity mix</h2><p className="hospital-muted">Last 30 days</p><div className="hospital-donut-chart"><RechartsResponsiveContainer width="100%" height="100%"><RechartsPieChart><RechartsPie data={dashboard.bySeverity} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">{dashboard.bySeverity.map((item) => <RechartsCell key={item.name} fill={item.color} />)}</RechartsPie></RechartsPieChart></RechartsResponsiveContainer></div><ul className="severity-list">{dashboard.bySeverity.map((item) => <li key={item.name}><span className="severity-dot" style={{ background: item.color }} /><span>{item.name}</span><span className="hospital-muted">{item.value}%</span></li>)}</ul></section><section className="hospital-panel hospital-wide-panel hospital-queue"><div className="hospital-panel-heading"><div><h2>Incoming emergencies</h2><p className="hospital-muted">AI-triaged · live from patient app &amp; dispatch</p></div><Link to="/hospital/emergencies" className="hospital-view-link">View all <ArrowUpRight className="hospital-icon" /></Link></div><div className="emergency-list">{emergencies.map((emergency) => { const style = severityStyle[emergency.severity]; return <div className="emergency-row" key={emergency.id}><div className={`emergency-symbol ${style.bg}`}><Siren className="hospital-icon" /></div><div className="emergency-copy"><div className="emergency-name"><strong>{emergency.patient}</strong><span className={`severity-pill ${style.bg} ${style.text}`}>{emergency.severity}</span></div><p className="hospital-muted emergency-summary">{emergency.summary}</p></div><div className="emergency-eta"><strong>ETA {emergency.eta}</strong><span>{emergency.ambulance}</span></div><button type="button" className="accept-button">Accept</button></div>; })}</div></section><section className="hospital-insight"><div className="insight-heading"><Sparkles className="hospital-icon" /><strong>AI Insight</strong><span>Coming Soon</span></div><p className="insight-title">Live hospital capacity</p><p className="insight-copy">{summary.available_beds} beds are currently available across this hospital.</p><button type="button" className="prepare-button"><Truck className="hospital-icon" /> Prepare team</button></section></div>
	</div>;
}
