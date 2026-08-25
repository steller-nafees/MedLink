import type { ReactNode } from "react";

export function Table({
  head,
  children,
}: {
  head: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border/70 bg-surface-variant/50 text-[10.5px] uppercase tracking-widest text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <td className={`px-5 py-3.5 align-middle ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-border/50 transition last:border-0 hover:bg-surface-variant/40">
      {children}
    </tr>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[13px] text-muted-foreground"
      >
        {label}
      </td>
    </tr>
  );
}
