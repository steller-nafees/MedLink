import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ambulances } from "@/lib/medlink/data";
import { StylizedMap } from "@/components/medlink/stylized-map";
import {
  Truck,
  PhoneCall,
  MessageSquare,
  MapPin,
  Siren,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospital/ambulances")({
  head: () => ({
    meta: [
      { title: "Ambulances · Hospital Dashboard" },
      { name: "description", content: "Live ambulance fleet dispatch and emergency request queue." },
    ],
  }),
  component: Amb,
});

const statusStyle = {
  available: "bg-success/10 text-success",
  en_route: "bg-warning/10 text-warning",
  on_scene: "bg-info/10 text-info",
  returning: "bg-primary-container text-primary",
} as const;

const urgencyStyle = {
  critical: "bg-emergency/10 text-emergency",
  moderate: "bg-warning/10 text-warning",
  stable: "bg-muted text-muted-foreground",
} as const;

// TODO: move to lib/medlink/data.ts and wire to the real SOS/request feed.
// A request appearing here means it has already been routed to THIS hospital —
// so assigning it means picking one of this hospital's own ambulances.
type EmergencyRequest = {
  id: string;
  patientName: string;
  urgency: keyof typeof urgencyStyle;
  complaint: string;
  address: string;
  distanceKm: number;
  requestedAgoMin: number;
  status: "pending" | "assigned";
  assignedAmbulanceId?: string;
};

const initialRequests: EmergencyRequest[] = [
  {
    id: "req-1",
    patientName: "Rahim Chowdhury",
    urgency: "critical",
    complaint: "Chest pain, difficulty breathing",
    address: "Road 12, Banani",
    distanceKm: 3.1,
    requestedAgoMin: 2,
    status: "pending",
  },
  {
    id: "req-2",
    patientName: "Nusrat Jahan",
    urgency: "moderate",
    complaint: "Fall injury, suspected fracture",
    address: "Mirpur DOHS",
    distanceKm: 6.4,
    requestedAgoMin: 6,
    status: "pending",
  },
  {
    id: "req-3",
    patientName: "Kamal Hossain",
    urgency: "stable",
    complaint: "Scheduled dialysis transport",
    address: "Uttara Sector 7",
    distanceKm: 9.8,
    requestedAgoMin: 14,
    status: "pending",
  },
];

function Amb() {
  const positions = [{ x: 30, y: 40 }, { x: 60, y: 30 }, { x: 45, y: 70 }];

  const fleet = useMemo(
    () => ambulances.map((a, i) => ({ ...a, pos: positions[i] ?? { x: 50, y: 50 } })),
    []
  );

  const [requests, setRequests] = useState(initialRequests);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const available = fleet.filter((a) => a.status === "available");
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  function assign(requestId: string, ambulanceId: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "assigned", assignedAmbulanceId: ambulanceId } : r
      )
    );
    setAssigningId(null);
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Ambulance fleet</h1>
          <p className="text-[13px] text-muted-foreground">
            {fleet.length} units · {available.length} available · {pendingCount} pending requests
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-emergency/10 px-3 py-1.5 text-[12px] font-bold text-emergency">
            <Siren className="size-3.5" /> {pendingCount} awaiting dispatch
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Left column: map + incoming requests */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/70 bg-surface p-3 shadow-card">
            <StylizedMap
              className="h-[320px] rounded-2xl"
              markers={[
                { x: 50, y: 50, kind: "hospital", label: "St. Mercy" },
                ...fleet.map((a) => ({ ...a.pos, kind: "ambulance" as const, label: a.callSign })),
              ]}
            />
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold">Emergency requests</p>
              <span className="text-[11.5px] text-muted-foreground">{requests.length} total</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "rounded-2xl border p-3",
                    r.status === "pending" ? "border-emergency/30 bg-emergency/5" : "border-border/70 bg-background"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <p className="truncate text-[13.5px] font-bold">{r.patientName}</p>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", urgencyStyle[r.urgency])}>
                          {r.urgency}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{r.complaint}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11.5px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {r.address} · {r.distanceKm} km</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {r.requestedAgoMin} min ago</span>
                      </div>
                    </div>
                  </div>

                  {r.status === "assigned" ? (
                    <div className="mt-2.5 flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[11.5px] font-semibold text-success">
                      <CheckCircle2 className="size-3.5" />
                      Assigned to {fleet.find((a) => a.id === r.assignedAmbulanceId)?.callSign ?? "unit"}
                    </div>
                  ) : (
                    <div className="relative mt-2.5">
                      <button
                        onClick={() => setAssigningId(assigningId === r.id ? null : r.id)}
                        className="flex items-center gap-1.5 rounded-full gradient-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-float"
                      >
                        Assign ambulance <ChevronDown className="size-3.5" />
                      </button>

                      {assigningId === r.id && (
                        <div className="absolute left-0 top-[calc(100%+6px)] z-10 w-72 rounded-2xl border border-border/70 bg-surface p-2 shadow-float">
                          <div className="flex items-center justify-between px-1 pb-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Available units</p>
                            <button onClick={() => setAssigningId(null)}><X className="size-3.5 text-muted-foreground" /></button>
                          </div>
                          {available.length === 0 ? (
                            <p className="px-2 py-2 text-[12px] text-muted-foreground">No available units right now.</p>
                          ) : (
                            <div className="max-h-52 space-y-1 overflow-auto">
                              {available.map((a) => (
                                <button
                                  key={a.id}
                                  onClick={() => assign(r.id, a.id)}
                                  className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-surface-variant"
                                >
                                  <div>
                                    <p className="text-[12.5px] font-semibold">{a.callSign}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {a.type} · {a.distanceKm} km · ETA {a.etaMin}m
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: fleet */}
        <div className="space-y-3">
          <p className="text-[14px] font-bold">Fleet</p>
          {fleet.map((a) => (
            <div key={a.id} className="rounded-3xl border border-border/70 bg-surface p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="grid size-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-float">
                  <Truck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[15px] font-bold">{a.callSign}</p>
                    <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-semibold text-foreground/70">{a.type}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest capitalize", statusStyle[a.status])}>
                      {a.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{a.crew}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {a.distanceKm} km</span>
                    <span>ETA {a.etaMin} min</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2 text-[12px] font-semibold">
                  <PhoneCall className="size-3.5" /> Call
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border py-2 text-[12px] font-semibold">
                  <MessageSquare className="size-3.5" /> Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}