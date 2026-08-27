import {
  BarChart as RechartsBarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { chartAxis, tooltipStyle } from "./config";

export function BarChart({
  data,
  xAxisKey = "m",
  yAxisWidth = 40,
  yAxisFormatter,
  yAxisDomain,
  tooltipFormatter,
  series,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xAxisKey?: string;
  yAxisWidth?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yAxisFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yAxisDomain?: [any, any];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltipFormatter?: (value: any) => string;
  series: {
    key: string;
    name: string;
    color: string;
    radius?: [number, number, number, number];
  }[];
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <RechartsBarChart data={data}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xAxisKey} {...chartAxis} />
          <YAxis {...chartAxis} width={yAxisWidth} tickFormatter={yAxisFormatter} domain={yAxisDomain} />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={s.radius || [4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
