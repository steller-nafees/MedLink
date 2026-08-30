import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarCheck2, Search, ShieldCheck, Truck, Users } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { Card } from "@/shared/components/ui/Card";
import { PieChart } from "@/shared/components/charts/PieChart";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { platformService } from "@/services/platform.service";
import type { RecentLoginUser, Totals } from "@/types/platform";

const roleColors = ["#4a90e2", "#e76f6f", "#16a89c"];
const roleFilterOptions = ["All", "General Users", "Hospital", "Ambulance Drivers"] as const;
type RoleFilter = (typeof roleFilterOptions)[number];

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

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 10));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  if (!totals) return null;

  return (
    <div className="admin-dashboard mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Platform overview"
        title="Good morning, Alex."
        subtitle="Operating status is stable across patients, providers, and care teams."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-foreground shadow-card">
            <ShieldCheck className="size-4 text-primary" />
            <span>{totals.hospitals} active care partners</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total general users" value={totals.users.toLocaleString()} sub="+8.3% vs last month" icon={Users} tone="primary" />
        <StatCard label="Ambulance drivers" value={totals.drivers.toLocaleString()} sub="+27 this month" icon={Truck} tone="info" />
        <StatCard label="Hospitals" value={totals.hospitals.toLocaleString()} sub="2 pending verification" icon={Building2} tone="success" />
        <StatCard label="Reservations" value={totals.reservations.toLocaleString()} sub="+11.4% vs last month" icon={CalendarCheck2} tone="neutral" />
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

      <Card
        title="Recent logged-in users"
        subtitle="Latest access activity across the platform"
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <div className="w-full md:max-w-[260px]">
              <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
            </div>
            <FilterTabs options={roleFilterOptions} value={roleFilter} onChange={setRoleFilter} />
          </div>
          <div className="text-[12px] font-medium text-muted-foreground">
            {filteredUsers.length} results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/70 bg-surface-variant/50 text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground">
                <th className="px-5 py-3 font-semibold">User name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-surface-variant/40">
                    <td className="px-5 py-3.5 font-medium text-foreground">{user.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-full bg-primary-container px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Search className="size-3.5" />
            <span>Page {currentPage} of {totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
