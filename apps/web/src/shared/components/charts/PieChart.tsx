import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { tooltipStyle, pieColors } from "./config";

export function PieChart({
  data,
  dataKey,
  nameKey = "name",
  formatter,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey: string;
  nameKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any) => string;
}) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={data}
            innerRadius={42}
            outerRadius={72}
            dataKey={dataKey}
            nameKey={nameKey}
            paddingAngle={4}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={formatter} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
