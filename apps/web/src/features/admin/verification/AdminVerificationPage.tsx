import { useState, useEffect } from "react";
import { Building2, Truck, FileText, IdCard, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { Badge, TypeChip } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { platformService } from "@/services/platform.service";
import type { HospitalApplication, DriverApplication } from "@/types/platform";

type Decision = "approved" | "rejected";

export function AdminVerificationPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [hospitalApplications, setHospitalApplications] = useState<HospitalApplication[]>([]);
  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>([]);

  useEffect(() => {
    async function loadData() {
      const hospitals = await platformService.getHospitalApplications();
      const drivers = await platformService.getDriverApplications();
      setHospitalApplications(hospitals);
      setDriverApplications(drivers);
    }
    loadData();
  }, []);

  const decide = (id: string, d: Decision) => {
    setDecisions((s) => ({ ...s, [id]: d }));
    // Dispatch event so AdminLayout can update sidebar badge
    window.dispatchEvent(new CustomEvent("verification-decided"));
  };

  const pendingCount =
    hospitalApplications.length + driverApplications.length - Object.keys(decisions).length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Verification center"
        subtitle={`${pendingCount} application${pendingCount === 1 ? "" : "s"} awaiting a decision`}
      />

      <Card title="Hospital applications" subtitle="Review submitted documents before approving" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {hospitalApplications.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-container text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-[240px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold">{a.name}</p>
                  <Badge status={decisions[a.id] === "approved" ? "verified" : decisions[a.id] === "rejected" ? "rejected" : "pending"} />
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
      </Card>

      <Card title="Ambulance driver applications" subtitle="Verify vehicle and licence details" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {driverApplications.map((a) => (
            <li key={a.id} className="flex flex-wrap items-start gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-info/10 text-info">
                <Truck className="size-5" />
              </div>
              <div className="min-w-[240px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-bold">{a.name}</p>
                  <Badge status={decisions[a.id] === "approved" ? "active" : decisions[a.id] === "rejected" ? "rejected" : "pending"} />
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
      </Card>
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
      <Button variant="danger" onClick={() => decide(id, "rejected")}>
        Reject
      </Button>
      <Button variant="primary" onClick={() => decide(id, "approved")}>
        Approve
      </Button>
    </div>
  );
}
