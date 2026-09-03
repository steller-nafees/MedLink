import { useEffect, useState } from "react";
import { Building2, CreditCard, RefreshCw, Siren, Wallet } from "lucide-react";
import { PageHead, Panel } from "@/shared/components/ui/ReservationPrimitives";
import { platformService, SOS_SERVICE_FEE } from "@/services/platform.service";
import type { CompletedSosRevenue } from "@/types/platform";

export function AdminRevenuePage() {
	const [data, setData] = useState<CompletedSosRevenue | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const loadData = () => platformService.getCompletedSosRevenue().then(setData);

	useEffect(() => {
		loadData().catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load completed SOS events."));
	}, []);

	const refresh = async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			await loadData();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to load completed SOS events.");
		} finally {
			setIsRefreshing(false);
		}
	};

	const totalCompleted = data?.totalCompleted ?? 0;
	const totalRevenue = totalCompleted * SOS_SERVICE_FEE;
	const hospitals = data?.hospitalCounts ?? [];
	const linkedCases = hospitals.reduce((sum, hospital) => sum + hospital.cases, 0);
	const sortedHospitals = [...hospitals].sort((a, b) => b.cases - a.cases);

	const stats = [
		{ label: "Total revenue", value: `BDT ${totalRevenue.toFixed(2)}`, sub: `${totalCompleted.toLocaleString()} completed SOS`, icon: Wallet },
		{ label: "Service fee", value: `BDT ${SOS_SERVICE_FEE.toFixed(2)}`, sub: "Per completed event", icon: CreditCard },
		{ label: "Completed SOS", value: totalCompleted.toLocaleString(), sub: "Billable emergency events", icon: Siren },
	];

	return <main className="hospital-payments">
		<div className="payment-page-head"><PageHead title="Revenue" subtitle="Revenue calculated from completed emergency SOS events" /><button className="payment-primary-button" type="button" onClick={() => void refresh()} disabled={isRefreshing}><RefreshCw size={16} className={isRefreshing ? "payment-spin" : undefined} /> Refresh</button></div>
		{error ? <p className="payment-error" role="alert">{error}</p> : null}
		<div className="payment-stats">{stats.map((stat) => <div key={stat.label} className="payment-stat"><p><stat.icon size={14} /> {stat.label}</p><strong>{stat.value}</strong><span>{stat.sub}</span></div>)}</div>
		<Panel title="Revenue by hospital" subtitle="Hospital associations returned by completed event details">
			<div className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Hospital</th><th>Completed SOS</th><th>Revenue</th><th>Share</th></tr></thead><tbody>
				{sortedHospitals.length ? sortedHospitals.map((hospital) => {
					const share = linkedCases > 0 ? Math.round((hospital.cases / linkedCases) * 100) : 0;
					return <tr key={hospital.hospitalId}><td><strong>{hospital.hospital}</strong></td><td className="tabular-nums">{hospital.cases.toLocaleString()}</td><td className="tabular-nums payment-amount">BDT {(hospital.cases * SOS_SERVICE_FEE).toFixed(2)}</td><td><div className="revenue-share"><div className="revenue-share-track"><div className="revenue-share-fill" style={{ width: `${Math.max(share, 4)}%` }} /></div><span>{share}%</span></div></td></tr>;
				}) : <tr><td className="payment-empty" colSpan={4}>No completed SOS events with hospital associations were found.</td></tr>}
			</tbody></table></div>
		</Panel>
	</main>;
}