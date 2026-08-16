import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterTabs,
  DataTable,
  Td,
  Tr,
  StatusPill,
  GhostButton,
  EmptyRow,
} from "@/components/medlink/admin/admin-kit";
import { platformUsers, type AccountStatus } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management · MedLink Super Admin" },
      { name: "description", content: "Search, review and manage MedLink general user accounts." },
      { property: "og:title", content: "MedLink User Management" },
      { property: "og:description", content: "Manage general user accounts across the MedLink platform." },
    ],
  }),
  component: UsersPage,
});

const filters = ["all", "active", "pending", "suspended"] as const;

function UsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({});

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return platformUsers
      .map((u) => ({ ...u, status: overrides[u.id] ?? u.status }))
      .filter((u) => (filter === "all" ? true : u.status === filter))
      .filter((u) =>
        !needle
          ? true
          : [u.name, u.email, u.phone, u.id].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, overrides]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="User management"
        subtitle={`${platformUsers.length} general user accounts on the platform`}
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email or phone…" />
        </div>

        <DataTable head={["User", "Email", "Phone", "Registered", "Status", ""]}>
          {rows.length === 0 && <EmptyRow colSpan={6} label="No users match your search." />}
          {rows.map((u) => (
            <Tr key={u.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-primary-container text-[12px] font-bold text-primary">
                    {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-[11px] text-muted-foreground">{u.id}</p>
                  </div>
                </div>
              </Td>
              <Td className="text-muted-foreground">{u.email}</Td>
              <Td className="tabular-nums text-muted-foreground">{u.phone}</Td>
              <Td className="tabular-nums text-muted-foreground">{u.registered}</Td>
              <Td><StatusPill status={u.status} /></Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <GhostButton>View profile</GhostButton>
                  {u.status === "suspended" ? (
                    <GhostButton tone="success" onClick={() => setOverrides((o) => ({ ...o, [u.id]: "active" }))}>
                      Activate
                    </GhostButton>
                  ) : (
                    <GhostButton tone="danger" onClick={() => setOverrides((o) => ({ ...o, [u.id]: "suspended" }))}>
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
