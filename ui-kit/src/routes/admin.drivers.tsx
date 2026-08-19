import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Truck } from "lucide-react";
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterTabs,
  DataTable,
  Td,
  Tr,
  StatusPill,
  TypeChip,
  GhostButton,
  EmptyRow,
} from "@/components/medlink/admin/admin-kit";
import { driverAccounts, type AccountStatus } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/drivers")({
  head: () => ({
    meta: [
      { title: "Ambulance Drivers · MedLink Super Admin" },
      { name: "description", content: "Manage ambulance driver accounts, vehicles and approval status." },
      { property: "og:title", content: "MedLink Ambulance Driver Management" },
      { property: "og:description", content: "Vehicle registration, ambulance type and account status for drivers." },
    ],
  }),
  component: DriversPage,
});

const filters = ["all", "active", "pending", "suspended"] as const;

function DriversPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({});

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return driverAccounts
      .map((d) => ({ ...d, status: overrides[d.id] ?? d.status }))
      .filter((d) => (filter === "all" ? true : d.status === filter))
      .filter((d) =>
        !needle ? true : [d.name, d.reg, d.provider, d.phone, d.type].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, overrides]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Providers"
        title="Ambulance drivers"
        subtitle={`${driverAccounts.length} driver accounts · ${driverAccounts.filter((d) => d.status === "pending").length} awaiting approval`}
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search driver, plate or provider…" />
        </div>

        <DataTable head={["Driver", "Phone", "Vehicle registration", "Ambulance type", "Status", ""]}>
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
              <Td><StatusPill status={d.status} /></Td>
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
        </DataTable>
      </Panel>
    </div>
  );
}
