import { useMemo, useState, useEffect } from "react";
import { Building2, MapPin, Plus, X, Pencil, Trash2, Shield } from "lucide-react";
import { PageHead } from "@/shared/components/ui/ReservationPrimitives";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { platformService } from "@/services/platform.service";
import type { HospitalAccount } from "@/types/platform";

const filters = ["all", "verified", "pending", "suspended"] as const;
const filterLabels: Record<typeof filters[number], string> = {
  all: "All",
  verified: "Verified",
  pending: "Pending",
  suspended: "Suspended"
};

export function AdminHospitalsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [hospitals, setHospitals] = useState<HospitalAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalAccount | null>(null);
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

  const handleOpenCreate = () => {
    setEditingHospital(null);
    setFormData({
      hospitalName: "", licenseNumber: "", email: "", phone: "", website: "", address: "",
      latitude: 23.8103, longitude: 90.4125, hospitalStatus: "OPEN", description: "",
      adminEmail: "", adminPhone: "", adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: HospitalAccount) => {
    setEditingHospital(h);
    setFormData({
      hospitalName: h.name || "",
      licenseNumber: h.licenseNumber || "",
      email: h.email || "",
      phone: h.phone || "",
      website: h.website || "",
      address: h.address || h.location || "",
      latitude: h.latitude || 23.8103,
      longitude: h.longitude || 90.4125,
      hospitalStatus: h.hospitalStatus || (h.verification === "verified" ? "OPEN" : "CLOSED"),
      description: h.description || "",
      adminEmail: "", adminPhone: "", adminPassword: "" // Unused in edit
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
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Save failed", error);
      alert(error instanceof Error ? error.message : "Failed to save hospital. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;
    try {
      await platformService.deleteHospital(id);
      await loadData();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete hospital.");
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
      .filter((h) => (filter === "all" ? true : h.verification === filter))
      .filter((h) =>
        !needle ? true : [h.name, h.location, h.type, h.contact].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, hospitals]);

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

      {/* Filter Tabs */}
      <div className="request-tabs" style={{ display: "none" }}>
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
              <span className={`request-status request-status-${h.verification}`}>{h.verification}</span>
            </div>
            <div className="request-row-actions" style={{ gap: "4px" }}>
              <button 
                type="button" 
                className="request-action request-action-ghost"
                onClick={() => handleOpenEdit(h)}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", fontSize: "11px" }}
              >
                <Pencil className="size-3" />
              </button>
              {h.verification !== "verified" && (
                <button 
                  type="button" 
                  className="request-action request-action-primary"
                  onClick={() => handleUpdateStatus(h.id, "OPEN")}
                  style={{ fontSize: "11px", padding: "6px 10px" }}
                >
                  Approve
                </button>
              )}
              {h.verification !== "suspended" && (
                <button 
                  type="button" 
                  className="request-action request-action-danger"
                  onClick={() => handleUpdateStatus(h.id, "CLOSED")}
                  style={{ fontSize: "11px", padding: "6px 10px" }}
                >
                  Suspend
                </button>
              )}
              <button 
                type="button" 
                className="request-action request-action-danger"
                onClick={() => handleDelete(h.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 10px", fontSize: "11px" }}
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="request-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="request-modal" onClick={(e) => e.stopPropagation()}>
            <div className="request-modal-header">
              <div>
                <div className="request-modal-kind">{editingHospital ? "Edit Hospital" : "New Hospital"}</div>
              </div>
              <button 
                type="button" 
                className="request-modal-close" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            
            <div className="request-modal-body">
              <form id="hospital-form" onSubmit={handleSave} className="space-y-4">
                
                <div className="request-info-card">
                  <div className="request-info-title">
                    <Building2 className="size-4" />
                    <h3>Hospital Details</h3>
                  </div>
                  <div className="request-info-content space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Hospital Name *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">License Number *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Email *</label>
                      <input required type="email" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Phone *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Website</label>
                      <input type="url" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Address *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Latitude *</label>
                        <input required type="number" step="any" min="-90" max="90" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Longitude *</label>
                        <input required type="number" step="any" min="-180" max="180" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.hospitalStatus} onChange={e => setFormData({...formData, hospitalStatus: e.target.value})}>
                        <option value="OPEN">Open (Verified)</option>
                        <option value="CLOSED">Closed (Suspended)</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                      <textarea className="w-full p-2 rounded-md border border-input bg-background h-16 text-sm mt-1" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>

                {!editingHospital && (
                  <div className="request-info-card">
                    <div className="request-info-title">
                      <Shield className="size-4" />
                      <h3>Admin Credentials</h3>
                    </div>
                    <div className="request-info-content space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Admin Email *</label>
                        <input required type="email" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Admin Phone *</label>
                        <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.adminPhone} onChange={e => setFormData({...formData, adminPhone: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Admin Password *</label>
                        <input required minLength={6} type="password" className="w-full p-2 rounded-md border border-input bg-background text-sm mt-1" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 20px", borderTop: "1px solid var(--hospital-border)" }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="request-action request-action-ghost"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="hospital-form"
                className="request-action request-action-primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
