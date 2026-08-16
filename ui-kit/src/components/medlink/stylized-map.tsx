import { cn } from "@/lib/utils";
import type { Hospital } from "@/lib/medlink/data";

type Marker = { x: number; y: number; label?: string; kind: "hospital" | "patient" | "ambulance" };

export function StylizedMap({
  className,
  markers = [],
  route,
  compact,
}: {
  className?: string;
  markers?: Marker[];
  route?: { from: { x: number; y: number }; to: { x: number; y: number } };
  compact?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/60 bg-surface-variant", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.012 190)" />
            <stop offset="100%" stopColor="oklch(0.93 0.02 190)" />
          </linearGradient>
          <pattern id="mapGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="oklch(0.90 0.015 190)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mapBg)" />
        <rect width="100" height="100" fill="url(#mapGrid)" />
        {/* rivers / parks */}
        <path d="M -5 62 Q 30 55 55 68 T 110 60" stroke="oklch(0.82 0.06 210)" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M -5 62 Q 30 55 55 68 T 110 60" stroke="oklch(0.75 0.09 210)" strokeWidth="1.2" fill="none" opacity="0.9" />
        <ellipse cx="18" cy="24" rx="14" ry="10" fill="oklch(0.90 0.08 155)" opacity="0.55" />
        <ellipse cx="82" cy="82" rx="16" ry="8" fill="oklch(0.90 0.08 155)" opacity="0.5" />
        {/* roads */}
        <g stroke="white" strokeLinecap="round" fill="none">
          <path d="M -5 45 L 105 42" strokeWidth="2.2" />
          <path d="M 20 -5 L 25 105" strokeWidth="2" />
          <path d="M 62 -5 L 70 105" strokeWidth="2" />
          <path d="M -5 78 L 105 74" strokeWidth="1.6" opacity="0.8" />
          <path d="M -5 18 L 105 20" strokeWidth="1.4" opacity="0.7" />
        </g>
        <g stroke="oklch(0.88 0.015 195)" strokeLinecap="round" fill="none">
          <path d="M -5 45 L 105 42" strokeWidth="2.6" />
          <path d="M 20 -5 L 25 105" strokeWidth="2.4" />
          <path d="M 62 -5 L 70 105" strokeWidth="2.4" />
        </g>
        {/* route */}
        {route && (
          <g>
            <path
              d={`M ${route.from.x} ${route.from.y} Q ${(route.from.x + route.to.x) / 2 + 6} ${Math.min(route.from.y, route.to.y) - 12}, ${route.to.x} ${route.to.y}`}
              stroke="var(--color-primary)"
              strokeWidth="1.6"
              strokeDasharray="2 1.5"
              fill="none"
              opacity="0.95"
            />
          </g>
        )}
      </svg>

      {/* markers */}
      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          {m.kind === "hospital" && (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-card">
                {m.label ?? "Hospital"}
              </div>
              <div className="mt-1 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-float ring-2 ring-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 4v16M4 12h16"/></svg>
              </div>
            </div>
          )}
          {m.kind === "patient" && (
            <div className="relative">
              <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-emergency/40" />
              <div className="relative grid size-6 place-items-center rounded-full bg-emergency text-white ring-4 ring-white shadow-float">
                <span className="size-2 rounded-full bg-white" />
              </div>
            </div>
          )}
          {m.kind === "ambulance" && (
            <div className="grid size-7 place-items-center rounded-full bg-foreground text-background ring-4 ring-white shadow-float">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 17V8h11l4 5v4M6 17h12"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/><path d="M8 11h3M9.5 9.5v3" /></svg>
            </div>
          )}
        </div>
      ))}

      {!compact && (
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {["+", "−"].map((s) => (
            <button key={s} className="grid size-8 place-items-center rounded-lg bg-surface/95 text-sm font-semibold text-foreground shadow-card backdrop-blur">{s}</button>
          ))}
        </div>
      )}
      {!compact && (
        <button className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-surface shadow-card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        </button>
      )}
    </div>
  );
}

export function hospitalMarkers(list: Hospital[]): Marker[] {
  return list.map((h) => ({ x: h.coord.x, y: h.coord.y, kind: "hospital", label: h.name.split(" ")[0] }));
}
