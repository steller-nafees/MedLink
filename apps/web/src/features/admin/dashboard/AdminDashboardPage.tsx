import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { AreaChart } from "@/shared/components/charts/AreaChart";
import { platformService } from "@/services/platform.service";
import { bdt } from "@/shared/utils/format";
import type { Totals, MonthlyRevenue, Settlement, HospitalApplication, DriverApplication, AuditEvent } from "@/types/platform";

export function AdminDashboardPage() {
  const [data, setData] = useState<{
    totals: Totals | null;
    revenueStats: { totalRevenue: number; totalOutstanding: number } | null;
    monthlyRevenue: MonthlyRevenue[];
    settlements: Settlement[];
    hospitalApps: HospitalApplication[];
    driverApps: DriverApplication[];
    auditLog: AuditEvent[];
  }>({
    totals: null,
    revenueStats: null,
    monthlyRevenue: [],
    settlements: [],
    hospitalApps: [],
    driverApps: [],
    auditLog: [],
  });

  useEffect(() => {
    async function loadData() {
      const [
        totals,
        revenueStats,
        monthlyRevenue,
        settlements,
        hospitalApps,
        driverApps,
        auditLog,
      ] = await Promise.all([
        platformService.getTotals(),
        platformService.getOverallRevenueStats(),
        platformService.getMonthlyRevenue(),
        platformService.getSettlements(),
        platformService.getHospitalApplications(),
        platformService.getDriverApplications(),
        platformService.getAuditLog(),
      ]);

      setData({
        totals,
        revenueStats,
        monthlyRevenue,
        settlements,
        hospitalApps,
        driverApps,
        auditLog,
      });
    }
    loadData();
  }, []);

  if (!data.totals || !data.revenueStats) return null; // or loading state

  const pending = data.hospitalApps.length + data.driverApps.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Platform overview"
        title="Good morning, Alex."
        subtitle={`Platform is healthy · 99.98% uptime this month · ${pending} approvals waiting.`}
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
        <StatCard label="Total general users" value={data.totals.users.toLocaleString()} sub="+8.3% vs last month" icon={Users} tone="primary" />
        <StatCard label="Ambulance drivers" value={data.totals.drivers.toString()} sub="+27 this month" icon={Truck} tone="info" />
        <StatCard label="Hospitals" value={data.totals.hospitals.toString()} sub="2 pending verification" icon={Building2} tone="info" />
        <StatCard label="Emergency SOS cases" value={data.totals.sos.toLocaleString()} sub="Lifetime billable cases" icon={Siren} tone="warning" />
        <StatCard label="Blood donation requests" value={data.totals.blood.toLocaleString()} sub="+18% vs last month" icon={Droplet} tone="warning" />
        <StatCard label="Hospital reservations" value={data.totals.reservations.toLocaleString()} sub="+11.4% vs last month" icon={CalendarCheck} tone="neutral" />
        <StatCard label="Total revenue generated" value={bdt(data.revenueStats.totalRevenue)} sub="৳1,000 service fee per SOS" icon={Wallet} tone="success" />
        <StatCard label="Pending settlements" value={bdt(data.revenueStats.totalOutstanding)} sub="Across 4 hospitals" icon={Hourglass} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Revenue trend"
          subtitle="Service fee revenue over the last 6 months"
          action={
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-success">
              <ArrowUpRight className="size-3.5" /> +15.8%
            </span>
          }
        >
          <AreaChart data={data.monthlyRevenue} dataKey="revenue" formatter={(v: number) => bdt(v)} />
        </Card>

        <Card title="Top hospitals by revenue" subtitle="Current billing cycle" bodyClassName="p-0">
          <ul className="divide-y divide-border/60">
            {[...data.settlements]
              .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
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
                  <p className="text-[13px] font-bold tabular-nums">{bdt(s.revenue ?? 0)}</p>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
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
            {data.hospitalApps.slice(0, 2).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Building2 className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{a.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">Hospital · submitted {a.submitted}</p>
                </div>
                <Badge status="pending" />
              </li>
            ))}
            {data.driverApps.slice(0, 2).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <Truck className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{a.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">{a.reg} · {a.type}</p>
                </div>
                <Badge status="pending" />
              </li>
            ))}
          </ul>
        </Card>

        <Card
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
            {data.auditLog.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{l.event}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{l.target}</p>
                </div>
                <p className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">{l.time}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
