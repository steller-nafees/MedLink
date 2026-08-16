import { createFileRoute } from "@tanstack/react-router";
import { PatientShell, ScreenHeader } from "@/components/medlink/patient-shell";
import { notifications } from "@/lib/medlink/data";
import { Bell, CheckCheck, Truck, BedDouble, Bot, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { incomingDonorRequest } from "@/lib/medlink/blood";
import { DonorRequestCard } from "@/components/medlink/blood/blood-kit";

export const Route = createFileRoute("/patient/notifications")({
  head: () => ({ meta: [{ title: "Notifications · MedLink Patient" }, { name: "description", content: "Real-time updates about your care." }] }),
  component: Notif,
});

const iconMap = { emergency: Truck, success: BedDouble, info: Bot, muted: FileText };

function Notif() {
  return (
    <PatientShell label="Patient · Notifications">
      <ScreenHeader
        title="Notifications"
        subtitle="Real-time updates"
        right={<button className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-semibold"><CheckCheck className="size-3.5" /> Mark all</button>}
      />
      <div className="mx-5 mb-3">
        <DonorRequestCard
          hospitalName={incomingDonorRequest.hospitalName}
          group={incomingDonorRequest.group}
          urgency={incomingDonorRequest.urgency}
          units={incomingDonorRequest.units}
          phone={incomingDonorRequest.requesterPhone}
        />
      </div>
      <div className="mx-5 space-y-2.5">
        {notifications.map((n) => {
          const Icon = iconMap[n.tone];
          const tone = n.tone === "emergency" ? "bg-emergency/10 text-emergency" : n.tone === "success" ? "bg-success/10 text-success" : n.tone === "info" ? "bg-primary-container text-primary" : "bg-surface-variant text-foreground/70";
          return (
            <div key={n.id} className={cn("flex gap-3 rounded-3xl border border-border/70 bg-surface p-4 shadow-card", n.tone === "emergency" && "ring-1 ring-emergency/20")}>
              <div className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", tone)}><Icon className="size-5" /></div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-semibold">{n.title}</p>
                  <p className="text-[10.5px] text-muted-foreground">{n.time}</p>
                </div>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{n.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-col items-center gap-2 px-5 py-6">
        <Bell className="size-6 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">You're all caught up.</p>
      </div>
    </PatientShell>
  );
}
