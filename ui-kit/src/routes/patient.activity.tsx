import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PatientShell, ScreenHeader } from "@/components/medlink/patient-shell";
import { serviceRequests, type ServiceRequest } from "@/lib/medlink/data";
import { RequestCard } from "@/components/medlink/request-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/activity")({
  head: () => ({
    meta: [
      { title: "Activity · MedLink Patient" },
      { name: "description", content: "Track your emergency SOS requests with MedLink." },
    ],
  }),
  component: Activity,
});

const filters = ["Emergency", "Bookings"] as const;

function Activity() {
  const [tab, setTab] = useState<(typeof filters)[number]>("Emergency");

  const emergencyRequests = serviceRequests.filter((r: ServiceRequest) => r.kind === "emergency");

  return (
    <PatientShell label="Patient · Activity">
      <ScreenHeader title="Activity" subtitle="Your emergency SOS requests, in one place" />

      {/* Filters */}
      <div className="no-scrollbar mt-1 flex gap-2 overflow-x-auto px-5">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => f === "Emergency" && setTab(f)}
            disabled={f === "Bookings"}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-semibold transition active:scale-95",
              tab === f
                ? "border-transparent bg-foreground text-background"
                : "border-border/60 bg-surface text-muted-foreground",
              f === "Bookings" && "opacity-60 cursor-not-allowed active:scale-100"
            )}
          >
            {f}
            {f === "Bookings" && (
              <span className="rounded-full bg-primary-container px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-primary">
                Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Emergency" && (
        <div className="mt-4 space-y-2.5 px-5">
          {emergencyRequests.map((r) => (
            <RequestCard key={r.id} req={r} />
          ))}
          {!emergencyRequests.length && (
            <p className="py-10 text-center text-[13px] text-muted-foreground">No emergency activity yet.</p>
          )}
        </div>
      )}

      {tab === "Bookings" && (
        <div className="mt-4 px-5">
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border/60 bg-surface py-14 text-center">
            <span className="mb-2 rounded-full bg-primary-container px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              Coming Soon
            </span>
            <p className="max-w-[220px] text-[13px] text-muted-foreground">
              Bookings for beds, ICU and diagnostics will show up here.
            </p>
          </div>
        </div>
      )}
    </PatientShell>
  );
}