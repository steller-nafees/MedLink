import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Panel,
  PageHeader,
  chartAxis,
  tooltipStyle,
} from "@/components/medlink/admin/admin-kit";
import {
  userGrowth,
  monthlyRevenue,
  sosDaily,
  activityTrend,
  settlements,
  bdt,
} from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Platform Analytics · MedLink Super Admin" },
      { name: "description", content: "Growth, activity and revenue analytics for the MedLink platform." },
      { property: "og:title", content: "MedLink Platform Analytics" },
      { property: "og:description", content: "Executive-level charts for growth, SOS activity and revenue." },
    ],
  }),
  component: Analytics,
});

const pieColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-warning)",
  "var(--color-success)",
];

function Analytics() {
  const revenueByHospital = settlements.map((s) => ({ name: s.hospital, value: s.revenue }));
  const settlementRate = settlements.map((s) => ({
    name: s.hospital.split(" ")[0],
    rate: Math.round((s.settled / s.revenue) * 100),
  }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Platform analytics"
        subtitle="Growth, activity and revenue performance across the MedLink network"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="User growth" subtitle="General users on the platform">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="ug" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={52} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="users" name="General users" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#ug)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Provider growth" subtitle="Ambulance drivers and hospitals">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={userGrowth}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="drivers" name="Drivers" stroke="var(--color-info)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="hospitals" name="Hospitals" stroke="var(--color-success)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Emergency SOS activity" subtitle="SOS requests per month">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cases" name="SOS cases" radius={[10, 10, 4, 4]} fill="var(--color-emergency)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Daily SOS requests" subtitle="Last 30 days">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={sosDaily}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="d" {...chartAxis} />
                <YAxis {...chartAxis} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="sos" name="SOS" stroke="var(--color-warning)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Platform activity" subtitle="Reservations, blood donation requests and ambulance requests">
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={activityTrend}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="m" {...chartAxis} />
              <YAxis {...chartAxis} width={44} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="reservations" name="Reservations" radius={[8, 8, 2, 2]} fill="var(--color-primary)" />
              <Bar dataKey="ambulance" name="Ambulance requests" radius={[8, 8, 2, 2]} fill="var(--color-info)" />
              <Bar dataKey="blood" name="Blood requests" radius={[8, 8, 2, 2]} fill="var(--color-emergency)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Monthly revenue & growth" subtitle="Service fee revenue">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rv2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" {...chartAxis} />
                <YAxis {...chartAxis} width={64} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => bdt(v)} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-success)" strokeWidth={2.5} fill="url(#rv2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Revenue by hospital" subtitle="Share of total service fees">
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={revenueByHospital} innerRadius={42} outerRadius={72} dataKey="value" paddingAngle={4}>
                  {revenueByHospital.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => bdt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px]">
            {revenueByHospital.map((r, i) => (
              <li key={r.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                <span className="flex-1 truncate font-medium">{r.name}</span>
                <span className="text-muted-foreground tabular-nums">{bdt(r.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Settlement completion rate" subtitle="Percentage of generated revenue settled per hospital">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={settlementRate}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="name" {...chartAxis} />
              <YAxis {...chartAxis} width={40} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="rate" name="Settled" radius={[10, 10, 4, 4]} fill="var(--color-secondary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
