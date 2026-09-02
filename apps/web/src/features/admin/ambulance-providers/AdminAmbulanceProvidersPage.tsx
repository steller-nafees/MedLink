import { useMemo, useState, useEffect } from "react";
import { Ambulance, MapPin, Plus, X, Pencil, FileText } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { platformService } from "@/services/platform.service";
import type { AmbulanceProviderAccount } from "@/types/platform";

const filters = ["all", "active", "inactive"] as const;
const filterLabels: Record<typeof filters[number], string> = {
  all: "All",
  active: "Active",
  inactive: "Inactive",
};

function coordinateValue(value: unknown, fallback: number): number {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : fallback;
}

export function AdminAmbulanceProvidersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [providers, setProviders] = useState<AmbulanceProviderAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AmbulanceProviderAccount | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    providerName: "",
    providerPhone: "",
    address: "",
    latitude: 23.8103,
    longitude: 90.4125,
    isActive: true,
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await platformService.getAmbulanceProviders();
      setProviders(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isModalOpen) setIsModalVisible(true);
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsModalVisible(false), 220);
  };

  useEffect(() => {
    if (!isModalVisible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalVisible]);

  const handleOpenCreate = () => {
    setEditingProvider(null);
    setModalMode("create");
    setFormData({
      providerName: "", providerPhone: "", address: "",
      latitude: 23.8103, longitude: 90.4125, isActive: true,
      adminEmail: "", adminPhone: "", adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AmbulanceProviderAccount) => {
    setEditingProvider(p);
    setModalMode("edit");
    setFormData({
      providerName: p.providerName || "",
      providerPhone: p.providerPhone || "",
      address: p.address || "",
      latitude: coordinateValue(p.latitude, 23.8103),
      longitude: coordinateValue(p.longitude, 90.4125),
      isActive: p.isActive,
      adminEmail: "", adminPhone: "", adminPassword: "" // Unused in edit
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (p: AmbulanceProviderAccount) => {
    handleOpenEdit(p);
    setModalMode("view");
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

      const providerPayload = {
        providerName: formData.providerName.trim(),
        providerPhone: formData.providerPhone.trim(),
        address: formData.address.trim(),
        latitude,
        longitude,
        isActive: formData.isActive,
      };

      if (editingProvider) {
        await platformService.updateAmbulanceProvider(editingProvider.id, providerPayload);
      } else {
        await platformService.createAmbulanceProvider({
          ...providerPayload,
          adminEmail: formData.adminEmail.trim(),
          adminPhone: formData.adminPhone.trim(),
          password: formData.adminPassword,
        });
      }
      closeModal();
      await loadData();
    } catch (error) {
      console.error("Save failed", error);
      alert(error instanceof Error ? error.message : "Failed to save ambulance provider. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    try {
      await platformService.updateAmbulanceProvider(id, { isActive });
      await loadData();
      return true;
    } catch (error) {
      console.error("Status update failed", error);
      alert("Failed to update status.");
      return false;
    }
  };

  const handleToggleStatus = async () => {
    if (!editingProvider) return;
    const isActive = !editingProvider.isActive;
    const updated = await handleUpdateStatus(editingProvider.id, isActive);
    if (!updated) return;
    setEditingProvider({ ...editingProvider, isActive });
    setFormData((previous) => ({ ...previous, isActive }));
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return providers
      .filter((p) => {
        if (filter === "all") return true;
        if (filter === "active") return p.isActive;
        if (filter === "inactive") return !p.isActive;
        return true;
      })
      .filter((p) =>
        !needle ? true : [p.providerName, p.address, p.providerPhone].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, providers]);

  const isReadOnly = modalMode === "view";

  return (
    <main className="hospital-requests admin-provider-page">
      <div className="admin-provider-header flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageHeader
          eyebrow="Providers"
          title="Ambulance Providers"
          subtitle={`${providers.length} registered providers · ${providers.filter((p) => !p.isActive).length} suspended`}
        />
        <button
          onClick={handleOpenCreate}
          className="admin-provider-add flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <Plus className="size-4" />
          Add Provider
        </button>
      </div>

      <div className="admin-provider-toolbar">
        <div className="request-tabs">
          {filters.map((tab) => (
            <button key={tab} type="button" className={filter === tab ? "active" : ""} onClick={() => setFilter(tab)}>
              {filterLabels[tab]}
            </button>
          ))}
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Search provider, address or phone…" />
      </div>

      <section className="request-panel">
        <header>
          <div>
            <h2>Ambulance providers</h2>
            <p>{isLoading ? "Loading..." : `${rows.length} shown`}</p>
          </div>
        </header>
        {!isLoading && rows.length === 0 && <p className="request-empty">No providers match your search.</p>}
        {isLoading && <p className="request-empty">Loading providers...</p>}
        {!isLoading && rows.length > 0 && (
          <div className="request-row admin-provider-col-header">
            <div className="request-kind" />
            <div className="request-patient"><strong>Provider</strong></div>
            <div className="request-date"><strong>Location</strong></div>
            <div className="request-charge"><strong>Registered</strong></div>
            <div className="request-badges"><strong>Status</strong></div>
            <div className="request-row-actions"><strong>Actions</strong></div>
          </div>
        )}
        {!isLoading && rows.map((provider) => (
          <div key={provider.id} className="request-row admin-provider-row">
            <div className="request-kind request-kind-consultation"><Ambulance size={18} /></div>
            <div className="request-patient">
              <strong>{provider.providerName}</strong>
              <span>{provider.id} · {provider.providerPhone}</span>
            </div>
            <div className="request-date admin-provider-location"><MapPin size={14} /> {provider.address || "No address"}</div>
            <div className="request-charge"><span>Registered </span><strong>{provider.registered}</strong></div>
            <div className="request-badges">
              <span className={`request-status request-status-${provider.isActive ? "open" : "suspended"}`}>
                {provider.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="request-row-actions">
              <button type="button" className="request-action request-action-ghost" onClick={() => handleOpenView(provider)}><FileText size={13} /> View</button>
              <button type="button" className="request-action request-action-ghost" onClick={() => handleOpenEdit(provider)}><Pencil size={13} /> Edit</button>
            </div>
          </div>
        ))}
      </section>

      {/* Modal */}
      {isModalVisible && (
        <div className={`ap-backdrop ${isModalOpen ? "ap-in" : "ap-out"}`} onClick={closeModal}>
          <div className={`ap-modal ${isModalOpen ? "ap-in" : "ap-out"}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ap-title">
            <div className="ap-header">
              <div className="ap-header-icon"><Ambulance size={18} /></div>
              <div className="ap-header-text">
                <h2 id="ap-title">{modalMode === "create" ? "New ambulance provider" : modalMode === "edit" ? "Edit ambulance provider" : (editingProvider?.providerName || "Ambulance provider")}</h2>
                <p>{modalMode === "create" ? "Register a provider and its admin account" : modalMode === "edit" ? "Update provider details" : "Provider overview"}</p>
              </div>
              <button type="button" className="ap-close" onClick={closeModal} aria-label="Close"><X size={16} /></button>
            </div>
            
            <div className="ap-body">
              <form id="provider-form" onSubmit={handleSave}>
                <fieldset disabled={isReadOnly}>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Provider Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Provider Name *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.providerName} onChange={e => setFormData({...formData, providerName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Provider Phone *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.providerPhone} onChange={e => setFormData({...formData, providerPhone: e.target.value})} />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium">Address *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Latitude *</label>
                      <input required type="number" step="any" min="-90" max="90" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Longitude *</label>
                      <input required type="number" step="any" min="-180" max="180" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Status</label>
                      {isReadOnly ? (
                        <span className={`ap-status-readonly ${formData.isActive ? "active" : "inactive"}`}>{formData.isActive ? "Active" : "Inactive"}</span>
                      ) : (
                        <select value={formData.isActive ? "true" : "false"} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {!editingProvider && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Admin Email *</label>
                        <input required type="email" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Admin Phone *</label>
                        <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.adminPhone} onChange={e => setFormData({...formData, adminPhone: e.target.value})} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium">Admin Password *</label>
                        <input required minLength={6} type="password" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                      </div>
                    </div>
                  </div>
                )}
                </fieldset>
              </form>
            </div>
            
            <div className="ap-footer">
              <button type="button" onClick={closeModal} className="ap-btn ap-btn-ghost" disabled={isSaving}>{isReadOnly ? "Close" : "Cancel"}</button>
              {modalMode === "edit" && editingProvider && (
                <button type="button" onClick={handleToggleStatus} className={`ap-btn ${editingProvider.isActive ? "ap-btn-danger" : "ap-btn-primary"}`} disabled={isSaving}>
                  {editingProvider.isActive ? "Deactivate provider" : "Activate provider"}
                </button>
              )}
              {isReadOnly ? (
                <button type="button" onClick={() => { if (editingProvider) handleOpenEdit(editingProvider); }} className="ap-btn ap-btn-primary"><Pencil size={13} /> Edit details</button>
              ) : (
                <button type="submit" form="provider-form" className="ap-btn ap-btn-primary" disabled={isSaving}>{isSaving ? "Saving..." : modalMode === "create" ? "Create provider" : "Save changes"}</button>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .admin-provider-page { max-width: 1400px; margin: 0 auto; }
        .admin-provider-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }
        .admin-provider-toolbar .request-tabs { margin-bottom: 0; }
        .admin-provider-toolbar > :last-child { min-width: 240px; }
        .admin-provider-col-header { opacity: .7; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; padding-bottom: 8px; }
        .admin-provider-col-header .request-kind { visibility: hidden; }
        .admin-provider-col-header .request-row-actions { justify-content: flex-end; }
        .admin-provider-row { min-width: 0; }
        .admin-provider-location { display: flex; align-items: center; gap: 4px; min-width: 0; overflow-wrap: anywhere; }
        .admin-provider-row .request-row-actions { gap: 4px; }
        .admin-provider-row .request-action { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; font-size: 11px; }

        .ap-backdrop { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(13, 22, 26, .42); backdrop-filter: blur(6px) saturate(140%); transition: opacity 220ms ease; }
        .ap-backdrop.ap-in { opacity: 1; }
        .ap-backdrop.ap-out { opacity: 0; }
        .ap-modal { width: 100%; max-width: 560px; max-height: min(720px, 88vh); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #cbdcdd; border-radius: 22px; background: #fff; box-shadow: 0 30px 60px -18px rgba(13, 30, 32, .35); transform: translateY(14px) scale(.97); opacity: 0; transition: transform 260ms cubic-bezier(.22, 1, .36, 1), opacity 220ms ease; }
        .ap-modal.ap-in { transform: translateY(0) scale(1); opacity: 1; }
        .ap-modal.ap-out { transform: translateY(10px) scale(.98); opacity: 0; }
        .ap-header { display: flex; align-items: flex-start; gap: 12px; padding: 22px 22px 18px; flex-shrink: 0; }
        .ap-header-icon { display: grid; width: 38px; height: 38px; flex-shrink: 0; place-items: center; border-radius: 12px; background: rgba(20, 184, 166, .12); color: #0f8f80; }
        .ap-header-text { flex: 1; min-width: 0; }
        .ap-header-text h2 { margin: 0; color: #0f1f22; font-size: 17px; font-weight: 600; line-height: 1.3; }
        .ap-header-text p { margin: 2px 0 0; color: #7c9192; font-size: 13px; }
        .ap-close { display: grid; width: 28px; height: 28px; flex-shrink: 0; place-items: center; border: 0; border-radius: 999px; background: #f0f4f4; color: #5c7274; cursor: pointer; }
        .ap-body { flex: 1; overflow-y: auto; padding: 4px 22px 22px; }
        .ap-body fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
        .ap-body fieldset:disabled { opacity: .86; }
        .ap-body .space-y-4 { margin-bottom: 14px; padding: 0; border: 1px solid #cbdcdd; border-radius: 14px; background: #fbfdfd; overflow: hidden; }
        .ap-body h4 { margin: 0; padding: 12px 16px 4px; color: #6c8384; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; }
        .ap-body .grid { gap: 0; }
        .ap-body .space-y-1 { padding: 10px 16px; border-bottom: 1px solid #dce7e7; }
        .ap-body .space-y-1:last-child { border-bottom: 0; }
        .ap-body label { display: block; margin-bottom: 4px; color: #6c8384; font-size: 12px; }
        .ap-body input, .ap-body select { width: 100%; border: 0; outline: 0; background: transparent; color: #0f1f22; font: inherit; font-size: 14px; }
        .ap-body input:disabled, .ap-body select:disabled { color: #5c7274; }
        .ap-status-readonly { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
        .ap-status-readonly.active { background: rgba(20, 184, 166, .12); color: #0f8f80; }
        .ap-status-readonly.inactive { background: rgba(220, 38, 38, .1); color: #b91c1c; }
        .ap-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 22px; border-top: 1px solid #eef3f3; background: #fcfefe; }
        .ap-btn { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .ap-btn-ghost { background: #f4f7f7; color: #38494a; }
        .ap-btn-primary { background: #14b8a6; color: white; box-shadow: 0 8px 18px rgba(20, 184, 166, .25); }
        .ap-btn-danger { background: rgba(220, 38, 38, .1); color: #b91c1c; }

        @media (max-width: 720px) {
          .admin-provider-toolbar { align-items: stretch; flex-direction: column; }
          .admin-provider-toolbar .request-tabs { overflow-x: auto; flex-wrap: nowrap; }
          .admin-provider-toolbar > :last-child { width: 100%; min-width: 0; }
          .admin-provider-add { width: 100%; justify-content: center; }
          .admin-provider-col-header { display: none; }
          .admin-provider-row { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 10px 12px; padding: 14px 16px; }
          .admin-provider-row .request-kind { width: 40px; }
          .admin-provider-row .request-patient { width: calc(100% - 52px); }
          .admin-provider-row .request-date, .admin-provider-row .request-charge, .admin-provider-row .request-badges { width: 100%; margin-left: 52px; }
          .admin-provider-row .request-row-actions { width: 100%; margin-left: 52px; justify-content: flex-start; }
          .ap-backdrop { align-items: flex-end; padding: 0; }
          .ap-modal { max-width: 100%; max-height: 92vh; border-radius: 20px 20px 0 0; }
          .ap-footer { flex-wrap: wrap; }
          .ap-footer .ap-btn { flex: 1 1 140px; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) { .ap-backdrop, .ap-modal { transition: none; } }
      `}</style>
      </main>
  );
}
