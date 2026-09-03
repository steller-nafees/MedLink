import { useState, useEffect } from "react";
import { Building2, CreditCard, RefreshCw, Siren, Wallet } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { EmptyRow, Table, Tr, Td } from "@/shared/components/ui/Table";
import { platformService, SOS_SERVICE_FEE } from "@/services/platform.service";
import { bdt } from "@/shared/utils/format";
import type { CompletedSosRevenue } from "@/types/platform";

export function AdminRevenuePage() {
  const [data, setData] = useState<CompletedSosRevenue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData() {
    setIsRefreshing(true);
    setError(null);
    try {
      setData(await platformService.getCompletedSosRevenue());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load completed SOS events.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  if (!data && !error) {
    return <div className="mx-auto max-w-[1400px] py-16 text-center text-sm text-muted-foreground">Loading revenue data...</div>;
  }

  const totalCompleted = data?.totalCompleted ?? 0;
  const totalRevenue = totalCompleted * SOS_SERVICE_FEE;
  const linkedCases = data?.hospitalCounts.reduce((total, hospital) => total + hospital.cases, 0) ?? 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="SOS revenue"
        subtitle={`Revenue is calculated from completed emergency SOS events at ${bdt(SOS_SERVICE_FEE)} per event.`}
        action={
          <button
            onClick={() => void loadData()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[12.5px] font-semibold transition hover:bg-surface-variant disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh data
          </button>
        }
      />

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={bdt(totalRevenue)} sub={`${totalCompleted.toLocaleString()} completed SOS × ${bdt(SOS_SERVICE_FEE)}`} icon={Wallet} tone="primary" />
        <StatCard label="Completed SOS events" value={totalCompleted.toLocaleString()} sub="Billable emergency events" icon={Siren} tone="warning" />
        <StatCard label="Service fee per event" value={bdt(SOS_SERVICE_FEE)} sub="Fixed MedLink fee" icon={CreditCard} tone="success" />
        <StatCard label="Hospital partners" value={(data?.hospitalCounts.length ?? 0).toLocaleString()} sub={`${linkedCases.toLocaleString()} hospital links`} icon={Building2} tone="info" />
      </div>

      <Card title="Completed SOS by hospital" subtitle="Hospital associations returned by completed event details" bodyClassName="p-0">
        <Table head={["Hospital", "Completed SOS", "Calculated revenue", "Share of hospital links"]}>
          {data?.hospitalCounts.length ? data.hospitalCounts.map((hospital) => {
            const share = linkedCases > 0 ? Math.round((hospital.cases / linkedCases) * 100) : 0;
            return (
              <Tr key={hospital.hospitalId}>
                <Td className="font-semibold">{hospital.hospital}</Td>
                <Td className="tabular-nums text-muted-foreground">{hospital.cases.toLocaleString()}</Td>
                <Td className="tabular-nums font-semibold">{bdt(hospital.cases * SOS_SERVICE_FEE)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-variant">
                      <div className="h-full bg-primary" style={{ width: `${share}%` }} />
                    </div>
                    <span className="text-[11.5px] tabular-nums text-muted-foreground">{share}%</span>
                  </div>
                </Td>
              </Tr>
            );
          }) : <EmptyRow colSpan={4} label="No completed SOS events with hospital associations were found." />}
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        Hospital revenue is an allocation view. An SOS event linked to more than one hospital appears once for each hospital association, while total revenue is always based on completed SOS events only.
        {data?.historyIsPartial && " The event history is limited to the first 1,000 records by the current API."}
      </p>
    </div>
  );
}
