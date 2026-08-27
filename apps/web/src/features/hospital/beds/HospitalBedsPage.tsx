import { useEffect, useState } from "react";
import { Activity, BedDouble, User } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { getHospitalBedsFromApi, type HospitalBed } from "@/services/hospital.service";
import type { BedTone, HospitalWard } from "@/types/hospital";

const toneClasses: Record<BedTone, string> = {
	primary: "beds-primary",
	emergency: "beds-emergency",
	info: "beds-info",
	warning: "beds-warning",
};

function percentage(value: number, available: number) {
	return ((value - available) / value) * 100;
}

function WardCard({ ward }: { ward: HospitalWard }) {
	const occupied = ward.beds.filter((bed) => bed.occupied).length;
	return <Card className="beds-ward-card"><div className="beds-ward-heading"><div><h2>{ward.name}</h2><p>{occupied}/{ward.beds.length} occupied</p></div><div className="beds-legend"><span><i className={`beds-legend-dot ${toneClasses[ward.tone]}`} />Occupied</span><span><i className="beds-legend-dot beds-available" />Available</span></div></div><div className="beds-grid">{ward.beds.map((bed) => <div className={`beds-unit ${bed.occupied ? toneClasses[ward.tone] : "beds-available"}`} key={bed.id}><span>#{bed.id}</span>{bed.occupied && <User aria-hidden="true" className="beds-unit-user" />}</div>)}</div></Card>;
}

export function HospitalBedsPage() {
	const [beds, setBeds] = useState<HospitalBed[]>([]);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => { getHospitalBedsFromApi().then(setBeds).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load beds")); }, []);
	const wards = Array.from(new Set(beds.map((bed) => bed.ward_name))).map((name, index) => ({ name, tone: index % 2 ? "primary" as const : "emergency" as const, beds: beds.filter((bed) => bed.ward_name === name).map((bed, bedIndex) => ({ id: bedIndex + 1, occupied: bed.bed_status !== "AVAILABLE" })) }));
	const total = beds.length;
	const available = beds.filter((bed) => bed.bed_status === "AVAILABLE").length;
	const capacity = [{ label: "Total beds", value: total, available, tone: "primary" as const }, { label: "Occupied beds", value: beds.filter((bed) => bed.bed_status === "OCCUPIED").length, available: 0, tone: "emergency" as const }];
	if (error) return <main className="hospital-beds"><p role="alert">{error}</p></main>;
	if (!beds.length) return <main className="hospital-beds"><p>Loading beds...</p></main>;
	return <main className="hospital-beds"><PageHeader title="Beds & ICU" subtitle="Live occupancy across wards" actions={<><Button onClick={() => window.print()}>Print report</Button><Button variant="primary">Reserve bed</Button></>} /><div className="beds-summary-grid">{capacity.map((item, index) => <StatCard key={item.label} label={item.label} value={item.value} available={item.available} percentage={percentage(item.value, item.available)} tone={item.tone} icon={index === 1 ? Activity : BedDouble} />)}</div><div className="beds-wards">{wards.map((ward) => <WardCard key={ward.name} ward={ward} />)}</div></main>;
}
