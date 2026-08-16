import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { hospitalRequests, type ServiceRequest } from "@/lib/medlink/data";
import { PageHead, Panel, RequestRow, Action } from "@/components/medlink/hospital-kit";

export const Route = createFileRoute("/hospital/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations · MedLink Hospital" },
      { name: "description", content: "Approve bed and ICU reservations and track occupancy." },
      { property: "og:title", content: "Reservations · MedLink Hospital" },
      { property: "og:description", content: "Approve, reject and release bed and ICU reservations." },
    ],
  }),
  component: Reservations,
});

function Reservations() {
  const [ov, setOv] = useState<Record<string, ServiceRequest["status"]>>({});
  const [occupied, setOccupied] = useState<string[]>([]);
  const all = hospitalRequests
    .filter((r) => r.kind === "bed" || r.kind === "icu")
    .map((r) => (ov[r.id] ? { ...r, status: ov[r.id] } : r));

  const groups = [
    { title: "Bed reservations", list: all.filter((r) => r.kind === "bed") },
    { title: "ICU reservations", list: all.filter((r) => r.kind === "icu") },
  ];

  return (
    <div className="space-y-5">
      <PageHead title="Reservations" subtitle="Bed and ICU requests from MedLink patients" />
      {groups.map((g) => (
        <Panel key={g.title} title={g.title} subtitle={`${g.list.length} total`}>
          {g.list.map((r) => (
            <RequestRow
              key={r.id}
              req={r}
              actions={
                <>
                  {r.status === "pending" && (
                    <>
                      <Action tone="primary" onClick={() => setOv((o) => ({ ...o, [r.id]: "confirmed" }))}>Approve</Action>
                      <Action tone="danger" onClick={() => setOv((o) => ({ ...o, [r.id]: "cancelled" }))}>Reject</Action>
                    </>
                  )}
                  {(r.status === "accepted" || r.status === "confirmed") &&
                    (occupied.includes(r.id) ? (
                      <Action onClick={() => setOv((o) => ({ ...o, [r.id]: "completed" }))}>Mark released</Action>
                    ) : (
                      <Action tone="primary" onClick={() => setOccupied((c) => [...c, r.id])}>Mark occupied</Action>
                    ))}
                  {r.status === "completed" && <span className="self-center text-[12px] text-muted-foreground">Released</span>}
                </>
              }
            />
          ))}
          {!g.list.length && <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">No reservations.</p>}
        </Panel>
      ))}
    </div>
  );
}
