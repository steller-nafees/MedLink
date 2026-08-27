import type { ComponentType } from "react";
import { Card } from "./Card";

type StatCardProps = { label: string; value: number; available: number; percentage: number; tone?: "primary" | "emergency" | "warning"; icon: ComponentType<{ className?: string }> };

export function StatCard({ label, value, available, percentage, tone = "primary", icon: Icon }: StatCardProps) {
	return <Card className="beds-stat-card"><div className="beds-stat-label"><Icon className="beds-stat-icon" />{label}</div><div className="beds-stat-value"><strong>{value}</strong><span className={`beds-tone-${tone}`}>{available} available</span></div><div className="beds-capacity-track"><span className={`beds-capacity-fill beds-fill-${tone}`} style={{ width: `${percentage}%` }} /></div><p>{Math.round(percentage)}% capacity</p></Card>;
}
