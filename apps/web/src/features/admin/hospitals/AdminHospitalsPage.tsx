import { useMemo, useState, useEffect } from "react";
import { Building2, MapPin, Plus, X, Pencil, Shield, FileText, Globe, MessageSquare, Phone } from "lucide-react";
import { PageHead } from "@/shared/components/ui/ReservationPrimitives";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { platformService } from "@/services/platform.service";
import type { HospitalAccount } from "@/types/platform";

const filters = ["all", "OPEN", "pending", "CLOSED"] as const;
const filterLabels: Record<typeof filters[number], string> = {
  all: "All",
  OPEN: "Open",
  pending: "Pending",
  CLOSED: "Closed"
};

const statusMeta: Record<string, { label: string; tone: string }> = {
  OPEN: { label: "Open", tone: "good" },
  CLOSED: { label: "Closed", tone: "bad" },
  UNDER_MAINTENANCE: { label: "Under maintenance", tone: "warn" },
  pending: { label: "Pending", tone: "warn" },
};

function coordinateValue(value: unknown, fallback: number): number {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : fallback;
}

export function AdminHospitalsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [hospitals, setHospitals] = useState<HospitalAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // drives the enter/exit transition
  const [editingHospital, setEditingHospital] = useState<HospitalAccount | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [detailTab, setDetailTab] = useState<"hospital" | "admin">("hospital");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    hospitalName: "",
    licenseNumber: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    latitude: 23.8103,
    longitude: 90.4125,
    hospitalStatus: "OPEN",
    description: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await platformService.getHospitals();
      setHospitals(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mount / unmount the modal a frame apart from the open state so the
  // enter transition actually has something to animate from.
  useEffect(() => {
    if (isModalOpen) {
      setIsModalVisible(true);
    }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsModalVisible(false), 220);
  };

  useEffect(() => {
    if (!isModalVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalVisible]);

  const handleOpenCreate = () => {
    setEditingHospital(null);
    setModalMode("create");
    setDetailTab("hospital");
    setFormData({
      hospitalName: "", licenseNumber: "", email: "", phone: "", website: "", address: "",
      latitude: 23.8103, longitude: 90.4125, hospitalStatus: "OPEN", description: "",
      adminEmail: "", adminPhone: "", adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (h: HospitalAccount) => {
    setEditingHospital(h);
    setModalMode("view");
    setDetailTab("hospital");
    setFormData({
      hospitalName: h.name || "",
      licenseNumber: h.licenseNumber || "",
      email: h.email || "",
      phone: h.phone || "",
      website: h.website || "",
      address: h.address || h.location || "",
      latitude: coordinateValue(h.latitude, 23.8103),
      longitude: coordinateValue(h.longitude, 90.4125),
      hospitalStatus: h.hospitalStatus || (h.verification === "OPEN" ? "OPEN" : h.verification === "CLOSED" ? "CLOSED" : "UNDER_MAINTENANCE"),
      description: h.description || "",
      adminEmail: h.email || "",
      adminPhone: h.phone || "",
      adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: HospitalAccount) => {
    setEditingHospital(h);
    setModalMode("edit");
    setDetailTab("hospital");
    setFormData({
      hospitalName: h.name || "",
      licenseNumber: h.licenseNumber || "",
      email: h.email || "",
      phone: h.phone || "",
      website: h.website || "",
      address: h.address || h.location || "",
      latitude: coordinateValue(h.latitude, 23.8103),
      longitude: coordinateValue(h.longitude, 90.4125),
      hospitalStatus: h.hospitalStatus || (h.verification === "OPEN" ? "OPEN" : h.verification === "CLOSED" ? "CLOSED" : "UNDER_MAINTENANCE"),
      description: h.description || "",
      adminEmail: h.email || "",
      adminPhone: h.phone || "",
      adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const latitude = Number(formData.latitude);
      const longitude = Number(formData.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        alert("Please enter valid latitude and longitude values.");
        return;
      }

      const hospitalPayload = {
        hospitalName: formData.hospitalName.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website?.trim() || undefined,
        address: formData.address.trim(),
        latitude,
        longitude,
        hospitalStatus: formData.hospitalStatus,
        description: formData.description?.trim() || undefined,
      };

      if (editingHospital) {
        await platformService.updateHospital(editingHospital.id, hospitalPayload);
      } else {
        await platformService.createHospital({
          hospital: hospitalPayload,
          admin: {
            email: formData.adminEmail.trim(),
            phone: formData.adminPhone.trim(),
            password: formData.adminPassword,
          },
        });
      }
      closeModal();
      await loadData();
    } catch (error) {
      console.error("Save failed", error);
      alert(error instanceof Error ? error.message : "Failed to save hospital. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "OPEN" | "CLOSED" | "UNDER_MAINTENANCE") => {
    try {
      await platformService.updateHospital(id, { hospitalStatus: status });
      await loadData();
    } catch (error) {
      console.error("Status update failed", error);
      alert("Failed to update status.");
    }
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return hospitals
      .filter((h) => (filter === "all" ? true : (h.hospitalStatus ?? h.verification) === filter))
      .filter((h) =>
        !needle ? true : [h.name, h.location, h.type, h.contact].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, hospitals]);

  const currentStatus = statusMeta[formData.hospitalStatus] ?? { label: formData.hospitalStatus, tone: "warn" };
  const isReadOnly = modalMode === "view";

  return (
    <main className="hospital-requests">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", marginBottom: "20px" }}>
        <PageHead
          title="Hospital management"
          subtitle={`${hospitals.length} registered hospitals · ${hospitals.filter((h) => h.verification === "pending").length} awaiting verification`}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
        <div className="request-tabs" style={{ marginBottom: 0 }}>
          {filters.map((tab) => (
            <button
              key={tab}
              type="button"
              className={filter === tab ? "active" : ""}
              onClick={() => setFilter(tab)}
            >
              {filterLabels[tab]}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "999px",
            background: "#14b8a6",
            color: "#ffffff",
            border: "1px solid #14b8a6",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1,
            boxShadow: "0 8px 20px rgba(20, 184, 166, 0.2)",
            whiteSpace: "nowrap",
          }}
        >
          <Plus className="size-4" />
          Add Hospital
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <SearchInput value={q} onChange={setQ} placeholder="Search hospital, type or city…" />
      </div>

      {/* Panel with Rows */}
      <section className="request-panel">
        <header>
          <div>
            <h2>Hospitals</h2>
            <p>{isLoading ? "Loading..." : `${rows.length} shown`}</p>
          </div>
        </header>

        {isLoading && <p className="request-empty">Loading hospitals...</p>}

        {!isLoading && rows.length === 0 && (
          <p className="request-empty">No hospitals match your search.</p>
        )}

        {!isLoading && rows.length > 0 && (
          <div className="request-row" style={{ opacity: 0.7, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--hospital-muted)", borderBottom: "1px solid rgb(215 228 229 / 50%)", paddingBottom: "8px", marginBottom: "8px" }}>
            <div className="request-kind" style={{ visibility: "hidden" }} />
            <div className="request-patient"><strong>Hospital</strong></div>
            <div className="request-date" style={{ minWidth: "140px" }}><strong>Location</strong></div>
            <div className="request-charge" style={{ minWidth: "120px" }}><strong>Registered</strong></div>
            <div className="request-badges"><strong>Status</strong></div>
            <div className="request-row-actions" style={{ justifyContent: "flex-end" }}><strong>Actions</strong></div>
          </div>
        )}

        {!isLoading && rows.map((h) => (
          <div key={h.id} className="request-row">
            <div className="request-kind request-kind-consultation">
              <Building2 className="size-5" size={18} />
            </div>
            <div className="request-patient">
              <strong>{h.name}</strong>
              <span>{h.type} · {h.id}</span>
            </div>
            <div className="request-date" style={{ minWidth: "140px" }}>
              <MapPin className="size-3.5 inline mr-1" size={14} />
              {h.location}
            </div>
            <div className="request-charge" style={{ minWidth: "120px" }}>
              <span>Registered </span><strong>{h.registered}</strong>
            </div>
            <div className="request-badges">
              <span className={`request-status request-status-${String(h.hospitalStatus ?? h.verification).toLowerCase().replace(/_/g, "-")}`}>
                {h.hospitalStatus ?? h.verification}
              </span>
            </div>
            <div className="request-row-actions" style={{ gap: "4px" }}>
              <button
                type="button"
                className="request-action request-action-ghost"
                onClick={() => handleOpenView(h)}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "11px" }}
              >
                <FileText className="size-3" />
                View
              </button>
              <button
                type="button"
                className="request-action request-action-ghost"
                onClick={() => handleOpenEdit(h)}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "11px" }}
              >
                <Pencil className="size-3" />
                Edit
              </button>
              {(h.hospitalStatus ?? h.verification) !== "OPEN" && (
                <button
                  type="button"
                  className="request-action request-action-primary"
                  onClick={() => handleUpdateStatus(h.id, "OPEN")}
                  style={{ fontSize: "11px", padding: "6px 10px" }}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ───────────────────────── Modal ───────────────────────── */}
      {isModalVisible && (
        <div className={`hm-backdrop ${isModalOpen ? "hm-in" : "hm-out"}`} onClick={closeModal}>
          <div
            className={`hm-modal ${isModalOpen ? "hm-in" : "hm-out"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hm-title"
          >
            {/* Header */}
            <div className="hm-header">
              <div className="hm-header-icon">
                <Building2 size={18} strokeWidth={1.75} />
              </div>
              <div className="hm-header-text">
                <h2 id="hm-title">
                  {modalMode === "create" ? "New hospital" : modalMode === "edit" ? "Edit hospital" : (editingHospital?.name || "Hospital")}
                </h2>
                <p>
                  {modalMode === "create" && "Register a facility and its admin account"}
                  {modalMode === "edit" && "Update facility details"}
                  {modalMode === "view" && (editingHospital?.type ? `${editingHospital.type} · ${editingHospital.id}` : "Facility overview")}
                </p>
              </div>
              <button type="button" className="hm-close" onClick={closeModal} aria-label="Close">
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            {/* Segmented tab control */}
            {(modalMode === "view" || modalMode === "edit") && (
              <div className="hm-segment-wrap">
                <div className="hm-segment" role="tablist" aria-label="Hospital detail sections">
                  <span className={`hm-segment-thumb ${detailTab === "admin" ? "hm-segment-thumb-right" : ""}`} />
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "hospital"}
                    className={detailTab === "hospital" ? "active" : ""}
                    onClick={() => setDetailTab("hospital")}
                  >
                    Hospital
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={detailTab === "admin"}
                    className={detailTab === "admin" ? "active" : ""}
                    onClick={() => setDetailTab("admin")}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="hm-body">
              <form id="hospital-form" onSubmit={handleSave}>

                {detailTab === "hospital" && (
                  <>
                    {isReadOnly ? (
                      <>
                        <div className="hm-group">
                          <div className="hm-row">
                            <span className="hm-row-icon"><Building2 size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Hospital name</span>
                              <span className="hm-row-value">{formData.hospitalName || "—"}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><Building2 size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">License number</span>
                              <span className="hm-row-value">{formData.licenseNumber || "—"}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><MessageSquare size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Email</span>
                              <span className="hm-row-value">{formData.email || "—"}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><Phone size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Phone</span>
                              <span className="hm-row-value">{formData.phone || "—"}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><Globe size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Website</span>
                              <span className="hm-row-value">{formData.website || "—"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="hm-group">
                          <div className="hm-row">
                            <span className="hm-row-icon"><MapPin size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Address</span>
                              <span className="hm-row-value">{formData.address || "—"}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><MapPin size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Coordinates</span>
                              <span className="hm-row-value hm-mono">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
                            </div>
                          </div>
                          <div className="hm-row">
                            <span className="hm-row-icon"><Shield size={14} strokeWidth={1.75} /></span>
                            <div className="hm-row-body">
                              <span className="hm-row-label">Status</span>
                              <span className={`hm-pill hm-pill-${currentStatus.tone}`}>{currentStatus.label}</span>
                            </div>
                          </div>
                        </div>

                        {formData.description && (
                          <div className="hm-group">
                            <div className="hm-row hm-row-block">
                              <span className="hm-row-label">Description</span>
                              <p className="hm-row-text">{formData.description}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="hm-group">
                          <div className="hm-field">
                            <label htmlFor="hm-name">Hospital name</label>
                            <input id="hm-name" required type="text" placeholder="Evercare Hospital" value={formData.hospitalName} onChange={e => setFormData({ ...formData, hospitalName: e.target.value })} />
                          </div>
                          <div className="hm-field">
                            <label htmlFor="hm-license">License number</label>
                            <input id="hm-license" required type="text" placeholder="1111100000" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                          </div>
                          <div className="hm-field">
                            <label htmlFor="hm-email">Email</label>
                            <input id="hm-email" required type="email" placeholder="contact@hospital.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                          </div>
                          <div className="hm-field">
                            <label htmlFor="hm-phone">Phone</label>
                            <input id="hm-phone" required type="text" placeholder="+880 1XXX-XXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                          </div>
                          <div className="hm-field">
                            <label htmlFor="hm-website">Website</label>
                            <input id="hm-website" type="url" placeholder="https://hospital.com" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                          </div>
                        </div>

                        <div className="hm-group">
                          <div className="hm-field">
                            <label htmlFor="hm-address">Address</label>
                            <input id="hm-address" required type="text" placeholder="Street, area, city" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                          </div>
                          <div className="hm-field-split">
                            <div className="hm-field">
                              <label htmlFor="hm-lat">Latitude</label>
                              <input id="hm-lat" required type="number" step="any" min="-90" max="90" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: Number(e.target.value) })} />
                            </div>
                            <div className="hm-field">
                              <label htmlFor="hm-lng">Longitude</label>
                              <input id="hm-lng" required type="number" step="any" min="-180" max="180" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: Number(e.target.value) })} />
                            </div>
                          </div>
                          <div className="hm-field">
                            <label htmlFor="hm-status">Status</label>
                            <select id="hm-status" value={formData.hospitalStatus} onChange={e => setFormData({ ...formData, hospitalStatus: e.target.value })}>
                              <option value="OPEN">Open</option>
                              <option value="CLOSED">Closed</option>
                              <option value="UNDER_MAINTENANCE">Under maintenance</option>
                            </select>
                          </div>
                        </div>

                        <div className="hm-group">
                          <div className="hm-field">
                            <label htmlFor="hm-desc">Description</label>
                            <textarea id="hm-desc" placeholder="A short note about the facility, specialties, or services" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {detailTab === "admin" && (
                  <>
                    {isReadOnly ? (
                      <div className="hm-group">
                        <div className="hm-row">
                          <span className="hm-row-icon"><MessageSquare size={14} strokeWidth={1.75} /></span>
                          <div className="hm-row-body">
                            <span className="hm-row-label">Admin email</span>
                            <span className="hm-row-value">{formData.adminEmail || "—"}</span>
                          </div>
                        </div>
                        <div className="hm-row">
                          <span className="hm-row-icon"><Phone size={14} strokeWidth={1.75} /></span>
                          <div className="hm-row-body">
                            <span className="hm-row-label">Admin phone</span>
                            <span className="hm-row-value">{formData.adminPhone || "—"}</span>
                          </div>
                        </div>
                        <div className="hm-row">
                          <span className="hm-row-icon"><Phone size={14} strokeWidth={1.75} /></span>
                          <div className="hm-row-body">
                            <span className="hm-row-label">Hospital contact</span>
                            <span className="hm-row-value">{formData.phone || "—"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="hm-group">
                        <div className="hm-field">
                          <label htmlFor="hm-admin-email">Admin email</label>
                          <input id="hm-admin-email" type="email" placeholder="admin@hospital.com" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                        </div>
                        <div className="hm-field">
                          <label htmlFor="hm-admin-phone">Admin phone</label>
                          <input id="hm-admin-phone" type="text" placeholder="+880 1XXX-XXXXXX" value={formData.adminPhone} onChange={e => setFormData({ ...formData, adminPhone: e.target.value })} />
                        </div>
                        <div className="hm-field">
                          <label htmlFor="hm-admin-pass">Admin password</label>
                          <input id="hm-admin-pass" minLength={6} type="password" placeholder="Leave blank to keep current" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
                        </div>
                        <div className="hm-field">
                          <label htmlFor="hm-admin-contact">Hospital contact</label>
                          <input id="hm-admin-contact" readOnly type="text" value={formData.phone} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {modalMode === "create" && (
                  <div className="hm-group">
                    <div className="hm-group-title">
                      <Shield size={13} strokeWidth={1.75} />
                      <span>Admin credentials</span>
                    </div>
                    <div className="hm-field">
                      <label htmlFor="hm-c-admin-email">Admin email</label>
                      <input id="hm-c-admin-email" required type="email" placeholder="admin@hospital.com" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                    </div>
                    <div className="hm-field">
                      <label htmlFor="hm-c-admin-phone">Admin phone</label>
                      <input id="hm-c-admin-phone" required type="text" placeholder="+880 1XXX-XXXXXX" value={formData.adminPhone} onChange={e => setFormData({ ...formData, adminPhone: e.target.value })} />
                    </div>
                    <div className="hm-field">
                      <label htmlFor="hm-c-admin-pass">Admin password</label>
                      <input id="hm-c-admin-pass" required minLength={6} type="password" placeholder="At least 6 characters" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="hm-footer">
              {modalMode === "view" ? (
                <>
                  <button type="button" onClick={closeModal} className="hm-btn hm-btn-ghost" disabled={isSaving}>
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (editingHospital) handleOpenEdit(editingHospital); }}
                    className="hm-btn hm-btn-primary"
                  >
                    <Pencil size={13} strokeWidth={2} />
                    Edit details
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={closeModal} className="hm-btn hm-btn-ghost" disabled={isSaving}>
                    Cancel
                  </button>
                  <button type="submit" form="hospital-form" className="hm-btn hm-btn-primary" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="hm-spinner" />
                        Saving…
                      </>
                    ) : (
                      modalMode === "create" ? "Create hospital" : "Save changes"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ───────── Apple-inspired modal system ───────── */
        .hm-backdrop {
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
        .hm-backdrop.hm-in { opacity: 1; }
        .hm-backdrop.hm-out { opacity: 0; }

        .hm-modal {
          width: 100%;
          max-width: 560px;
          max-height: min(720px, 88vh);
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
        .hm-modal.hm-in { transform: translateY(0) scale(1); opacity: 1; }
        .hm-modal.hm-out { transform: translateY(10px) scale(0.98); opacity: 0; }

        .hm-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 22px 22px 18px;
          flex-shrink: 0;
        }
        .hm-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(155deg, rgba(20, 184, 166, 0.14), rgba(20, 184, 166, 0.06));
          color: #0f8f80;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hm-header-text { flex: 1; min-width: 0; }
        .hm-header-text h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #0f1f22;
          line-height: 1.3;
        }
        .hm-header-text p {
          margin: 2px 0 0;
          font-size: 13px;
          color: #7c9192;
          line-height: 1.4;
        }
        .hm-close {
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
        .hm-close:hover { background: #e4ecec; color: #0f1f22; }
        .hm-close:active { transform: scale(0.92); }

        .hm-segment-wrap { padding: 0 22px 16px; flex-shrink: 0; }
        .hm-segment {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #eef3f3;
          border-radius: 11px;
          padding: 3px;
        }
        .hm-segment-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: calc(50% - 3px);
          height: calc(100% - 6px);
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(15, 30, 32, 0.14), 0 1px 1px rgba(15, 30, 32, 0.06);
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hm-segment-thumb-right { transform: translateX(100%); }
        .hm-segment button {
          position: relative;
          z-index: 1;
          border: none;
          background: transparent;
          padding: 7px 0;
          font-size: 13px;
          font-weight: 500;
          color: #6c8384;
          border-radius: 8px;
          cursor: pointer;
          transition: color 200ms ease;
        }
        .hm-segment button.active { color: #0f1f22; font-weight: 600; }

        .hm-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 22px 22px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hm-body::-webkit-scrollbar { display: none; width: 0; height: 0; }

        .hm-group {
          background: #fbfdfd;
          border: 1px solid #eaf0f0;
          border-radius: 14px;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .hm-group:last-child { margin-bottom: 0; }
        .hm-group-title {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px 0;
          font-size: 12px;
          font-weight: 600;
          color: #6c8384;
        }

        /* read-only rows */
        .hm-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #eef3f3;
        }
        .hm-group .hm-row:last-child { border-bottom: none; }
        .hm-row-icon {
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
        .hm-row-body {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .hm-row-label { font-size: 13px; color: #6c8384; flex-shrink: 0; }
        .hm-row-value {
          font-size: 13.5px;
          color: #16292b;
          font-weight: 500;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .hm-mono { font-variant-numeric: tabular-nums; }
        .hm-row-block { flex-direction: column; align-items: flex-start; gap: 6px; }
        .hm-row-text { margin: 0; font-size: 13.5px; line-height: 1.55; color: #16292b; }
        .hm-pill {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }
        .hm-pill-good { background: rgba(20, 184, 166, 0.12); color: #0f8f80; }
        .hm-pill-bad { background: rgba(220, 38, 38, 0.1); color: #b91c1c; }
        .hm-pill-warn { background: rgba(217, 119, 6, 0.1); color: #b45309; }

        /* editable fields */
        .hm-field { padding: 10px 16px; border-bottom: 1px solid #eef3f3; }
        .hm-group .hm-field:last-child { border-bottom: none; }
        .hm-field label {
          display: block;
          font-size: 12px;
          color: #6c8384;
          margin-bottom: 4px;
        }
        .hm-field input,
        .hm-field select,
        .hm-field textarea {
          width: 100%;
          border: none;
          background: transparent;
          padding: 0;
          font-size: 14px;
          color: #0f1f22;
          font-family: inherit;
          outline: none;
          resize: none;
        }
        .hm-field textarea { min-height: 56px; line-height: 1.5; padding-top: 2px; }
        .hm-field select { cursor: pointer; }
        .hm-field input::placeholder,
        .hm-field textarea::placeholder { color: #b7c5c5; }
        .hm-field input[readonly] { color: #8fa2a3; }
        .hm-field-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .hm-field-split .hm-field:first-child { border-right: 1px solid #eef3f3; }
        .hm-field-split .hm-field { border-bottom: 1px solid #eef3f3; }

        .hm-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #eef3f3;
          flex-shrink: 0;
          background: #fcfefe;
        }
        .hm-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 150ms ease;
        }
        .hm-btn:active { transform: scale(0.97); }
        .hm-btn:disabled { opacity: 0.6; cursor: default; transform: none; }
        .hm-btn-ghost {
          background: #f4f7f7;
          color: #38494a;
        }
        .hm-btn-ghost:hover:not(:disabled) { background: #e9efef; }
        .hm-btn-primary {
          background: #14b8a6;
          color: #ffffff;
          box-shadow: 0 8px 18px rgba(20, 184, 166, 0.28);
        }
        .hm-btn-primary:hover:not(:disabled) { background: #0fa595; }

        .hm-spinner {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          animation: hm-spin 700ms linear infinite;
        }
        @keyframes hm-spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .hm-backdrop { padding: 0; align-items: flex-end; }
          .hm-modal { max-width: 100%; max-height: 92vh; border-radius: 20px 20px 0 0; }
          .hm-field-split { grid-template-columns: 1fr; }
          .hm-field-split .hm-field:first-child { border-right: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hm-backdrop, .hm-modal, .hm-segment-thumb, .hm-btn { transition: none !important; }
        }
      `}</style>
    </main>
  );
}