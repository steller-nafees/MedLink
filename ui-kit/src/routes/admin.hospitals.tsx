import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import {
  PageHeader,
  Panel,
  SearchInput,
  FilterTabs,
  DataTable,
  Td,
  Tr,
  StatusPill,
  TypeChip,
  GhostButton,
  EmptyRow,
} from "@/components/medlink/admin/admin-kit";
import { hospitalAccounts, type HospitalAccount } from "@/lib/medlink/admin-data";

export const Route = createFileRoute("/admin/hospitals")({
  head: () => ({
    meta: [
      { title: "Hospital Management · MedLink Super Admin" },
      { name: "description", content: "Review, approve and suspend hospitals registered on MedLink." },
      { property: "og:title", content: "MedLink Hospital Management" },
      { property: "og:description", content: "Verification status and details for registered hospitals." },
    ],
  }),
  component: HospitalsPage,
});

const filters = ["all", "verified", "pending", "suspended"] as const;

function HospitalsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [overrides, setOverrides] = useState<Record<string, HospitalAccount["verification"]>>({});

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return hospitalAccounts
      .map((h) => ({ ...h, verification: overrides[h.id] ?? h.verification }))
      .filter((h) => (filter === "all" ? true : h.verification === filter))
      .filter((h) =>
        !needle ? true : [h.name, h.location, h.type, h.contact].some((v) => v.toLowerCase().includes(needle))
      );
  }, [q, filter, overrides]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Providers"
        title="Hospital management"
        subtitle={`${hospitalAccounts.length} registered hospitals · ${hospitalAccounts.filter((h) => h.verification === "pending").length} awaiting verification`}
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
          <FilterTabs options={filters} value={filter} onChange={setFilter} />
          <SearchInput value={q} onChange={setQ} placeholder="Search hospital, type or city…" />
        </div>

        <DataTable head={["Hospital", "Type", "Location", "Registered", "Verification", ""]}>
          {rows.length === 0 && <EmptyRow colSpan={6} label="No hospitals match your search." />}
          {rows.map((h) => (
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
              <Td><StatusPill status={h.verification} /></Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <GhostButton>View details</GhostButton>
                  {h.verification !== "verified" && (
                    <GhostButton tone="success" onClick={() => setOverrides((o) => ({ ...o, [h.id]: "verified" }))}>
                      Approve
                    </GhostButton>
                  )}
                  {h.verification !== "suspended" && (
                    <GhostButton tone="danger" onClick={() => setOverrides((o) => ({ ...o, [h.id]: "suspended" }))}>
                      Suspend
                    </GhostButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
