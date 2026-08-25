import {
  LineChart as RechartsLineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { chartAxis, tooltipStyle } from "./config";

export function LineChart({
  data,
  xAxisKey = "m",
  yAxisWidth = 40,
  domain,
  yAxisFormatter,
  tooltipFormatter,
  series,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xAxisKey?: string;
  yAxisWidth?: number;
  domain?: [number, number] | [string, string];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yAxisFormatter?: (value: any) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltipFormatter?: (value: any) => any;
  series: {
    key: string;
    name: string;
    color: string;
  }[];
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <RechartsLineChart data={data}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xAxisKey} {...chartAxis} />
          <YAxis {...chartAxis} width={yAxisWidth} domain={domain} tickFormatter={yAxisFormatter} />
          <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
