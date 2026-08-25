import { useState, useEffect } from "react";
import { Building2, Truck, Users, Activity, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { LineChart } from "@/shared/components/charts/LineChart";
import { AreaChart } from "@/shared/components/charts/AreaChart";
import { platformService } from "@/services/platform.service";
import type { ApiService, UptimeData, DauData, Totals } from "@/types/platform";

export function AdminHealthPage() {
  const [data, setData] = useState<{
    apiServices: ApiService[];
    uptimeSeries: UptimeData[];
    dauSeries: DauData[];
    totals: Totals;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [apiServices, uptimeSeries, dauSeries, totals] = await Promise.all([
        platformService.getApiServices(),
        platformService.getUptimeSeries(),
        platformService.getDauSeries(),
        platformService.getTotals(),
      ]);
      setData({ apiServices, uptimeSeries, dauSeries, totals });
    }
    loadData();
  }, []);

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Reliability"
        title="System health"
        subtitle="All core services operational · 99.98% uptime over the last 30 days"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active hospitals" value="24" sub={`of ${data.totals.hospitals} registered`} icon={Building2} tone="primary" />
        <StatCard label="Active drivers" value="151" sub={`of ${data.totals.drivers} registered`} icon={Truck} tone="info" />
        <StatCard label="Daily active users" value="7,340" sub="+4.1% vs yesterday" icon={Users} tone="success" />
        <StatCard label="API status" value="Operational" sub="1 service degraded" icon={Activity} tone="warning" />
        <StatCard label="System uptime" value="99.98%" sub="Rolling 30 days" icon={ShieldCheck} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Uptime" subtitle="Last 30 days">
          <div className="h-60">
            <LineChart 
              data={data.uptimeSeries} 
              xAxisKey="d"
              yAxisWidth={52}
              domain={[99.5, 100]}
              yAxisFormatter={(v: number) => `${v}%`}
              tooltipFormatter={(v: number) => `${v.toFixed(2)}%`}
              series={[
                { key: "uptime", name: "Uptime", color: "var(--color-success)" }
              ]}
            />
          </div>
        </Card>

        <Card title="Daily active users" subtitle="Last 14 days">
          <div className="h-60">
            <AreaChart 
              data={data.dauSeries} 
              dataKey="dau" 
              name="DAU"
              xAxisKey="d"
              color="var(--color-primary)"
              yAxisWidth={52}
              gradientId="dau"
            />
          </div>
        </Card>
      </div>

      <Card title="API services" subtitle="Live status and average latency" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {data.apiServices.map((s) => (
            <li key={s.name} className="flex items-center gap-4 px-5 py-4">
              <p className="flex-1 text-[13.5px] font-semibold">{s.name}</p>
              <p className="text-[12.5px] tabular-nums text-muted-foreground">{s.latency}</p>
              <Badge status={s.status} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
