import { useMemo, useState, useEffect } from "react";
import { Ambulance, MapPin, Plus, X, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { Badge } from "@/shared/components/ui/Badge";
import { GhostButton } from "@/shared/components/ui/Button";
import { platformService } from "@/services/platform.service";
import type { AmbulanceProviderAccount } from "@/types/platform";

const filters = ["all", "active", "suspended"] as const;

export function AdminAmbulanceProvidersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [providers, setProviders] = useState<AmbulanceProviderAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AmbulanceProviderAccount | null>(null);
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

  const handleOpenCreate = () => {
    setEditingProvider(null);
    setFormData({
      providerName: "", providerPhone: "", address: "",
      latitude: 23.8103, longitude: 90.4125, isActive: true,
      adminEmail: "", adminPhone: "", adminPassword: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AmbulanceProviderAccount) => {
    setEditingProvider(p);
    setFormData({
      providerName: p.providerName || "",
      providerPhone: p.providerPhone || "",
      address: p.address || "",
      latitude: p.latitude || 23.8103,
      longitude: p.longitude || 90.4125,
      isActive: p.isActive,
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
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Save failed", error);
      alert(error instanceof Error ? error.message : "Failed to save ambulance provider. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;
    try {
      await platformService.deleteAmbulanceProvider(id);
      await loadData();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete provider.");
    }
  };

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    try {
      await platformService.updateAmbulanceProvider(id, { isActive });
      await loadData();
    } catch (error) {
      console.error("Status update failed", error);
      alert("Failed to update status.");
    }
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return providers
      .filter((p) => {
        if (filter === "all") return true;
        if (filter === "active") return p.isActive;
        if (filter === "suspended") return !p.isActive;
        return true;
      })
      .filter((p) =>
        !needle ? true : [p.providerName, p.address, p.providerPhone].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, providers]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageHeader
          eyebrow="Providers"
          title="Ambulance Providers"
          subtitle={`${providers.length} registered providers · ${providers.filter((p) => !p.isActive).length} suspended`}
        />
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <Plus className="size-4" />
          Add Provider
        </button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search provider, address or phone…" />
        </div>

        <Table head={["Provider", "Location", "Registered", "Status", ""]}>
          {!isLoading && rows.length === 0 && <EmptyRow colSpan={5} label="No providers match your search." />}
          {isLoading && (
            <Tr>
              <Td colSpan={5}>
                <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
              </Td>
            </Tr>
          )}
          {!isLoading && rows.map((p) => (
            <Tr key={p.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary-container text-primary">
                    <Ambulance className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.providerName}</p>
                    <p className="text-[11px] text-muted-foreground">{p.id} · {p.providerPhone}</p>
                  </div>
                </div>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5" /> {p.address}
                </span>
              </Td>
              <Td className="tabular-nums text-muted-foreground">{p.registered}</Td>
              <Td><Badge status={p.isActive ? "verified" : "suspended"} /></Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => handleOpenEdit(p)}>
                    <Pencil className="size-4 mr-1" /> Edit
                  </GhostButton>
                  
                  {!p.isActive && (
                    <GhostButton tone="success" onClick={() => handleUpdateStatus(p.id, true)}>
                      Activate
                    </GhostButton>
                  )}
                  {p.isActive && (
                    <GhostButton tone="danger" onClick={() => handleUpdateStatus(p.id, false)}>
                      Suspend
                    </GhostButton>
                  )}
                  <GhostButton tone="danger" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="size-4" />
                  </GhostButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg">{editingProvider ? "Edit Ambulance Provider" : "Add New Provider"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-surface-variant text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <form id="provider-form" onSubmit={handleSave} className="space-y-6">
                
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
                      <select className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.isActive ? "true" : "false"} onChange={e => setFormData({...formData, isActive: e.target.value === "true"})}>
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                      </select>
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
              </form>
            </div>
            
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-variant/30">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-surface-variant transition border border-transparent"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="provider-form"
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Provider"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
