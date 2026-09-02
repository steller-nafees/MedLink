import { useEffect, useMemo, useState } from "react";
import { Siren, User, Building2, Shield, X, MessageSquare, Phone, CalendarCheck2, IdCard, MapPin } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import type { PlatformUser } from "@/types/platform";
import { platformService } from "@/services/platform.service";

type UserRole = "customer" | "ambulance_driver" | "hospital_admin" | "super_admin";

const roleFilters = ["all", "customer", "ambulance_driver", "hospital_admin", "super_admin"] as const;

const PAGE_SIZE = 10;

const ROLE_META: Record<UserRole, { label: string; icon: typeof User; chip: string }> = {
  customer: { label: "Customer", icon: User, chip: "bg-[#EAF3FF] text-[#2E5D9F] ring-1 ring-inset ring-[#CFE1FF]" },
  ambulance_driver: { label: "Ambulance Driver", icon: Siren, chip: "bg-[#FEECEC] text-[#D35A5A] ring-1 ring-inset ring-[#F4C6C6]" },
  hospital_admin: { label: "Hospital Admin", icon: Building2, chip: "bg-[#16A89C]/10 text-[#0F7A70] ring-1 ring-inset ring-[#16A89C]/25" },
  super_admin: { label: "Super Admin", icon: Shield, chip: "bg-[#F3E8FF] text-[#7E22CE] ring-1 ring-inset ring-[#E9D5FF]" }
};

