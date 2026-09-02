import { useEffect, useMemo, useState } from "react";
import { Siren, User, Building2, Shield } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import type { PlatformUser } from "@/types/platform";
import { platformService } from "@/services/platform.service";

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

function UserRow({ user }: { user: PlatformUser }) {
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <div className="request-row">
      <div className="request-kind request-kind-consultation">
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>{initials}</span>
      </div>
      <div className="request-patient">
        <strong>{user.name}</strong>
        <span>{ROLE_META[user.role as UserRole]?.label || "User"} · {user.id}</span>
      </div>
      <div className="request-date" style={{ minWidth: "140px" }}>
        {user.email}<br /><span style={{ fontSize: "11px" }}>{user.phone}</span>
      </div>
      <div className="request-charge" style={{ minWidth: "120px" }}>
        <span>Registered </span><strong>{user.registered}</strong>
      </div>
      <div className="request-badges">
        <span className={`request-status request-status-${user.status}`}>{user.status}</span>
      </div>
      <div className="request-row-actions">
        <button type="button" className="request-action request-action-ghost">View</button>
      </div>
    </div>
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
        !needle ? true : [u.name, u.email, u.phone, u.id].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, status, role, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="hospital-requests">
      <PageHeader eyebrow="Accounts" title="User management" subtitle={`${users.length} accounts across all roles`} />

      {/* Status Filter Tabs */}
      <div className="request-tabs">
        {statusFilters.map((tab) => (
          <button
            key={tab}
            type="button"
            className={status === tab ? "active" : ""}
            onClick={() => setStatus(tab)}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Role Filter & Search */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof roleFilters)[number])}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid var(--hospital-border)",
            background: "var(--hospital-surface)",
            color: "var(--hospital-text)",
            fontSize: "12.5px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {roleFilters.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All roles" : ROLE_META[r as UserRole].label}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto" }}>
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email or phone…" />
        </div>
      </div>

      {/* Error Alert */}
      {error && <p role="alert" className="request-empty">{error}</p>}

      {/* Panel with Rows */}
      <section className="request-panel">
        <header>
          <div>
            <h2>Users</h2>
            <p>{isLoading ? "Loading..." : `${rows.length} shown`}</p>
          </div>
        </header>

        {isLoading && <p className="request-empty">Loading users...</p>}

        {!isLoading && rows.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}

        {!isLoading && rows.length === 0 && <p className="request-empty">No users match your search.</p>}
      </section>

      {/* Pagination */}
      {!isLoading && !error && filtered.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", fontSize: "12px", color: "var(--hospital-muted)", borderTop: "1px solid rgb(215 228 229 / 50%)" }}>
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="request-action request-action-ghost"
              style={{ opacity: page === 1 ? "0.4" : "1" }}
            >
              Prev
            </button>
            <span style={{ padding: "6px 8px", fontSize: "12px" }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="request-action request-action-ghost"
              style={{ opacity: page === totalPages ? "0.4" : "1" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}