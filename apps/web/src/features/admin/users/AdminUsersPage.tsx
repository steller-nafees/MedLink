import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { Badge } from "@/shared/components/ui/Badge";
import { GhostButton } from "@/shared/components/ui/Button";
import { platformService } from "@/services/platform.service";
import type { PlatformUser, AccountStatus } from "@/types/platform";

const filters = ["all", "active", "pending", "suspended"] as const;

export function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [overrides, setOverrides] = useState<Record<string, AccountStatus>>({});
  const [users, setUsers] = useState<PlatformUser[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await platformService.getUsers();
      setUsers(data);
    }
    loadData();
  }, []);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users
      .map((u) => ({ ...u, status: overrides[u.id] ?? u.status }))
      .filter((u) => (filter === "all" ? true : u.status === filter))
      .filter((u) =>
        !needle
          ? true
          : [u.name, u.email, u.phone, u.id].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, overrides, users]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="User management"
        subtitle={`${users.length} general user accounts on the platform`}
      />

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email or phone…" />
        </div>

        <Table head={["User", "Email", "Phone", "Registered", "Status", ""]}>
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
              <Td><Badge status={u.status} /></Td>
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
        </Table>
      </Card>
    </div>
  );
}
