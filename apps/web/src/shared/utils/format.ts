export const bdt = (n: number) =>
  `৳${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
