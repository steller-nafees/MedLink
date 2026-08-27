import { UserPlus, Ban, Wallet, ServerCog, type LucideIcon } from "lucide-react";
import type { AdminNotification } from "@/types/platform";

const meta: Record<AdminNotification["kind"], { icon: LucideIcon; cls: string }> = {
  registration: { icon: UserPlus, cls: "bg-primary-container text-primary" },
  suspension: { icon: Ban, cls: "bg-destructive/10 text-destructive" },
  settlement: { icon: Wallet, cls: "bg-warning/10 text-warning" },
  system: { icon: ServerCog, cls: "bg-info/10 text-info" },
};

interface NotificationListProps {
  notifications: AdminNotification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        No notifications found.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {notifications.map((n) => {
        const m = meta[n.kind];
        const Icon = m.icon;
        
        return (
          <li
            key={n.id}
            className={`flex gap-4 px-5 py-4 ${n.unread ? "bg-primary-container/25" : ""}`}
          >
            <div
              className={`grid size-10 shrink-0 place-items-center rounded-2xl ${m.cls}`}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-semibold">{n.title}</p>
                {n.unread && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {n.body}
              </p>
            </div>
            <p className="shrink-0 text-[11.5px] text-muted-foreground">
              {n.time}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
