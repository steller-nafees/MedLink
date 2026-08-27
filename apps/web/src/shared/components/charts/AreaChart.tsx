import {
  AreaChart as RechartsAreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { chartAxis, tooltipStyle } from "./config";

export function AreaChart({
  data,
  dataKey,
  formatter,
  xAxisKey = "m",
  color = "var(--color-primary)",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yAxisFormatter = (v: any) => `${v / 1000}k`,
  yAxisWidth = 64,
  gradientId = "rev",
  name
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any) => string;
  xAxisKey?: string;
  color?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yAxisFormatter?: (value: any) => string;
  yAxisWidth?: number;
  gradientId?: string;
  name?: string;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xAxisKey} {...chartAxis} />
          <YAxis {...chartAxis} width={yAxisWidth} tickFormatter={yAxisFormatter} />
          <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
          <Area type="monotone" dataKey={dataKey} name={name || dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
