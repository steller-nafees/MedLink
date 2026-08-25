import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Plus,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string;
  comingSoon?: boolean;
  /** Items sharing the same section render under one group heading, in the
   *  order the section first appears. Items with no section render first,
   *  ungrouped — mirrors "Dashboard / Activity / Playbooks" vs "Outreach"
   *  in the reference layout. */
  section?: string;
};

export type PinnedItem = {
  id: string;
  label: string;
  to: string;
  /** Any CSS color (hex/var/etc). Renders as the small colored square. */
  color: string;
};

type DashboardUser = {
  name: string;
  role: string;
  email?: string;
  avatarUrl?: string;
};

type DashboardShellProps = {
  role: string;
  nav: NavItem[];
  user: DashboardUser;
  searchPlaceholder?: string;
  children: ReactNode;
  /** TODO(Nafees): pass your full wordmark/logo here for the expanded rail. */
  logoExpanded?: ReactNode;
  /** TODO(Nafees): pass your icon-only/minimized logo here for the collapsed rail. */
  logoCollapsed?: ReactNode;
  /** Small line under the brand name in expanded state, e.g. a plan/tier label. */
  workspaceLabel?: string;
  /** Optional "Shared"-style pinned list with colored markers. Omit if unused. */
  pinned?: PinnedItem[];
  pinnedLabel?: string;
  onAddPinned?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onLogout?: () => void;
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

function groupNav(nav: NavItem[]) {
  const ungrouped: NavItem[] = [];
  const sections: { label: string; items: NavItem[] }[] = [];
  const sectionIndex = new Map<string, number>();

  for (const item of nav) {
    if (!item.section) {
      ungrouped.push(item);
      continue;
    }
    if (!sectionIndex.has(item.section)) {
      sectionIndex.set(item.section, sections.length);
      sections.push({ label: item.section, items: [] });
    }
    sections[sectionIndex.get(item.section)!].items.push(item);
  }

  return { ungrouped, sections };
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <div
        className="dashboard-nav-item disabled"
        role="link"
        aria-disabled="true"
        tabIndex={-1}
      >
        <Icon className="dashboard-nav-icon" />
        <span className="dashboard-nav-label">{item.label}</span>
        {!collapsed && (
          <span className="dashboard-badge dashboard-badge-pill dashboard-badge-soon">
            Soon
          </span>
        )}
        {collapsed && (
          <span className="dashboard-tooltip">{item.label} · Soon</span>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className={`dashboard-nav-item${active ? " active" : ""}`}
    >
      <Icon className="dashboard-nav-icon" />
      <span className="dashboard-nav-label">{item.label}</span>
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
      {collapsed && <span className="dashboard-tooltip">{item.label}</span>}
    </Link>
  );
}

export function DashboardShell({
  role,
  nav,
  user,
  searchPlaceholder = "Search patients, beds, ambulances...",
  children,
  logoExpanded,
  logoCollapsed,
  workspaceLabel,
  pinned,
  pinnedLabel = "Shared",
  onAddPinned,
  onOpenSettings,
  onOpenHelp,
  onLogout,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const userInitials = initials(user.name);
  const { ungrouped, sections } = groupNav(nav);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function isActive(to: string) {
    return (
      location.pathname === to ||
      (to !== "/hospital" && to !== "/admin" && location.pathname.startsWith(to))
    );
  }

  return (
    <div className={`dashboard-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <button
            type="button"
            className="dashboard-logo-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <span className="dashboard-logo dashboard-logo-expanded">
              {/* TODO(Nafees): swap for your full wordmark/logo asset */}
              {logoExpanded ?? "M"}
            </span>
            <span className="dashboard-logo dashboard-logo-collapsed">
              {/* TODO(Nafees): swap for your minimized/icon-only logo asset */}
              {logoCollapsed ?? "M"}
            </span>
          </button>
          <div className="dashboard-brand-copy">
            <strong>MedLink</strong>
            <span>{workspaceLabel ?? role}</span>
          </div>
          <ChevronDown className="dashboard-brand-chevron" />
        </div>

        <div className="dashboard-search">
          <Search aria-hidden="true" className="dashboard-search-icon" />
          <input type="search" placeholder={searchPlaceholder} />
        </div>

        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {ungrouped.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              active={isActive(item.to)}
            />
          ))}

          {sections.map((section) => (
            <div className="dashboard-nav-section" key={section.label}>
              <span className="dashboard-section-label">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  active={isActive(item.to)}
                />
              ))}
            </div>
          ))}

          {pinned && pinned.length > 0 && (
            <div className="dashboard-nav-section">
              <div className="dashboard-section-header">
                <span className="dashboard-section-label">{pinnedLabel}</span>
                {onAddPinned && (
                  <button
                    type="button"
                    className="dashboard-section-add"
                    aria-label={`Add to ${pinnedLabel}`}
                    onClick={onAddPinned}
                  >
                    <Plus className="dashboard-nav-icon" />
                  </button>
                )}
              </div>
              {pinned.map((item) => (
                <Link key={item.id} to={item.to} className="dashboard-nav-item">
                  <span
                    className="dashboard-pin-dot"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="dashboard-nav-label">{item.label}</span>
                  {collapsed && (
                    <span className="dashboard-tooltip">{item.label}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            className="dashboard-nav-item dashboard-footer-item"
            onClick={onOpenSettings}
          >
            <SettingsIcon className="dashboard-nav-icon" />
            <span className="dashboard-nav-label">Settings</span>
            {collapsed && <span className="dashboard-tooltip">Settings</span>}
          </button>
          <button
            type="button"
            className="dashboard-nav-item dashboard-footer-item"
            onClick={onOpenHelp}
          >
            <HelpCircle className="dashboard-nav-icon" />
            <span className="dashboard-nav-label">Help Centre</span>
            {collapsed && <span className="dashboard-tooltip">Help Centre</span>}
          </button>
        </div>

        <div className="dashboard-user-card-wrap" ref={menuRef}>
          <button
            type="button"
            className="dashboard-user-card"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="dashboard-avatar dashboard-avatar-img"
              />
            ) : (
              <div className="dashboard-avatar gradient-primary">
                {userInitials}
              </div>
            )}
            <div className="dashboard-user-copy">
              <strong>{user.name}</strong>
              <span>{user.email ?? user.role}</span>
            </div>
            <ChevronDown className="dashboard-chevron" />
          </button>

          {menuOpen && (
            <div className="dashboard-user-menu">
              <div className="dashboard-user-menu-header">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="dashboard-avatar dashboard-avatar-img"
                  />
                ) : (
                  <div className="dashboard-avatar gradient-primary">
                    {userInitials}
                  </div>
                )}
                <div className="dashboard-user-copy">
                  <strong>{user.name}</strong>
                  <span>{user.email ?? user.role}</span>
                </div>
              </div>
              <div className="dashboard-user-menu-items">
                <button type="button" className="dashboard-user-menu-item">
                  Credits
                </button>
                <button type="button" className="dashboard-user-menu-item">
                  Integrations
                </button>
                <button
                  type="button"
                  className="dashboard-user-menu-item dashboard-user-menu-highlight"
                >
                  Upgrade to Pro
                </button>
              </div>
              <div className="dashboard-user-menu-items">
                <button
                  type="button"
                  className="dashboard-user-menu-item"
                  onClick={onLogout}
                >
                  <LogOut className="dashboard-nav-icon" />
                  Log out
                </button>
              </div>
              <div className="dashboard-user-menu-footer">
                v1.0.0 · Terms &amp; Conditions
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header glass">
          <div className="dashboard-search dashboard-header-search">
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
            <div className="dashboard-avatar gradient-primary">
              {userInitials}
            </div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}