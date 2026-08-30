export const chartAxis = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "var(--color-muted-foreground)", fontSize: 11 },
} as const;

export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(23,37,47,0.08)",
} as const;

export const pieColors = [
  "#4a90e2",
  "#e76f6f",
  "#16a89c",
];

export const bdt = (n: number) =>
  `৳${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
