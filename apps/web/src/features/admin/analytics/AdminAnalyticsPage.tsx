import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, Building2, CalendarCheck2, ServerCog, Loader2, Truck, Users } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { StatCard } from "@/shared/components/ui/StatCard";
import { AreaChart } from "@/shared/components/charts/AreaChart";
import { BarChart } from "@/shared/components/charts/BarChart";
import { PieChart } from "@/shared/components/charts/PieChart";
import { platformService } from "@/services/platform.service";
import type { AnalyticsSnapshot } from "@/types/platform";

const formatNumber = (value: number) => value.toLocaleString("en-US");

function EmptyChart({ message }: { message: string }) {
  return <div className="grid h-full min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-surface-variant/30 px-6 text-center text-sm text-muted-foreground">{message}</div>;
}

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    setError(null);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      setData(await platformService.getAnalyticsSnapshot());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Analytics could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading && !data) {
    return <div className="mx-auto max-w-[1400px] space-y-6" aria-busy="true"><div className="h-28 animate-pulse rounded-3xl bg-surface-variant/60" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-3xl bg-surface-variant/60" />)}</div><div className="h-96 animate-pulse rounded-3xl bg-surface-variant/60" /></div>;
  }

  if (error && !data) {
    return <div className="mx-auto max-w-[1400px]"><Card title="Analytics unavailable" subtitle={error}><button type="button" onClick={() => void loadData(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"><Loader2 className="size-4" />Try again</button></Card></div>;
  }

  if (!data) return null;

  const { totals } = data;
  const accountComposition = [{ name: "Users", value: totals.users }, { name: "Providers", value: totals.drivers }, { name: "Hospitals", value: totals.hospitals }];
  const totalAccounts = accountComposition.reduce((sum, item) => sum + item.value, 0);
  const registrationTotal = data.registrations.reduce((sum, item) => sum + item.users + item.providers + item.hospitals, 0);
  const emergencyTotal = data.emergencyEvents.reduce((sum, item) => sum + item.sos, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-8">
      <PageHeader eyebrow="Platform analytics" title="Network performance" subtitle="A live view of MedLink accounts, registrations, and emergency activity." actions={<div className="flex items-center gap-3"><span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:inline-flex"><span className="size-2 rounded-full bg-success" />Live data</span><button type="button" onClick={() => void loadData(true)} disabled={refreshing} aria-label="Refresh analytics" title="Refresh analytics" className="grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground shadow-card transition hover:border-primary hover:text-primary disabled:cursor-wait disabled:opacity-60"><Loader2 className={`size-4 ${refreshing ? "animate-spin" : ""}`} /></button></div>} />

      {error && <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground"><AlertCircle className="size-4 shrink-0 text-warning" /><span className="flex-1">Refresh incomplete. Showing the last successful snapshot.</span><button type="button" onClick={() => void loadData(true)} className="font-semibold text-primary">Retry</button></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="General users" value={formatNumber(totals.users)} sub={`${formatNumber(totals.usersThisMonth ?? 0)} joined this month`} icon={Users} tone="primary" />
        <StatCard label="Ambulance providers" value={formatNumber(totals.drivers)} sub={`${formatNumber(totals.driversThisMonth ?? 0)} joined this month`} icon={Truck} tone="info" />
        <StatCard label="Hospitals" value={formatNumber(totals.hospitals)} sub={`${formatNumber(totals.pendingHospitals ?? 0)} pending review`} icon={Building2} tone="success" />
        <StatCard label="Reservations" value={formatNumber(totals.reservations)} sub={`${formatNumber(totals.reservationsThisMonth ?? 0)} created this month`} icon={CalendarCheck2} tone="neutral" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <Card title="Registration activity" subtitle="New accounts and providers grouped by month" action={<span className="text-xs font-semibold text-muted-foreground">{formatNumber(registrationTotal)} records</span>}>
          <div className="h-72 sm:h-80">{data.registrations.length > 0 ? <BarChart data={data.registrations} xAxisKey="m" yAxisWidth={36} series={[{ key: "users", name: "Users", color: "var(--color-primary)" }, { key: "providers", name: "Providers", color: "var(--color-info)" }, { key: "hospitals", name: "Hospitals", color: "var(--color-success)" }]} /> : <EmptyChart message="No registration records are available." />}</div>
        </Card>

        <Card title="Account composition" subtitle="Current platform distribution" action={<ServerCog className="size-4 text-muted-foreground" />}>
          <div className="h-56">{totalAccounts > 0 ? <PieChart data={accountComposition} dataKey="value" formatter={(value: number) => `${formatNumber(value)} accounts`} /> : <EmptyChart message="No account totals are available." />}</div>
          <div className="mt-4 space-y-3">{accountComposition.map((item, index) => <div key={item.name} className="flex items-center gap-3 text-sm"><span className={`size-2.5 rounded-full ${["bg-chart-1", "bg-chart-2", "bg-chart-3"][index]}`} /><span className="flex-1 font-medium text-foreground">{item.name}</span><span className="tabular-nums text-muted-foreground">{formatNumber(item.value)}</span></div>)}</div>
        </Card>
      </div>

      <Card title="Emergency medical events" subtitle="Returned events marked as emergency by the current events endpoint" action={<span className="text-xs font-semibold text-muted-foreground">{formatNumber(emergencyTotal)} events</span>}>
        <div className="h-72 sm:h-80">{data.emergencyEvents.length > 0 ? <AreaChart data={data.emergencyEvents} dataKey="sos" xAxisKey="d" name="Emergency events" color="var(--color-emergency)" yAxisWidth={36} yAxisFormatter={(value) => value.toString()} formatter={(value: number) => `${formatNumber(value)} events`} gradientId="emergency-events" /> : <EmptyChart message="No emergency events were returned." />}</div>
      </Card>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground shadow-card"><Activity className="mt-0.5 size-4 shrink-0 text-primary" /><p>Registration charts use records returned by the admin list endpoints. Emergency activity uses available pages from the events endpoint and may represent partial history when more than 1,000 events exist.{data.emergencyHistoryIsPartial && " The current event history is capped at the available retrieval limit."}</p></div>
    </div>
  );
}
