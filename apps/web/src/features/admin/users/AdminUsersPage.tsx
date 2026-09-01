import { useEffect, useMemo, useState } from "react";
import { Siren, User, Building2, AlertCircle, Shield } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { Badge } from "@/shared/components/ui/Badge";
import type { PlatformUser } from "@/types/platform";
import { platformService } from "@/services/platform.service";

// types/platform.ts should have:
// export type UserRole = "general_user" | "ambulance_driver" | "hospital_admin";
// interface PlatformUser { ...; role: UserRole }
type UserRole = "customer" | "ambulance_driver" | "hospital_admin" | "super_admin";

const statusFilters = ["all", "active", "pending", "suspended"] as const;
const roleFilters = ["all", "customer", "ambulance_driver", "hospital_admin", "super_admin"] as const;

const PAGE_SIZE = 10;

const ROLE_META: Record<UserRole, { label: string; icon: typeof User; chip: string }> = {
  customer: { label: "Customer", icon: User, chip: "bg-[#EAF3FF] text-[#2E5D9F] ring-1 ring-inset ring-[#CFE1FF]" },
  ambulance_driver: { label: "Ambulance Driver", icon: Siren, chip: "bg-[#FEECEC] text-[#D35A5A] ring-1 ring-inset ring-[#F4C6C6]" },
  hospital_admin: { label: "Hospital Admin", icon: Building2, chip: "bg-[#16A89C]/10 text-[#0F7A70] ring-1 ring-inset ring-[#16A89C]/25" },
  super_admin: { label: "Super Admin", icon: Shield, chip: "bg-[#F3E8FF] text-[#7E22CE] ring-1 ring-inset ring-[#E9D5FF]" }
};



function RolePill({ role }: { role: UserRole | undefined }) {
  const meta = ROLE_META[role as UserRole] || ROLE_META.customer;
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex min-w-[112px] flex-col items-center justify-center rounded-xl px-2 py-2 text-center",
        meta.chip,
      ].join(" ")}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-medium">
        <Icon className="size-3" />
        {meta.label.split(" ")[0]}
      </span>
      <span className="mt-0.5 text-[10px] font-medium opacity-80">{meta.label.split(" ").slice(1).join(" ") || "User"}</span>
    </span>
  );
}

function RowSkeleton() {
  return (
    <Tr>
      <Td colSpan={7}>
        <div className="flex items-center gap-3 py-1">
          <div className="size-9 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </Td>
    </Tr>
  );
}

export function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("all");
  const [role, setRole] = useState<(typeof roleFilters)[number]>("all");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const backendUsers = await platformService.getUsers();
        if (!cancelled) setUsers(backendUsers);
      } catch {
        if (!cancelled) setError("Couldn't load users. Try refreshing.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, status, role]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users
      .filter((u) => (status === "all" ? true : u.status === status))
      .filter((u) => (role === "all" ? true : u.role === role))
      .filter((u) =>
        !needle
          ? true
          : [u.name, u.email, u.phone, u.id].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, status, role, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Accounts"
        title="User management"
        subtitle={`${users.length} accounts across all roles`}
      />

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterTabs options={statusFilters} value={status} onChange={setStatus} />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as (typeof roleFilters)[number])}
              className="h-9 rounded-lg border border-border/60 bg-background px-3 text-[13px] font-medium text-foreground outline-none transition-colors focus:border-[#16A89C] focus:ring-1 focus:ring-[#16A89C]/40"
            >
              {roleFilters.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? "All roles" : ROLE_META[r as UserRole].label}
                </option>
              ))}
            </select>
          </div>

          <SearchInput value={q} onChange={setQ} placeholder="Search name, email or phone…" />
        </div>

        <Table head={["User", "Role", "Email", "Phone", "Registered", "Status", ""]}>
          {isLoading && Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}

          {!isLoading && error && (
            <Tr>
              <Td colSpan={7}>
                <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              </Td>
            </Tr>
          )}

          {!isLoading && !error && rows.length === 0 && (
            <EmptyRow colSpan={7} label="No users match your search." />
          )}

          {!isLoading &&
            !error &&
            rows.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-[#d8f6f3] text-[12px] font-bold text-[#0F7A70]">
                      {u.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold leading-tight text-foreground">{u.name}</p>
                      {u.subtitle && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{u.subtitle}</p>
                      )}
                    </div>
                  </div>
                </Td>
                <Td>
                  <RolePill role={u.role as UserRole} />
                </Td>
                <Td className="text-muted-foreground">{u.email}</Td>
                <Td className="tabular-nums text-muted-foreground">{u.phone}</Td>
                <Td className="tabular-nums text-muted-foreground">{u.registered}</Td>
                <Td>
                  <Badge status={u.status} />
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <button type="button" className="text-[12px] font-medium text-foreground transition hover:text-primary">
                      View details
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
        </Table>

        {!isLoading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-[12px] text-muted-foreground">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md px-2 py-1 font-medium text-foreground disabled:opacity-40 hover:bg-[#16A89C]/10"
              >
                Prev
              </button>
              <span className="px-1 tabular-nums">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md px-2 py-1 font-medium text-foreground disabled:opacity-40 hover:bg-[#16A89C]/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}