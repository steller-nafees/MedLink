import { useEffect, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { AreaChart } from "@/shared/components/charts/AreaChart";
import { LineChart } from "@/shared/components/charts/LineChart";
import { BarChart } from "@/shared/components/charts/BarChart";
import { PieChart } from "@/shared/components/charts/PieChart";
import { bdt, pieColors } from "@/shared/components/charts/config";
import { platformService } from "@/services/platform.service";
import type { 
  UserGrowth, 
  MonthlyRevenue, 
  SosDaily, 
  ActivityTrend,
  RevenueByHospital,
  SettlementRate
} from "@/types/platform";

export function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    userGrowth: UserGrowth[];
    monthlyRevenue: MonthlyRevenue[];
    sosDaily: SosDaily[];
    activityTrend: ActivityTrend[];
    revenueByHospital: RevenueByHospital[];
    settlementRate: SettlementRate[];
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [
        ug,
        mr,
        sd,
        at,
        rbh,
        sr
      ] = await Promise.all([
        platformService.getUserGrowth(),
        platformService.getMonthlyRevenue(),
        platformService.getSosDaily(),
        platformService.getActivityTrend(),
        platformService.getRevenueByHospital(),
        platformService.getSettlementRate()
      ]);

      setData({
        userGrowth: ug,
        monthlyRevenue: mr,
        sosDaily: sd,
        activityTrend: at,
        revenueByHospital: rbh,
        settlementRate: sr,
      });
    }
    loadData();
  }, []);

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Platform analytics"
        subtitle="Growth, activity and revenue performance across the MedLink network"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="User growth" subtitle="General users on the platform">
          <AreaChart 
            data={data.userGrowth} 
            dataKey="users" 
            name="General users"
            xAxisKey="m"
            color="var(--color-primary)"
            yAxisWidth={52}
            yAxisFormatter={(v) => v.toString()}
            gradientId="ug"
          />
        </Card>

        <Card title="Provider growth" subtitle="Ambulance drivers and hospitals">
          <div className="h-64">
            <LineChart 
              data={data.userGrowth} 
              xAxisKey="m" 
              yAxisWidth={40}
              series={[
                { key: "drivers", name: "Drivers", color: "var(--color-info)" },
                { key: "hospitals", name: "Hospitals", color: "var(--color-success)" }
              ]}
            />
          </div>
        </Card>

        <Card title="Emergency SOS activity" subtitle="SOS requests per month">
          <div className="h-64">
            <BarChart 
              data={data.monthlyRevenue}
              xAxisKey="m"
              yAxisWidth={40}
              series={[
                { key: "cases", name: "SOS cases", color: "var(--color-emergency)", radius: [10, 10, 4, 4] }
              ]}
            />
          </div>
        </Card>

        <Card title="Daily SOS requests" subtitle="Last 30 days">
          <div className="h-64">
            <LineChart 
              data={data.sosDaily} 
              xAxisKey="d" 
              yAxisWidth={32}
              series={[
                { key: "sos", name: "SOS", color: "var(--color-warning)" }
              ]}
            />
          </div>
        </Card>
      </div>

      <Card title="Platform activity" subtitle="Reservations, blood donation requests and ambulance requests">
        <div className="h-72">
          <BarChart 
            data={data.activityTrend}
            xAxisKey="m"
            yAxisWidth={44}
            series={[
              { key: "reservations", name: "Reservations", color: "var(--color-primary)", radius: [8, 8, 2, 2] },
              { key: "ambulance", name: "Ambulance requests", color: "var(--color-info)", radius: [8, 8, 2, 2] },
              { key: "blood", name: "Blood requests", color: "var(--color-emergency)", radius: [8, 8, 2, 2] }
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Monthly revenue & growth" subtitle="Service fee revenue">
          <AreaChart 
            data={data.monthlyRevenue} 
            dataKey="revenue" 
            name="Revenue"
            xAxisKey="m"
            color="var(--color-success)"
            yAxisWidth={64}
            yAxisFormatter={(v) => `${v / 1000}k`}
            formatter={(v: number) => bdt(v)}
            gradientId="rv2"
          />
        </Card>

        <Card title="Revenue by hospital" subtitle="Share of total service fees">
          <div className="h-44">
            <PieChart 
              data={data.revenueByHospital}
              dataKey="value"
              formatter={(v: number) => bdt(v)}
            />
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px]">
            {data.revenueByHospital.map((r, i) => (
              <li key={r.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                <span className="flex-1 truncate font-medium">{r.name}</span>
                <span className="text-muted-foreground tabular-nums">{bdt(r.value)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Settlement completion rate" subtitle="Percentage of generated revenue settled per hospital">
        <div className="h-64">
          <BarChart 
            data={data.settlementRate}
            xAxisKey="name"
            yAxisWidth={40}
            yAxisFormatter={(v) => `${v}%`}
            yAxisDomain={[0, 100]}
            tooltipFormatter={(v: number) => `${v}%`}
            series={[
              { key: "rate", name: "Settled", color: "var(--color-secondary)", radius: [10, 10, 4, 4] }
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