function UserRow({ user, onView }: { user: PlatformUser; onView: (u: PlatformUser) => void }) {
  const initials = user.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
  const roleInfo = ROLE_META[user.role as UserRole];
  const RoleIcon = roleInfo?.icon ?? User;

  return (
    <div className="request-row au-row">
      <div className="au-row-main">
        <div className={`au-avatar ${roleInfo?.chip ?? ""}`}>
          <span>{initials}</span>
        </div>
        <div className="request-patient au-identity">
          <strong>{user.name}</strong>
          <span className={`au-role-chip ${roleInfo?.chip ?? ""}`}>
            <RoleIcon size={11} strokeWidth={2} />
            {roleInfo?.label || "User"}
          </span>
        </div>
      </div>

      <div className="au-field au-field-contact">
        <span className="au-mobile-label">Contact</span>
        <span className="au-field-value">{user.email || "No email provided"}</span>
        <span className="au-sub">{user.phone}</span>
      </div>

      <div className="au-field au-field-registered">
        <span className="au-mobile-label">Registered</span>
        <strong>{user.registered}</strong>
      </div>

      <div className="au-actions">
        <button type="button" className="request-action request-action-ghost" onClick={() => onView(user)}>
          View
        </button>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof roleFilters)[number]>("all");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

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
  }, [q, role]);

  useEffect(() => {
    if (isModalOpen) setIsModalVisible(true);
  }, [isModalOpen]);

  const openUser = (user: PlatformUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setIsModalVisible(false);
      setSelectedUser(null);
    }, 220);
  };

  useEffect(() => {
    if (!isModalVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalVisible]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users
      .filter((u) => (role === "all" ? true : u.role === role))
      .filter((u) =>
        !needle ? true : [u.name, u.email, u.phone, u.id].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, status, role, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectedRoleInfo = selectedUser ? ROLE_META[selectedUser.role as UserRole] : undefined;
  const SelectedRoleIcon = selectedRoleInfo?.icon ?? User;
  const selectedInitials = selectedUser
    ? selectedUser.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "";

  return (
    <main className="hospital-requests au-page">
      <PageHeader eyebrow="Accounts" title="User management" subtitle={`${users.length} accounts across all roles`} />

      {/* Status Filter Tabs */}
      <div className="admin-users-toolbar au-toolbar">
        <div className="request-tabs au-role-tabs">
          {roleFilters.map((tab) => (
            <button
              key={tab}
              type="button"
              className={role === tab ? "active" : ""}
              onClick={() => setRole(tab)}
            >
              {tab === "all" ? "All roles" : ROLE_META[tab].label}
            </button>
          ))}
        </div>

        <div className="admin-users-search au-search">
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

        {!isLoading && rows.length > 0 && (
          <div className="au-col-header">
            <div className="au-col-header-main">User</div>
            <div className="au-col-header-field">Contact</div>
            <div className="au-col-header-field">Registered</div>
            <div className="au-col-header-actions">Actions</div>
          </div>
        )}

        {isLoading && <p className="request-empty">Loading users...</p>}

        {!isLoading && rows.map((user) => (
          <UserRow key={user.id} user={user} onView={openUser} />
        ))}

        {!isLoading && rows.length === 0 && <p className="request-empty">No users match your search.</p>}
      </section>

      {/* Pagination */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="au-pagination">
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

      {/* ───────────────────────── User details modal ───────────────────────── */}
      {isModalVisible && selectedUser && (
        <div className={`au-backdrop ${isModalOpen ? "au-in" : "au-out"}`} onClick={closeModal}>
          <div
            className={`au-modal ${isModalOpen ? "au-in" : "au-out"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="au-modal-title"
          >
            <div className="au-modal-header">
              <div className={`au-modal-avatar ${selectedRoleInfo?.chip ?? ""}`}>
                <span>{selectedInitials}</span>
              </div>
              <div className="au-modal-header-text">
                <h2 id="au-modal-title">{selectedUser.name}</h2>
                <span className={`au-role-chip ${selectedRoleInfo?.chip ?? ""}`}>
                  <SelectedRoleIcon size={11} strokeWidth={2} />
                  {selectedRoleInfo?.label || "User"}
                </span>
              </div>
              <button type="button" className="au-close" onClick={closeModal} aria-label="Close">
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="au-modal-body">
              <div className="au-group">
                <div className="au-row-detail">
                  <span className="au-row-icon"><MessageSquare size={14} strokeWidth={1.75} /></span>
                  <div className="au-row-body">
                    <span className="au-row-label">Email</span>
                    <span className="au-row-value">{selectedUser.email || "No email provided"}</span>
                  </div>
                </div>
                <div className="au-row-detail">
                  <span className="au-row-icon"><Phone size={14} strokeWidth={1.75} /></span>
                  <div className="au-row-body">
                    <span className="au-row-label">Phone</span>
                    <span className="au-row-value">{selectedUser.phone || "—"}</span>
                  </div>
                </div>
                <div className="au-row-detail">
                  <span className="au-row-icon"><CalendarCheck2 size={14} strokeWidth={1.75} /></span>
                  <div className="au-row-body">
                    <span className="au-row-label">Registered</span>
                    <span className="au-row-value">{selectedUser.registered}</span>
                  </div>
                </div>
                <div className="au-row-detail">
                  <span className="au-row-icon"><IdCard size={14} strokeWidth={1.75} /></span>
                  <div className="au-row-body">
                    <span className="au-row-label">User ID</span>
                    <span className="au-row-value au-mono">{selectedUser.id}</span>
                  </div>
                </div>
                <div className="au-row-detail">
                  <span className="au-row-icon"><MapPin size={14} strokeWidth={1.75} /></span>
                  <div className="au-row-body">
                    <span className="au-row-label">Location</span>
                    <span className="au-row-value">{formatUserLocation(selectedUser)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="au-modal-footer">
              <button type="button" onClick={closeModal} className="au-btn au-btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ───────── Toolbar ───────── */
        .au-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .au-role-tabs { flex: 1 1 auto; min-width: 0; margin-bottom: 0; }
        .au-select-wrap { position: relative; display: inline-flex; align-items: center; }
        .au-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 8px 30px 8px 16px;
          border-radius: 999px;
          border: 1px solid var(--hospital-border);
          background: var(--hospital-surface);
          color: var(--hospital-text);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .au-select:hover { border-color: #14b8a6; }
        .au-select:focus-visible {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
        }
        .au-select-chevron {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: var(--hospital-muted);
        }
        .au-search { margin-left: auto; min-width: 220px; }

        /* ───────── Grid: shared column template keeps header + rows aligned ───────── */
        .au-page .request-row.au-row,
        .au-col-header {
          display: grid;
          grid-template-columns: minmax(200px, 1.6fr) minmax(180px, 1.2fr) 110px 64px;
          column-gap: 16px;
          align-items: center;
        }

        .au-page .ui-page-header h1 { font-size: 26px; letter-spacing: -0.025em; }
        .au-page .ui-page-header p { font-size: 12.5px; }
        .au-page .request-panel > header { padding: 16px 20px; }
        .au-page .request-row.au-row { padding: 16px 20px; }
        .au-page .au-col-header {
          padding: 0 20px 8px;
          margin-bottom: 0;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--hospital-muted);
        }

        .au-col-header {
          padding: 0 4px 8px;
          margin-bottom: 4px;
          border-bottom: 1px solid rgb(215 228 229 / 50%);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--hospital-muted, #7c9192);
          opacity: 0.75;
        }
        .au-col-header-actions { text-align: right; }

        .au-row-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .au-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 11.5px;
          font-weight: 700;
        }
        .au-identity { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .au-identity strong { font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .au-role-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          width: fit-content;
          padding: 2px 8px 2px 6px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 600;
        }

        .au-field { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 12.5px; }
        .au-field-value {
          font-size: 12.5px;
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .au-sub { font-size: 11px; color: var(--hospital-muted, #7c9192); }
        .au-mobile-label { display: none; }
        .au-field-registered strong { font-size: 12.5px; font-weight: 700; }
        .au-actions { justify-self: end; font-size: 12px; }

        .au-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          font-size: 12px;
          color: var(--hospital-muted);
          border-top: 1px solid rgb(215 228 229 / 50%);
        }

        /* ───────── Responsive: stacked cards below 720px ───────── */
        @media (max-width: 720px) {
          .au-col-header { display: none; }

          .au-page .request-panel > header { padding: 14px 16px; }
          .au-page .au-col-header { padding-inline: 0; }

          .au-page .request-row.au-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 14px 16px;
            border-radius: 14px;
            border: 1px solid #eaf0f0;
            background: #fbfdfd;
            margin-bottom: 10px;
          }
          .au-row-main { width: 100%; }
          .au-field {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            padding-top: 8px;
            border-top: 1px solid #eef3f3;
          }
          .au-field-value { text-align: right; white-space: normal; overflow-wrap: anywhere; }
          .au-sub { text-align: right; }
          .au-mobile-label {
            display: block;
            font-size: 11px;
            color: var(--hospital-muted, #7c9192);
            flex-shrink: 0;
          }
          .au-actions {
            justify-self: stretch;
            padding-top: 8px;
            border-top: 1px solid #eef3f3;
          }
          .au-actions .request-action { width: 100%; text-align: center; }

          .au-role-tabs { width: 100%; flex: 1 1 100%; }
          .au-search { min-width: 0; width: 100%; margin-left: 0; }
          .au-toolbar { flex-direction: column; align-items: stretch; }
          .au-select-wrap { width: 100%; }
          .au-select { width: 100%; }

          .au-pagination { flex-direction: column; gap: 8px; align-items: flex-start; }
        }

        /* ───────── User details modal ───────── */
        .au-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(13, 22, 26, 0.42);
          backdrop-filter: blur(6px) saturate(140%);
          -webkit-backdrop-filter: blur(6px) saturate(140%);
          transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .au-backdrop.au-in { opacity: 1; }
        .au-backdrop.au-out { opacity: 0; }

        .au-modal {
          width: 100%;
          max-width: 440px;
          max-height: min(600px, 88vh);
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 22px;
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.6) inset,
            0 0 0 1px rgba(15, 30, 32, 0.04),
            0 30px 60px -18px rgba(13, 30, 32, 0.35),
            0 12px 24px -12px rgba(13, 30, 32, 0.18);
          overflow: hidden;
          transform: translateY(14px) scale(0.97);
          opacity: 0;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
        }
        .au-modal.au-in { transform: translateY(0) scale(1); opacity: 1; }
        .au-modal.au-out { transform: translateY(10px) scale(0.98); opacity: 0; }

        .au-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 22px 18px;
          flex-shrink: 0;
        }
        .au-modal-avatar {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .au-modal-header-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
        .au-modal-header-text h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #0f1f22;
          line-height: 1.3;
        }
        .au-close {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: none;
          background: #f0f4f4;
          color: #5c7274;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
        }
        .au-close:hover { background: #e4ecec; color: #0f1f22; }
        .au-close:active { transform: scale(0.92); }

        .au-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 22px 22px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .au-modal-body::-webkit-scrollbar { display: none; width: 0; height: 0; }

        .au-group {
          background: #fbfdfd;
          border: 1px solid #eaf0f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .au-row-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #eef3f3;
        }
        .au-group .au-row-detail:last-child { border-bottom: none; }
        .au-row-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: #f0f4f4;
          color: #5c7274;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .au-row-body {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .au-row-label { font-size: 13px; color: #6c8384; flex-shrink: 0; }
        .au-row-value {
          font-size: 13.5px;
          color: #16292b;
          font-weight: 500;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .au-mono { font-variant-numeric: tabular-nums; font-size: 12px; }

        .au-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px 22px;
          border-top: 1px solid #eef3f3;
          flex-shrink: 0;
          background: #fcfefe;
        }
        .au-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 150ms ease, background 150ms ease;
        }
        .au-btn:active { transform: scale(0.97); }
        .au-btn-ghost { background: #f4f7f7; color: #38494a; }
        .au-btn-ghost:hover { background: #e9efef; }

        @media (prefers-reduced-motion: reduce) {
          .au-backdrop, .au-modal { transition: none !important; }
        }
      `}</style>
    </main>
  );
}

function formatUserLocation(user: PlatformUser): string {
  if (user.address) return user.address;
  if (user.latitude != null && user.longitude != null) {
    return `${user.latitude.toFixed(4)}, ${user.longitude.toFixed(4)}`;
  }
  return "No location provided";
}