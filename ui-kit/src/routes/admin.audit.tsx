import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  PageHeader,
  Panel,
  SearchInput,
  DataTable,
  Td,
  Tr,
  TypeChip,
  EmptyRow,
} from "@/components/medlink/admin/admin-kit";
import { auditLog } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs · MedLink Super Admin" },
      { name: "description", content: "Searchable record of platform governance events on MedLink." },
      { property: "og:title", content: "MedLink Audit Logs" },
      { property: "og:description", content: "Registrations, approvals, suspensions and settlement events." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return auditLog.filter((l) =>
      !needle ? true : [l.event, l.actor, l.target, l.time].some((v) => v.toLowerCase().includes(needle))
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Audit logs"
        subtitle="Every governance action recorded across the platform"
        action={
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[12.5px] font-semibold transition hover:bg-surface-variant">
            <Download className="size-4" /> Export logs
          </button>
        }
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <p className="text-[12.5px] text-muted-foreground">{rows.length} events</p>
          <SearchInput value={q} onChange={setQ} placeholder="Search event, user or target…" />
        </div>

        <DataTable head={["Event type", "User", "Target", "Date & time"]}>
          {rows.length === 0 && <EmptyRow colSpan={4} label="No matching audit events." />}
          {rows.map((l) => (
            <Tr key={l.id}>
              <Td><TypeChip label={l.event} /></Td>
              <Td className="font-semibold">{l.actor}</Td>
              <Td className="text-muted-foreground">{l.target}</Td>
              <Td className="tabular-nums text-muted-foreground">{l.time}</Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
