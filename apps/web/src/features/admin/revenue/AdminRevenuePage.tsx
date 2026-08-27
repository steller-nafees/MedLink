import { useState, useEffect } from "react";
import { Wallet, TrendingUp, Siren, CheckCircle2, Hourglass, Download } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { Table, Tr, Td } from "@/shared/components/ui/Table";
import { GhostButton } from "@/shared/components/ui/Button";
import { AreaChart } from "@/shared/components/charts/AreaChart";
import { BarChart } from "@/shared/components/charts/BarChart";
import { platformService, SOS_SERVICE_FEE } from "@/services/platform.service";
import { bdt } from "@/shared/utils/format";
import type { MonthlyRevenue, Settlement, Totals } from "@/types/platform";

export function AdminRevenuePage() {
  const [data, setData] = useState<{
    revenueStats: { totalRevenue: number; totalOutstanding: number; totalSettled: number };
    monthlyRevenue: MonthlyRevenue[];
    settlements: Settlement[];
    totals: Totals;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [revenueStats, monthlyRevenue, settlements, totals] = await Promise.all([
        platformService.getOverallRevenueStats(),
        platformService.getMonthlyRevenue(),
        platformService.getSettlements(),
        platformService.getTotals()
      ]);
      setData({ revenueStats, monthlyRevenue, settlements, totals });
    }
    loadData();
  }, []);

  if (!data) return null;

  const thisMonth = data.monthlyRevenue[data.monthlyRevenue.length - 1];
  const rate = Math.round((data.revenueStats.totalSettled / data.revenueStats.totalRevenue) * 100) || 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Revenue & billing"
        subtitle={`${bdt(SOS_SERVICE_FEE)} MedLink service fee per Emergency SOS case, collected by hospitals and settled with MedLink`}
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[12.5px] font-semibold transition hover:bg-surface-variant">
            <Download className="size-4" /> Export report
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total revenue" value={bdt(data.revenueStats.totalRevenue)} sub="Lifetime service fees" icon={Wallet} tone="primary" />
        <StatCard label="Revenue this month" value={bdt(thisMonth?.revenue || 0)} sub="+15.8% vs last month" icon={TrendingUp} tone="success" />
        <StatCard label="Total SOS cases" value={data.totals.sos.toLocaleString()} sub="Billable emergency cases" icon={Siren} tone="warning" />
        <StatCard label="Settled revenue" value={bdt(data.revenueStats.totalSettled)} sub={`${rate}% settlement rate`} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending settlement" value={bdt(data.revenueStats.totalOutstanding)} sub="Outstanding from hospitals" icon={Hourglass} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Monthly revenue trend" subtitle="Last 6 months">
          <div className="h-64">
            <AreaChart 
              data={data.monthlyRevenue} 
              dataKey="revenue" 
              name="Revenue"
              xAxisKey="m"
              color="var(--color-primary)"
              yAxisWidth={64}
              yAxisFormatter={(v) => `${v / 1000}k`}
              formatter={(v: number) => bdt(v)}
              gradientId="rv3"
            />
          </div>
        </Card>

        <Card title="Monthly SOS cases" subtitle="Billable emergency cases">
          <div className="h-64">
            <BarChart 
              data={data.monthlyRevenue}
              xAxisKey="m"
              yAxisWidth={40}
              series={[
                { key: "cases", name: "SOS cases", color: "var(--color-secondary)", radius: [10, 10, 4, 4] }
              ]}
            />
          </div>
        </Card>
      </div>

      <Card title="Hospital settlements" subtitle="Revenue generated, settled and outstanding per hospital" bodyClassName="p-0">
        <Table head={["Hospital", "SOS cases", "Revenue generated", "Amount settled", "Outstanding", "Completion", ""]}>
          {data.settlements.map((s) => {
            const revenue = s.revenue ?? 0;
            const outstanding = s.outstanding ?? 0;
            const pct = revenue > 0 ? Math.round((s.settled / revenue) * 100) : 0;
            return (
              <Tr key={s.hospital}>
                <Td className="font-semibold">{s.hospital}</Td>
                <Td className="tabular-nums text-muted-foreground">{s.cases}</Td>
                <Td className="tabular-nums font-semibold">{bdt(revenue)}</Td>
                <Td className="tabular-nums text-success">{bdt(s.settled)}</Td>
                <Td className={`tabular-nums font-semibold ${outstanding > 0 ? "text-warning" : "text-muted-foreground"}`}>
                  {bdt(outstanding)}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-variant">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11.5px] tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <GhostButton>View statement</GhostButton>
                    <GhostButton>Export</GhostButton>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
