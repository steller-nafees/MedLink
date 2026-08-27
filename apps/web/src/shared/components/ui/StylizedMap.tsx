import type { CSSProperties } from "react";
import { Ambulance, Hospital } from "lucide-react";

type MapMarker = { x: number; y: number; kind: "hospital" | "ambulance"; label: string };

export function StylizedMap({ className = "", markers }: { className?: string; markers: MapMarker[] }) {
	return <div className={`ui-map ${className}`} role="img" aria-label="Live ambulance locations"><div className="ui-map-roads" />{markers.map((marker) => <div className={`ui-map-marker ui-map-marker-${marker.kind}`} key={`${marker.kind}-${marker.label}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` } as CSSProperties} title={marker.label}>{marker.kind === "hospital" ? <Hospital /> : <Ambulance />}</div>)}</div>;
}