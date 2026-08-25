import { useMemo, useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { Badge, TypeChip } from "@/shared/components/ui/Badge";
import { GhostButton } from "@/shared/components/ui/Button";
import { platformService } from "@/services/platform.service";
import type { DriverAccount, AccountStatus } from "@/types/platform";

const filters = ["all", "active", "pending", "suspended"] as const;

export function AdminDriversPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({});
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await platformService.getDrivers();
      setDrivers(data);
    }
    loadData();
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return drivers
      .map((d) => ({ ...d, status: overrides[d.id] ?? d.status }))
      .filter((d) => (filter === "all" ? true : d.status === filter))
      .filter((d) =>
        !needle ? true : [d.name, d.reg, d.provider, d.phone, d.type].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, overrides, drivers]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Providers"
        title="Ambulance drivers"
        subtitle={`${drivers.length} driver accounts · ${drivers.filter((d) => d.status === "pending").length} awaiting approval`}
      />

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search driver, plate or provider…" />
        </div>

        <Table head={["Driver", "Phone", "Vehicle registration", "Ambulance type", "Status", ""]}>
          {rows.length === 0 && <EmptyRow colSpan={6} label="No drivers match your search." />}
          {rows.map((d) => (
            <Tr key={d.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-info/10 text-info">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.provider}</p>
                  </div>
                </div>
              </Td>
              <Td className="tabular-nums text-muted-foreground">{d.phone}</Td>
              <Td>
                <span className="inline-flex rounded-lg border border-border bg-surface-variant/70 px-2.5 py-1 text-[12.5px] font-bold tracking-wide">
                  {d.reg}
                </span>
              </Td>
              <Td><TypeChip label={d.type} /></Td>
              <Td><Badge status={d.status} /></Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <GhostButton>View profile</GhostButton>
                  {d.status !== "active" && (
                    <GhostButton tone="success" onClick={() => setOverrides((o) => ({ ...o, [d.id]: "active" }))}>
                      Approve
                    </GhostButton>
                  )}
                  {d.status !== "suspended" && (
                    <GhostButton tone="danger" onClick={() => setOverrides((o) => ({ ...o, [d.id]: "suspended" }))}>
                      Suspend
                    </GhostButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
