import { useState, useEffect } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { FilterTabs } from "@/shared/components/ui/FilterTabs";
import { NotificationList } from "@/shared/components/ui/NotificationList";
import { platformService } from "@/services/platform.service";
import type { AdminNotification } from "@/types/platform";

const filters = ["all", "registration", "suspension", "settlement", "system"] as const;

export function AdminNotificationsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await platformService.getAdminNotifications();
      setNotifications(data);
    }
    loadData();
  }, []);

  const rows = notifications.filter((n) => (filter === "all" ? true : n.kind === filter));
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle={`${unreadCount} unread platform notifications`}
        action={<FilterTabs options={filters} value={filter} onChange={setFilter} />}
      />

      <Card bodyClassName="p-0">
        <NotificationList notifications={rows} />
      </Card>
    </div>
  );
}
