import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { hospitalRequests, type ServiceRequest } from "@/lib/medlink/data";
import { PageHead, Panel, RequestRow, Action } from "@/components/medlink/hospital-kit";

export const Route = createFileRoute("/hospital/diagnostics")({
  head: () => ({
    meta: [
      { title: "Diagnostics · MedLink Hospital" },
      { name: "description", content: "Manage diagnostic test requests, pricing and scheduling." },
      { property: "og:title", content: "Diagnostics · MedLink Hospital" },
      { property: "og:description", content: "Accept, schedule and complete diagnostic tests." },
    ],
  }),
  component: Diagnostics,
});

function Diagnostics() {
  const [ov, setOv] = useState<Record<string, ServiceRequest["status"]>>({});
  const list = hospitalRequests
    .filter((r) => r.kind === "diagnostic")
    .map((r) => (ov[r.id] ? { ...r, status: ov[r.id] } : r));

  return (
    <div>
      <PageHead title="Diagnostic tests" subtitle="Test requests, prices and status" />
      <Panel title="Test requests" subtitle={`${list.length} total`}>
        {list.map((r) => (
          <RequestRow
            key={r.id}
            req={r}
            actions={
              <>
                {r.status === "pending" && <Action tone="primary" onClick={() => setOv((o) => ({ ...o, [r.id]: "accepted" }))}>Accept</Action>}
                {r.status === "accepted" && <Action onClick={() => setOv((o) => ({ ...o, [r.id]: "scheduled" }))}>Schedule</Action>}
                {(r.status === "scheduled" || r.status === "confirmed") && <Action tone="primary" onClick={() => setOv((o) => ({ ...o, [r.id]: "completed" }))}>Complete</Action>}
              </>
            }
          />
        ))}
      </Panel>
    </div>
  );
}
