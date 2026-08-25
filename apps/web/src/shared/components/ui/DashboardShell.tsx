import type { ComponentType, ReactNode } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string;
};

type DashboardShellProps = {
  role: string;
  nav: NavItem[];
  user: { name: string; role: string };
  searchPlaceholder?: string;
  children: ReactNode;
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function DashboardShell({
  role,
  nav,
  user,
  searchPlaceholder = "Search patients, beds, ambulances...",
  children,
}: DashboardShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const userInitials = initials(user.name);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">M</div>
          <div>
            <strong>MedLink</strong>
            <span>{role}</span>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              (item.to !== "/hospital" &&
                item.to !== "/admin" &&
                location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`dashboard-nav-item${active ? " active" : ""}`}
              >
                <Icon className="dashboard-nav-icon" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={
                      typeof item.badge === "string"
                        ? "dashboard-badge dashboard-badge-pill"
                        : "dashboard-badge dashboard-badge-number"
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="dashboard-user-card">
          <div className="dashboard-avatar gradient-primary">{userInitials}</div>
          <div className="dashboard-user-copy">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <ChevronDown className="dashboard-chevron" />
        </div>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header glass">
          <div className="dashboard-search">
            <Search aria-hidden="true" />
            <input type="search" placeholder={searchPlaceholder} />
          </div>
          <div className="dashboard-header-actions">
            <button
              type="button"
              aria-label="Open notifications"
              onClick={() => navigate("/hospital/notifications")}
              className="dashboard-notification-button"
            >
              <Bell aria-hidden="true" />
            </button>
            <div className="dashboard-avatar gradient-primary">{userInitials}</div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}