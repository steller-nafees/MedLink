import { createFileRoute } from "@tanstack/react-router";
import { Building2, Truck, Users, Activity, ShieldCheck } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  StatusPill,
  chartAxis,
  tooltipStyle,
} from "@/components/medlink/admin/admin-kit";
import { apiServices, uptimeSeries, dauSeries, totals } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/health")({
  head: () => ({
    meta: [
      { title: "System Health · MedLink Super Admin" },
      { name: "description", content: "Monitor MedLink uptime, API status and daily active platform usage." },
      { property: "og:title", content: "MedLink System Health" },
      { property: "og:description", content: "Uptime, API service status and active provider counts." },
    ],
  }),
  component: Health,
});

function Health() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Reliability"
        title="System health"
        subtitle="All core services operational · 99.98% uptime over the last 30 days"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Active hospitals" value="24" sub={`of ${totals.hospitals} registered`} icon={Building2} tone="primary" />
        <Kpi label="Active drivers" value="151" sub={`of ${totals.drivers} registered`} icon={Truck} tone="info" />
        <Kpi label="Daily active users" value="7,340" sub="+4.1% vs yesterday" icon={Users} tone="success" />
        <Kpi label="API status" value="Operational" sub="1 service degraded" icon={Activity} tone="warning" />
        <Kpi label="System uptime" value="99.98%" sub="Rolling 30 days" icon={ShieldCheck} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Uptime" subtitle="Last 30 days">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={uptimeSeries}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="d" {...chartAxis} />
                <YAxis {...chartAxis} width={52} domain={[99.5, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                <Line type="monotone" dataKey="uptime" name="Uptime" stroke="var(--color-success)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Daily active users" subtitle="Last 14 days">
          <div className="h-60">
            <ResponsiveContainer>
              <AreaChart data={dauSeries}>
                <defs>
                  <linearGradient id="dau" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="d" {...chartAxis} />
                <YAxis {...chartAxis} width={52} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="dau" name="DAU" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#dau)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="API services" subtitle="Live status and average latency" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {apiServices.map((s) => (
            <li key={s.name} className="flex items-center gap-4 px-5 py-4">
              <p className="flex-1 text-[13.5px] font-semibold">{s.name}</p>
              <p className="text-[12.5px] tabular-nums text-muted-foreground">{s.latency}</p>
              <StatusPill status={s.status} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
