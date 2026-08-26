import { useState, type ComponentType, type ReactNode } from "react";
import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dashboardLogo from "@/assets/images/Logos/medlink-dashboard-logo.png";
import compactLogo from "@/assets/images/Logos/medlink_without_tagline.png";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string;
  comingSoon?: boolean;
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

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function DashboardShell({
  role,
  nav,
  user,
  searchPlaceholder = "Search patients, beds, ambulances...",
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userInitials = initials(user.name);
  const visibleNav = collapsed ? nav.filter((item) => !item.comingSoon) : nav;

  return (
    <div className={`dashboard-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img className="dashboard-logo dashboard-logo-expanded" src={dashboardLogo} alt="MedLink" />
          <img className="dashboard-logo dashboard-logo-collapsed" src={compactLogo} alt="MedLink" />
          <button
            type="button"
            className="dashboard-collapse-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <MenuIcon className="dashboard-collapse-icon" />
          </button>
        </div>

        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              (item.to !== "/hospital" &&
                item.to !== "/admin" &&
                location.pathname.startsWith(item.to));

            if (item.comingSoon) {
              return (
                <div
                  key={item.to}
                  className="dashboard-nav-item disabled"
                  role="link"
                  aria-disabled="true"
                  tabIndex={-1}
                  title={collapsed ? `${item.label} (coming soon)` : undefined}
                >
                  <Icon className="dashboard-nav-icon" />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      <span className="dashboard-badge dashboard-badge-pill dashboard-badge-soon">
                        Soon
                      </span>
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`dashboard-nav-item${active ? " active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="dashboard-nav-icon" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge !== undefined && (
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

        <button type="button" className="dashboard-support-button">
          <HelpCircle className="dashboard-support-icon" aria-hidden="true" />
          {!collapsed && <span>Contact support</span>}
        </button>

        <div className="dashboard-user-card">
          <div className="dashboard-avatar gradient-primary">{userInitials}</div>
          {!collapsed && (
            <>
              <div className="dashboard-user-copy">
                <strong>{user.name}</strong>
                <span>{user.role}</span>
              </div>
              <ChevronDown className="dashboard-chevron" />
            </>
          )}
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
            <div className="dashboard-profile-menu">
              <button
                type="button"
                className="dashboard-profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((previous) => !previous)}
              >
                <div className="dashboard-avatar gradient-primary">{userInitials}</div>
                <span className="dashboard-profile-copy">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>
                <ChevronDown className="dashboard-profile-chevron" aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="dashboard-profile-dropdown" role="menu">
                  <button type="button" role="menuitem" onClick={() => navigate("/hospital/profile")}>
                    <User aria-hidden="true" />
                    Profile
                  </button>
                  <button type="button" role="menuitem" onClick={() => navigate("/hospital/settings")}>
                    <Settings aria-hidden="true" />
                    Settings
                  </button>
                  <button type="button" role="menuitem" onClick={() => navigate("/login")}>
                    <LogOut aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}