import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Siren, CheckCircle2, Hourglass, Download } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  PageHeader,
  Panel,
  Kpi,
  DataTable,
  Td,
  Tr,
  GhostButton,
  chartAxis,
  tooltipStyle,
} from "@/components/medlink/admin/admin-kit";
import {
  settlements,
  monthlyRevenue,
  totalRevenue,
  totalSettled,
  totalOutstanding,
  totalSosCases,
  bdt,
  SOS_SERVICE_FEE,
} from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue & Billing · MedLink Super Admin" },
      { name: "description", content: "Monitor MedLink service fee revenue and hospital settlement performance." },
      { property: "og:title", content: "MedLink Revenue & Billing" },
      { property: "og:description", content: "Service fee revenue, settlements and outstanding balances by hospital." },
    ],
  }),
  component: Revenue,
});

function Revenue() {
  const thisMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const rate = Math.round((totalSettled / totalRevenue) * 100);

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
        <Kpi label="Total revenue" value={bdt(totalRevenue)} sub="Lifetime service fees" icon={Wallet} tone="primary" />
        <Kpi label="Revenue this month" value={bdt(thisMonth.revenue)} sub="+15.8% vs last month" icon={TrendingUp} tone="success" />
        <Kpi label="Total SOS cases" value={totalSosCases.toLocaleString()} sub="Billable emergency cases" icon={Siren} tone="warning" />
        <Kpi label="Settled revenue" value={bdt(totalSettled)} sub={`${rate}% settlement rate`} icon={CheckCircle2} tone="success" />
        <Kpi label="Pending settlement" value={bdt(totalOutstanding)} sub="Outstanding from hospitals" icon={Hourglass} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly revenue trend" subtitle="Last 6 months">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rv3" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={64} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => bdt(v)} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rv3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Monthly SOS cases" subtitle="Billable emergency cases">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cases" name="SOS cases" radius={[10, 10, 4, 4]} fill="var(--color-secondary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Hospital settlements" subtitle="Revenue generated, settled and outstanding per hospital" bodyClassName="p-0">
        <DataTable head={["Hospital", "SOS cases", "Revenue generated", "Amount settled", "Outstanding", "Completion", ""]}>
          {settlements.map((s) => {
            const pct = Math.round((s.settled / s.revenue) * 100);
            return (
              <Tr key={s.hospital}>
                <Td className="font-semibold">{s.hospital}</Td>
                <Td className="tabular-nums text-muted-foreground">{s.cases}</Td>
                <Td className="tabular-nums font-semibold">{bdt(s.revenue)}</Td>
                <Td className="tabular-nums text-success">{bdt(s.settled)}</Td>
                <Td className={`tabular-nums font-semibold ${s.outstanding > 0 ? "text-warning" : "text-muted-foreground"}`}>
                  {bdt(s.outstanding)}
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
        </DataTable>
      </Panel>
    </div>
  );
}
