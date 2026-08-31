import { useMemo, useState, useEffect } from "react";
import { Building2, MapPin, Plus, X, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { Table, Td, Tr, EmptyRow } from "@/shared/components/ui/Table";
import { Badge, TypeChip } from "@/shared/components/ui/Badge";
import { GhostButton } from "@/shared/components/ui/Button";
import { platformService } from "@/services/platform.service";
import type { HospitalAccount } from "@/types/platform";

const filters = ["all", "verified", "pending", "suspended"] as const;

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
      if (editingHospital) {
        await platformService.updateHospital(editingHospital.id, {
          hospitalName: formData.hospitalName,
          licenseNumber: formData.licenseNumber,
          email: formData.email,
          phone: formData.phone,
          website: formData.website || undefined,
          address: formData.address,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          hospitalStatus: formData.hospitalStatus,
          description: formData.description,
        });
      } else {
        await platformService.createHospital({
          hospital: {
            hospitalName: formData.hospitalName,
            licenseNumber: formData.licenseNumber,
            email: formData.email,
            phone: formData.phone,
            website: formData.website || undefined,
            address: formData.address,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            hospitalStatus: formData.hospitalStatus,
            description: formData.description,
          },
          admin: {
            email: formData.adminEmail,
            phone: formData.adminPhone,
            password: formData.adminPassword
          }
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save hospital. Check console for details.");
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
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageHeader
          eyebrow="Providers"
          title="Hospital management"
          subtitle={`${hospitals.length} registered hospitals · ${hospitals.filter((h) => h.verification === "pending").length} awaiting verification`}
        />
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <Plus className="size-4" />
          Add Hospital
        </button>
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search hospital, type or city…" />
        </div>

        <Table head={["Hospital", "Type", "Location", "Registered", "Verification", ""]}>
          {!isLoading && rows.length === 0 && <EmptyRow colSpan={6} label="No hospitals match your search." />}
          {isLoading && (
            <Tr>
              <Td colSpan={6}>
                <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
              </Td>
            </Tr>
          )}
          {!isLoading && rows.map((h) => (
            <Tr key={h.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary-container text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{h.name}</p>
                    <p className="text-[11px] text-muted-foreground">{h.id} · {h.contact}</p>
                  </div>
                </div>
              </Td>
              <Td><TypeChip label={h.type} /></Td>
              <Td>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3.5" /> {h.location}
                </span>
              </Td>
              <Td className="tabular-nums text-muted-foreground">{h.registered}</Td>
              <Td><Badge status={h.verification} /></Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => handleOpenEdit(h)}>
                    <Pencil className="size-4 mr-1" /> Edit
                  </GhostButton>
                  
                  {h.verification !== "verified" && (
                    <GhostButton tone="success" onClick={() => handleUpdateStatus(h.id, "OPEN")}>
                      Approve
                    </GhostButton>
                  )}
                  {h.verification !== "suspended" && (
                    <GhostButton tone="danger" onClick={() => handleUpdateStatus(h.id, "CLOSED")}>
                      Suspend
                    </GhostButton>
                  )}
                  <GhostButton tone="danger" onClick={() => handleDelete(h.id)}>
                    <Trash2 className="size-4" />
                  </GhostButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>

      {/* Basic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg">{editingHospital ? "Edit Hospital" : "Add New Hospital"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-surface-variant text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <form id="hospital-form" onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Hospital Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hospital Name *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.hospitalName} onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">License Number *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hospital Email *</label>
                      <input required type="email" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hospital Phone *</label>
                      <input required type="text" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium">Website</label>
                      <input type="url" className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
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
                      <select className="w-full p-2 rounded-md border border-input bg-background text-sm" value={formData.hospitalStatus} onChange={e => setFormData({...formData, hospitalStatus: e.target.value})}>
                        <option value="OPEN">Open (Verified)</option>
                        <option value="CLOSED">Closed (Suspended)</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea className="w-full p-2 rounded-md border border-input bg-background h-20 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                </div>

                {!editingHospital && (
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
                form="hospital-form"
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Hospital"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
