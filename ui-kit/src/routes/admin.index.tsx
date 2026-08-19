import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Truck,
  Building2,
  Siren,
  Droplet,
  CalendarCheck,
  Wallet,
  Hourglass,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Kpi,
  Panel,
  PageHeader,
  StatusPill,
  chartAxis,
  tooltipStyle,
} from "@/components/medlink/admin/admin-kit";
import {
  totals,
  totalRevenue,
  totalOutstanding,
  monthlyRevenue,
  bdt,
  hospitalApplications,
  driverApplications,
  auditLog,
  settlements,
} from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard · MedLink Super Admin" },
      { name: "description", content: "Executive overview of MedLink platform growth, usage and revenue." },
      { property: "og:title", content: "MedLink Admin Dashboard" },
      { property: "og:description", content: "Platform-wide KPIs, revenue and pending approvals." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const pending = hospitalApplications.length + driverApplications.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Platform overview"
        title="Good morning, Alex."
        subtitle="Platform is healthy · 99.98% uptime this month · 6 approvals waiting."
        action={
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-primary-foreground shadow-card transition hover:opacity-90"
          >
            <ShieldCheck className="size-4" /> Review {pending} applications
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total general users" value={totals.users.toLocaleString()} sub="+8.3% vs last month" icon={Users} tone="primary" />
        <Kpi label="Ambulance drivers" value={totals.drivers.toString()} sub="+27 this month" icon={Truck} tone="info" />
        <Kpi label="Hospitals" value={totals.hospitals.toString()} sub="2 pending verification" icon={Building2} tone="info" />
        <Kpi label="Emergency SOS cases" value={totals.sos.toLocaleString()} sub="Lifetime billable cases" icon={Siren} tone="warning" />
        <Kpi label="Blood donation requests" value={totals.blood.toLocaleString()} sub="+18% vs last month" icon={Droplet} tone="warning" />
        <Kpi label="Hospital reservations" value={totals.reservations.toLocaleString()} sub="+11.4% vs last month" icon={CalendarCheck} tone="neutral" />
        <Kpi label="Total revenue generated" value={bdt(totalRevenue)} sub="৳1,000 service fee per SOS" icon={Wallet} tone="success" />
        <Kpi label="Pending settlements" value={bdt(totalOutstanding)} sub="Across 4 hospitals" icon={Hourglass} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Revenue trend"
          subtitle="Service fee revenue over the last 6 months"
          action={
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-success">
              <ArrowUpRight className="size-3.5" /> +15.8%
            </span>
          }
        >
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={64} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => bdt(v)} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top hospitals by revenue" subtitle="Current billing cycle" bodyClassName="p-0">
          <ul className="divide-y divide-border/60">
            {[...settlements]
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((s) => (
                <li key={s.hospital} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-container text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{s.hospital}</p>
                    <p className="text-[11.5px] text-muted-foreground">{s.cases} SOS cases</p>
                  </div>
                  <p className="text-[13px] font-bold tabular-nums">{bdt(s.revenue)}</p>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Pending approvals"
          subtitle="Hospital and driver applications"
          action={
            <Link to="/admin/verification" className="text-[12px] font-semibold text-primary">
              Open verification center
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border/60">
            {hospitalApplications.slice(0, 2).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Building2 className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{a.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">Hospital · submitted {a.submitted}</p>
                </div>
                <StatusPill status="pending" />
              </li>
            ))}
            {driverApplications.slice(0, 2).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Truck className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{a.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">{a.reg} · {a.type}</p>
                </div>
                <StatusPill status="pending" />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent activity"
          subtitle="Latest audit events"
          action={
            <Link to="/admin/audit" className="text-[12px] font-semibold text-primary">
              View all logs
            </Link>
          }
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border/60">
            {auditLog.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{l.event}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{l.target}</p>
                </div>
                <p className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">{l.time}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
