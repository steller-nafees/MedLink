import { createFileRoute, Link } from "@tanstack/react-router";
import { emergencyQueue, analytics, severityStyle, hospitals } from "@/lib/medlink/data";
import { Activity, BedDouble, Truck, TrendingUp, ArrowUpRight, Clock, Siren, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hospital/")({
  head: () => ({ meta: [{ title: "Overview · Hospital Dashboard" }, { name: "description", content: "Emergency operations at a glance." }] }),
  component: Overview,
});

function Overview() {
  const h = hospitals[0];
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">Wednesday, April 24</p>
          <h1 className="mt-1 text-[32px] font-bold leading-tight tracking-tight">Good morning, Dr. Amara</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">4 active emergencies · 2 incoming in the next 15 minutes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-border bg-surface px-4 py-2 text-[12.5px] font-semibold">Today</button>
          <Link to="/hospital/emergencies" className="flex items-center gap-2 rounded-full gradient-emergency px-4 py-2 text-[12.5px] font-semibold text-white shadow-float">
            <Siren className="size-4" /> Emergency queue
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Active cases" value="12" delta="+3" icon={Activity} tone="emergency" />
        <Kpi label="Avg. response" value={`${analytics.avgResponse}m`} delta="-0.8m" icon={Clock} tone="success" />
        <Kpi label="Beds occupied" value={`${h.beds.total - h.beds.available}/${h.beds.total}`} delta="72%" icon={BedDouble} />
        <Kpi label="ICU occupied" value={`${h.icu.total - h.icu.available}/${h.icu.total}`} delta="79%" icon={Activity} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold">Cases this week</h2>
              <p className="text-[12px] text-muted-foreground">Incoming volume and average response time</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-success"><TrendingUp className="size-3.5" /> +12% vs last week</div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={analytics.weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }} />
                <Line type="monotone" dataKey="cases" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
          <h2 className="text-[16px] font-bold">Severity mix</h2>
          <p className="text-[12px] text-muted-foreground">Last 30 days</p>
          <div className="mt-4 h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analytics.bySeverity} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {analytics.bySeverity.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {analytics.bySeverity.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-[12.5px]">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 font-medium">{s.name}</span>
                <span className="text-muted-foreground">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-border/70 bg-surface shadow-card">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="text-[16px] font-bold">Incoming emergencies</h2>
              <p className="text-[12px] text-muted-foreground">AI-triaged · live from patient app & dispatch</p>
            </div>
            <Link to="/hospital/emergencies" className="flex items-center gap-1 text-[12.5px] font-semibold text-primary">View all <ArrowUpRight className="size-3.5" /></Link>
          </div>
          <div className="divide-y divide-border/70">
            {emergencyQueue.slice(0, 3).map((e) => {
              const s = severityStyle(e.severity);
              return (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={cn("grid size-10 place-items-center rounded-2xl", s.bg, s.text)}>
                    <Siren className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-semibold">{e.patient}, {e.age}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", s.bg, s.text)}>{e.severity}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{e.summary}</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-[12.5px] font-bold">ETA {e.eta}</p>
                    <p className="text-[10.5px] text-muted-foreground">{e.ambulance}</p>
                  </div>
                  <button className="rounded-full gradient-primary px-3 py-1.5 text-[11.5px] font-semibold text-primary-foreground shadow-float">Accept</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-primary/30 gradient-hero p-5 shadow-card">
          <div className="flex items-center gap-2">
  <div className="flex items-center gap-2 text-primary">
    <Sparkles className="size-4" />
    <p className="text-[11.5px] font-bold uppercase tracking-widest">
      AI Insight
    </p>
  </div>

  <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
    Coming Soon
  </span>
</div>
          <p className="mt-3 text-[15px] font-bold leading-snug">Cardiology capacity is tightening.</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/75">
            Predicted 3 additional cardiac cases in next 2 hours. Consider staging ICU Bay 4 and paging on-call cardiologist.
          </p>
          <button className="mt-4 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-[12px] font-semibold text-background">
            <Truck className="size-3.5" /> Prepare team
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, icon: Icon, tone }: any) {
  const toneCls = tone === "emergency" ? "bg-emergency/10 text-emergency" : tone === "success" ? "bg-success/10 text-success" : tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary-container text-primary";
  return (
    <div className="rounded-3xl border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className={cn("grid size-10 place-items-center rounded-2xl", toneCls)}><Icon className="size-4" /></div>
        <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{delta}</span>
      </div>
      <p className="mt-4 text-[28px] font-bold leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
