import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { hospitalRequests, type ServiceRequest } from "@/lib/medlink/data";
import { PageHead, Panel, Action, PaymentPill, StatusPill } from "@/components/medlink/hospital-kit";

export const Route = createFileRoute("/hospital/payments")({
  head: () => ({
    meta: [
      { title: "Payment Tracking · MedLink Hospital" },
      { name: "description", content: "Track hospital charges, MedLink service fees and settlement status." },
      { property: "og:title", content: "Payment Tracking · MedLink Hospital" },
      { property: "og:description", content: "Service fees owed to MedLink, per patient and service." },
    ],
  }),
  component: Payments,
});

function Payments() {
  const [collected, setCollected] = useState<string[]>([]);
  const rows = hospitalRequests
    .filter((r) => r.charge > 0)
    .map((r): ServiceRequest => (collected.includes(r.id) ? { ...r, payment: "collected" } : r));

  const pending = rows.filter((r) => r.payment === "unpaid" || r.payment === "pending");
  const owed = rows.filter((r) => r.payment !== "settled").reduce((s, r) => s + r.serviceFee, 0);
  const settled = rows.filter((r) => r.payment === "settled").reduce((s, r) => s + r.serviceFee, 0);

  const stats = [
    { label: "Fees pending", value: `$${pending.reduce((s, r) => s + r.serviceFee, 0).toFixed(2)}`, sub: `${pending.length} services` },
    { label: "Owed to MedLink", value: `$${owed.toFixed(2)}`, sub: "Current cycle" },
    { label: "Settled", value: `$${settled.toFixed(2)}`, sub: "This month" },
  ];

  return (
    <div>
      <PageHead title="Payment tracking" subtitle="MedLink service fees charged after successful service completion" />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border/60 bg-surface p-5 shadow-card">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-[28px] font-bold leading-none">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <Panel title="Service fee ledger" subtitle="Hospital charge vs. MedLink fee">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-border/50 text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Hospital charge</th>
                <th className="px-5 py-3 font-semibold">MedLink fee</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 text-[13px] last:border-0 transition hover:bg-surface-variant/40">
                  <td className="px-5 py-3.5 font-semibold">{r.title}<div className="text-[11.5px] font-normal text-muted-foreground">{r.department}</div></td>
                  <td className="px-5 py-3.5">{r.patient}</td>
                  <td className="px-5 py-3.5 font-semibold">${r.charge}</td>
                  <td className="px-5 py-3.5 font-semibold text-primary">${r.serviceFee}</td>
                  <td className="px-5 py-3.5"><StatusPill status={r.status} /></td>
                  <td className="px-5 py-3.5"><PaymentPill payment={r.payment} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {(r.payment === "unpaid" || r.payment === "pending") && (
                      <Action tone="primary" onClick={() => setCollected((c) => [...c, r.id])}>Mark collected</Action>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
