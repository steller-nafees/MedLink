import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarCheck2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { PieChart } from "@/shared/components/charts/PieChart";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { platformService } from "@/services/platform.service";
import type { RecentLoginUser, Totals } from "@/types/platform";

const roleColors = ["#4a90e2", "#e76f6f", "#16a89c"];
const roleFilterOptions = ["All", "General Users", "Hospital", "Ambulance Drivers"] as const;
type RoleFilter = (typeof roleFilterOptions)[number];

// Tie each role to the same hue used in the distribution chart, so the
// avatar tint and the chart legend read as the same visual language.
const roleTint: Record<string, { bg: string; fg: string }> = {
  "General Users": { bg: "#4a90e21a", fg: "#3574b8" },
  Hospital: { bg: "#e76f6f1a", fg: "#c94f4f" },
  "Ambulance Drivers": { bg: "#16a89c1a", fg: "#0f8378" },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function percentageChange(current = 0, previous = 0) {
  if (previous === 0) return current > 0 ? "new" : "0%";
  return `${current - previous >= 0 ? "+" : ""}${(((current - previous) / previous) * 100).toFixed(1)}%`;
}

export function AdminDashboardPage() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loggedInUsers, setLoggedInUsers] = useState<RecentLoginUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadData() {
      const [nextTotals, nextUsers] = await Promise.all([
        platformService.getTotals(),
        platformService.getRecentLogins(),
      ]);

      setTotals(nextTotals);
      setLoggedInUsers(nextUsers);
    }

    loadData();
  }, []);

  const distribution = useMemo(() => {
    if (!totals) return [];

    return [
      { name: "General Users", value: totals.users },
      { name: "Ambulance Drivers", value: totals.drivers },
      { name: "Hospitals", value: totals.hospitals },
    ];
  }, [totals]);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return loggedInUsers.filter((user) => {
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesSearch =
        normalized.length === 0 ||
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.role.toLowerCase().includes(normalized);

      return matchesRole && matchesSearch;
    });
  }, [loggedInUsers, roleFilter, search]);

  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  if (!totals) return null;

  const usersChange = percentageChange(totals.usersThisMonth, totals.usersLastMonth);
  const reservationsChange = percentageChange(totals.reservationsThisMonth, totals.reservationsLastMonth);

  return (
    <div className="admin-dashboard mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Platform overview"
        title="Good morning, Admin."
        subtitle="Operating status is stable across patients, providers, and care teams."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-foreground shadow-card">
            <ShieldCheck className="size-4 text-primary" />
            <span>{totals.hospitals} active care partners</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total general users" value={totals.users.toLocaleString()} sub={`${usersChange} vs last month`} icon={Users} tone="primary" />
        <StatCard label="Ambulance drivers" value={totals.drivers.toLocaleString()} sub={`+${(totals.driversThisMonth ?? 0).toLocaleString()} this month`} icon={Truck} tone="info" />
        <StatCard label="Hospitals" value={totals.hospitals.toLocaleString()} sub={`${(totals.pendingHospitals ?? 0).toLocaleString()} pending verification`} icon={Building2} tone="success" />
        <StatCard label="Reservations" value={totals.reservations.toLocaleString()} sub={`${reservationsChange} vs last month`} icon={CalendarCheck2} tone="neutral" />
      </div>

      <div className="grid gap-4">
        <Card
          title="User distribution"
          subtitle="Live platform membership by role"
          action={<span className="text-[11.5px] font-semibold text-muted-foreground">{totals.users + totals.drivers + totals.hospitals} total accounts</span>}
        >
          <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
            <div className="h-52 w-full md:h-60">
              <PieChart data={distribution} dataKey="value" formatter={(value: number) => `${value.toLocaleString()} accounts`} />
            </div>
            <ul className="space-y-3">
              {distribution.map((item, i) => {
                const percent = ((item.value / (totals.users + totals.drivers + totals.hospitals)) * 100).toFixed(1);
                return (
                  <li key={item.name} className="rounded-2xl border border-border/70 bg-surface-variant/40 p-3">
                    <div className="flex items-center gap-3">
                      <span className="size-3 rounded-full" style={{ background: roleColors[i % roleColors.length] }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] font-semibold text-foreground">{item.name}</span>
                          <span className="text-[12px] font-medium text-muted-foreground">{percent}%</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.value.toLocaleString()} users</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      {/* Recent logged-in users — Apple-style grouped list */}
      <Card
        title="Recent logged-in users"
        subtitle="Latest access activity across the platform"
        bodyClassName="p-0"
      >
        {/* Controls: search + segmented role filter, sharing one row and one visual weight */}
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-[260px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
          </div>

          <div
            role="tablist"
            aria-label="Filter by role"
            className="inline-flex w-full items-center gap-0.5 rounded-full bg-surface-variant/60 p-1 md:w-auto"
          >
            {roleFilterOptions.map((option) => {
              const active = roleFilter === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRoleFilter(option)}
                  className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors md:flex-none ${
                    active
                      ? "bg-surface text-foreground shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {paginatedUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <UserRound className="size-6 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No users match this search</p>
            <p className="text-xs text-muted-foreground">Try a different name, email, or role filter.</p>
          </div>
        ) : (
          <ul>
            {paginatedUsers.map((user) => {
              const tint = roleTint[user.role] ?? { bg: "#94a3b81a", fg: "#64748b" };
              return (
                <li
                  key={user.id}
                  className="flex items-center gap-3.5 border-b border-border/50 px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-variant/30"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold"
                    style={{ background: tint.bg, color: tint.fg }}
                    aria-hidden="true"
                  >
                    {getInitials(user.name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: tint.bg, color: tint.fg }}
                  >
                    {user.role}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
            <span className="text-[12px] text-muted-foreground">
              {rangeStart}–{rangeEnd} of {filteredUsers.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <span className="min-w-[3.5rem] text-center text-[12px] font-medium text-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}