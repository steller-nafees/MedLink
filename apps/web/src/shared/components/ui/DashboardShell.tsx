import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, HelpCircle, LogOut, Search, Send, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dashboardLogo from "@/assets/images/Logos/medlink_dashboard_white.png";
import compactLogo from "@/assets/images/Logos/medlink_compact_white.png";

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
  onLogout?: () => void;
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
  onLogout,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userInitials = initials(user.name);
  const visibleNav = collapsed && !mobileNavOpen ? nav.filter((item) => !item.comingSoon) : nav;
  const showLabels = !collapsed || mobileNavOpen;

  useEffect(() => {
    setMobileNavOpen(false);
    setProfileOpen(false);
    setSupportOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div
      className={`dashboard-shell${collapsed ? " sidebar-collapsed" : ""}${mobileNavOpen ? " mobile-nav-open" : ""}`}
    >
      {mobileNavOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className="dashboard-sidebar" id="dashboard-sidebar">
        <div className="dashboard-brand">
          <button
            type="button"
            className="dashboard-logo-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => {
              if (window.matchMedia("(max-width: 1023px)").matches) {
                setMobileNavOpen(false);
                return;
              }
              setCollapsed((prev) => !prev);
            }}
          >
            <img className="dashboard-logo dashboard-logo-expanded" src={dashboardLogo} alt="MedLink" />
            <img className="dashboard-logo dashboard-logo-collapsed" src={compactLogo} alt="MedLink" />
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
                  title={showLabels ? undefined : `${item.label} (coming soon)`}
                >
                  <Icon className="dashboard-nav-icon" />
                  {showLabels && (
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
                title={showLabels ? undefined : item.label}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon className="dashboard-nav-icon" />
                {showLabels && <span>{item.label}</span>}
                {showLabels && item.badge !== undefined && (
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

        <button type="button" className="dashboard-support-button" onClick={() => setSupportOpen(true)}>
          <HelpCircle className="dashboard-support-icon" aria-hidden="true" />
          {showLabels && <span>Contact support</span>}
        </button>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header glass">
          <button
            type="button"
            className="dashboard-menu-toggle"
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dashboard-search">
            <Search aria-hidden="true" />
            <input type="search" placeholder={searchPlaceholder} />
          </div>
          <div className="dashboard-header-actions">
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
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onLogout?.();
                      navigate("/?auth=true");
                    }}
                  >
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

      {supportOpen && (
        <div className="request-modal-backdrop" onClick={() => setSupportOpen(false)}>
          <div className="request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="request-modal-header">
              <div>
                <div className="request-modal-kind">Support <span>Contact Us</span></div>
              </div>
              <button
                type="button"
                className="request-modal-close"
                onClick={() => setSupportOpen(false)}
                aria-label="Close support"
              >
                <X />
              </button>
            </div>
            <div className="request-modal-body">
              <div className="request-info-card">
                <div className="request-info-title">
                  <Send className="size-4" />
                  <h3>Get in touch</h3>
                </div>
                <div className="request-info-content">
                  <p style={{ marginBottom: "16px", lineHeight: "1.6" }}>
                    Have questions or need assistance? Our support team is here to help you. Reach out to us via email and we'll get back to you as soon as possible.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <a
                      href="mailto:support@medlink.com"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "999px",
                        background: "color-mix(in srgb, var(--hospital-primary) 10%, transparent)",
                        color: "var(--hospital-primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      <Send className="size-4" />
                      support@medlink.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
