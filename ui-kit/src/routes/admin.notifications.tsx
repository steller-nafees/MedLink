import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Ban, Wallet, ServerCog } from "lucide-react";
import { PageHeader, Panel, FilterTabs } from "@/components/medlink/admin/admin-kit";
import { adminNotifications, type AdminNotification } from "@/lib/medlink/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · MedLink Super Admin" },
      { name: "description", content: "Platform-level notifications: registrations, suspensions, settlements and alerts." },
      { property: "og:title", content: "MedLink Admin Notifications" },
      { property: "og:description", content: "A clean feed of platform governance notifications." },
    ],
  }),
  component: Notifications,
});

const filters = ["all", "registration", "suspension", "settlement", "system"] as const;

const meta: Record<AdminNotification["kind"], { icon: typeof UserPlus; cls: string }> = {
  registration: { icon: UserPlus, cls: "bg-primary-container text-primary" },
  suspension: { icon: Ban, cls: "bg-destructive/10 text-destructive" },
  settlement: { icon: Wallet, cls: "bg-warning/10 text-warning" },
  system: { icon: ServerCog, cls: "bg-info/10 text-info" },
};

function Notifications() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const rows = adminNotifications.filter((n) => (filter === "all" ? true : n.kind === filter));

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle={`${adminNotifications.filter((n) => n.unread).length} unread platform notifications`}
        action={<FilterTabs options={filters} value={filter} onChange={setFilter} />}
      />

      <Panel bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {rows.map((n) => {
            const m = meta[n.kind];
            const Icon = m.icon;
            return (
              <li key={n.id} className={cn("flex gap-4 px-5 py-4", n.unread && "bg-primary-container/25")}>
                <div className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", m.cls)}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-semibold">{n.title}</p>
                    {n.unread && <span className="size-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
                <p className="shrink-0 text-[11.5px] text-muted-foreground">{n.time}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
