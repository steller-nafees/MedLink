import { useMemo, useState, useEffect } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { TypeChip } from "@/shared/components/ui/Badge";
import { platformService } from "@/services/platform.service";
import type { AuditEvent } from "@/types/platform";

export function AdminAuditPage() {
  const [q, setQ] = useState("");
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await platformService.getAuditLog();
      setAuditLog(data);
    }
    loadData();
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return auditLog.filter((l) =>
      !needle ? true : [l.event, l.actor, l.target, l.time].some((v) => v.toLowerCase().includes(needle))
    );
  }, [q, auditLog]);

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

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <p className="text-[12.5px] text-muted-foreground">{rows.length} events</p>
          <SearchInput value={q} onChange={setQ} placeholder="Search event, user or target…" />
        </div>

        <Table head={["Event type", "User", "Target", "Date & time"]}>
          {rows.length === 0 && <EmptyRow colSpan={4} label="No matching audit events." />}
          {rows.map((l) => (
            <Tr key={l.id}>
              <Td><TypeChip label={l.event} /></Td>
              <Td className="font-semibold">{l.actor}</Td>
              <Td className="text-muted-foreground">{l.target}</Td>
              <Td className="tabular-nums text-muted-foreground">{l.time}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
