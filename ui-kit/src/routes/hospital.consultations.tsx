import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { hospitalRequests, type ServiceRequest } from "@/lib/medlink/data";
import { PageHead, Panel, RequestRow, Action } from "@/components/medlink/hospital-kit";

export const Route = createFileRoute("/hospital/consultations")({
  head: () => ({
    meta: [
      { title: "Consultations · MedLink Hospital" },
      { name: "description", content: "Manage doctor consultation requests, assignments and fees." },
      { property: "og:title", content: "Consultations · MedLink Hospital" },
      { property: "og:description", content: "Accept, schedule and complete doctor consultations." },
    ],
  }),
  component: Consultations,
});

function Consultations() {
  const [ov, setOv] = useState<Record<string, ServiceRequest["status"]>>({});
  const list = hospitalRequests
    .filter((r) => r.kind === "consultation")
    .map((r) => (ov[r.id] ? { ...r, status: ov[r.id] } : r));

  return (
    <div>
      <PageHead title="Doctor consultations" subtitle="Requests, assigned doctors and consultation fees" />
      <Panel title="Consultation requests" subtitle={`${list.length} total`}>
        {list.map((r) => (
          <RequestRow
            key={r.id}
            req={r}
            actions={
              <>
                {r.status === "pending" && <Action tone="primary" onClick={() => setOv((o) => ({ ...o, [r.id]: "accepted" }))}>Accept</Action>}
                {r.status === "accepted" && <Action onClick={() => setOv((o) => ({ ...o, [r.id]: "scheduled" }))}>Schedule</Action>}
                {(r.status === "scheduled" || r.status === "confirmed") && <Action tone="primary" onClick={() => setOv((o) => ({ ...o, [r.id]: "completed" }))}>Complete</Action>}
                {r.doctor && <span className="self-center text-[12px] text-muted-foreground">{r.doctor}</span>}
              </>
            }
          />
        ))}
      </Panel>
    </div>
  );
}
