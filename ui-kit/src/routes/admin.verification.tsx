import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Truck, FileText, IdCard, CheckCircle2 } from "lucide-react";
import {
  PageHeader,
  Panel,
  StatusPill,
  TypeChip,
} from "@/components/medlink/admin/admin-kit";
import {
  hospitalApplications,
  driverApplications,
} from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({
    meta: [
      { title: "Verification Center · MedLink Super Admin" },
      { name: "description", content: "Approve or reject pending hospital and ambulance driver applications." },
      { property: "og:title", content: "MedLink Verification Center" },
      { property: "og:description", content: "Pending hospital and driver applications with submitted documents." },
    ],
  }),
  component: Verification,
});

type Decision = "approved" | "rejected";

function Verification() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, d: Decision) => setDecisions((s) => ({ ...s, [id]: d }));

  const pendingCount =
    hospitalApplications.length + driverApplications.length - Object.keys(decisions).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Verification center"
        subtitle={`${pendingCount} application${pendingCount === 1 ? "" : "s"} awaiting a decision`}
      />

      <Panel title="Hospital applications" subtitle="Review submitted documents before approving" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {hospitalApplications.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-[240px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold">{a.name}</p>
                  <StatusPill status={decisions[a.id] === "approved" ? "verified" : decisions[a.id] === "rejected" ? "rejected" : "pending"} />
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {a.contact} · submitted {a.submitted} · {a.id}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.documents.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1.5 rounded-lg bg-surface-variant px-2.5 py-1.5 text-[11.5px] font-medium text-foreground/75">
                      <FileText className="size-3.5" /> {d}
                    </span>
                  ))}
                </div>
              </div>
              <Actions id={a.id} decision={decisions[a.id]} decide={decide} />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Ambulance driver applications" subtitle="Verify vehicle and licence details" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {driverApplications.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-info/10 text-info">
                <Truck className="size-5" />
              </div>
              <div className="min-w-[240px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold">{a.name}</p>
                  <StatusPill status={decisions[a.id] === "approved" ? "active" : decisions[a.id] === "rejected" ? "rejected" : "pending"} />
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">Submitted {a.submitted} · {a.id}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-lg border border-border bg-surface-variant/70 px-2.5 py-1.5 text-[12.5px] font-bold tracking-wide">
                    {a.reg}
                  </span>
                  <TypeChip label={a.type} />
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-variant px-2.5 py-1.5 text-[11.5px] font-medium text-foreground/75">
                    <IdCard className="size-3.5" /> {a.license} · expires {a.licenseExpiry}
                  </span>
                </div>
              </div>
              <Actions id={a.id} decision={decisions[a.id]} decide={decide} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Actions({
  id,
  decision,
  decide,
}: {
  id: string;
  decision?: Decision;
  decide: (id: string, d: Decision) => void;
}) {
  if (decision) {
    return (
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
        <CheckCircle2 className="size-4" /> {decision === "approved" ? "Approved" : "Rejected"}
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide(id, "rejected")}
        className="rounded-full border border-destructive/30 px-4 py-2 text-[12.5px] font-semibold text-destructive transition hover:bg-destructive/10"
      >
        Reject
      </button>
      <button
        onClick={() => decide(id, "approved")}
        className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-card transition hover:opacity-90"
      >
        Approve
      </button>
    </div>
  );
}
