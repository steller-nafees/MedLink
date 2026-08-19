import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";
import dashboardLogo from "@/assets/medlink-dashboard-logo.png";
import { Bell, Search, ChevronDown } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string;
};

export function WebShell({
  role,
  nav,
  children,
  user,
  searchPlaceholder = "Search patients, beds, ambulances…",
}: {
  role: string;
  nav: NavItem[];
  children: ReactNode;
  user: { name: string; role: string; avatar?: string };
  searchPlaceholder?: string;
}) {
  const navigate = useNavigate();
  const path = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-border/70 bg-sidebar p-4 lg:flex">
        <div className="flex items-center justify-between px-2">
          <img
            src={dashboardLogo}
            alt="MedLink"
            className="h-20 w-auto object-contain"
            draggable={false}
          />
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-0.5">
          {nav.map((n) => {
            const Icon = n.icon;

            const active =
              path === n.to ||
              (n.to !== "/hospital" &&
                n.to !== "/admin" &&
                path.startsWith(n.to));

            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition",
                  active
                    ? "bg-primary-container text-primary"
                    : "text-muted-foreground hover:bg-surface-variant hover:text-foreground"
                )}
              >
                <Icon className="size-[18px]" />

                <span className="flex-1">{n.label}</span>

                {/* Badge */}
                {n.badge !== undefined && (
  <span
    className={
      typeof n.badge === "string"
        ? "ml-auto rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary"
        : "ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
    }
  >
    {n.badge}
  </span>
)}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-border/70 bg-surface p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
              {user.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">
                {user.name}
              </div>

              <div className="truncate text-[11px] text-muted-foreground">
                {user.role}
              </div>
            </div>

            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 glass">
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full rounded-full border border-border/70 bg-surface/80 py-2 pl-9 pr-4 text-[13px] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-surface"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Open notifications"
                onClick={() => navigate({ to: "/admin/notifications" })}
                className="grid size-10 place-items-center rounded-full border border-border/70 bg-surface text-muted-foreground transition hover:text-foreground"
              >
                <Bell className="size-4" />
              </button>

              <div className="grid size-10 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                {user.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
