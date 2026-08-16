import { createFileRoute } from "@tanstack/react-router";
import { analytics } from "@/lib/medlink/data";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, RadialBarChart, RadialBar } from "recharts";

export const Route = createFileRoute("/hospital/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Hospital Dashboard" }, { name: "description", content: "Trends across cases, response times and utilization." }] }),
  component: Analytics,
});

function Analytics() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-muted-foreground">April 2026 · updated 2 minutes ago</p>
        </div>
        <div className="flex gap-2">
          {["Day", "Week", "Month", "Year"].map((t, i) => (
            <button key={t} className={`rounded-full px-4 py-2 text-[12px] font-semibold ${i === 1 ? "gradient-primary text-primary-foreground shadow-float" : "border border-border bg-surface"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Total cases" value={analytics.totalCases.toLocaleString()} delta="+8.4%" />
        <Kpi label="Avg. response" value={`${analytics.avgResponse}m`} delta="-0.6m" tone="success" />
        <Kpi label="Bed utilization" value={`${Math.round(analytics.bedsUtilization * 100)}%`} delta="+3%" />
        <Kpi label="ICU utilization" value={`${Math.round(analytics.icuUtilization * 100)}%`} delta="+5%" tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
          <h2 className="text-[16px] font-bold">Cases by day</h2>
          <p className="text-[12px] text-muted-foreground">Bars = case count, area = response time</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={analytics.weekly}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="cases" radius={[10, 10, 4, 4]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
          <h2 className="text-[16px] font-bold">Response time</h2>
          <p className="text-[12px] text-muted-foreground">Target: under 7 min</p>
          <div className="mt-4 h-52">
            <ResponsiveContainer>
              <RadialBarChart innerRadius={60} outerRadius={100} data={[{ value: 88, fill: "var(--color-primary)" }]} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[32px] font-bold leading-none">6.4<span className="text-[16px]">m</span></p>
          <p className="mt-1 text-center text-[12px] text-success">↓ 8% vs last week</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
        <h2 className="text-[16px] font-bold">Case trend · 30 days</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={Array.from({ length: 30 }).map((_, i) => ({ d: i + 1, v: 100 + Math.sin(i / 2) * 40 + i * 2 + Math.random() * 20 }))}>
              <defs>
                <linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#areaG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, tone }: any) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
      <p className="text-[12px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-3 text-[28px] font-bold leading-none tracking-tight">{value}</p>
      <p className={`mt-2 text-[12px] font-semibold ${toneCls}`}>{delta}</p>
    </div>
  );
}
