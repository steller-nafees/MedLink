import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";

export const Route = createFileRoute("/hospital/staff")({
  head: () => ({ meta: [{ title: "Staff · Hospital Dashboard" }, { name: "description", content: "Manage clinical and dispatch staff." }] }),
  component: Staff,
});

const staff = [
  { name: "Dr. Amara Okafor", role: "Emergency Lead", dept: "Emergency", shift: "07:00 – 19:00", status: "on-duty" },
  { name: "Dr. Marcus Thorne", role: "Cardiologist", dept: "Cardiology", shift: "09:00 – 21:00", status: "on-duty" },
  { name: "Dr. Sarah Jenkins", role: "Trauma Surgeon", dept: "Trauma", shift: "08:00 – 20:00", status: "in-surgery" },
  { name: "Nurse Elena Park", role: "Head Nurse", dept: "ICU", shift: "07:00 – 19:00", status: "on-duty" },
  { name: "Dr. James Wilson", role: "Neurologist", dept: "Neurology", shift: "10:00 – 18:00", status: "off-duty" },
];
const tone: any = { "on-duty": "bg-success/10 text-success", "in-surgery": "bg-warning/10 text-warning", "off-duty": "bg-surface-variant text-muted-foreground" };

function Staff() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Staff</h1>
          <p className="text-[13px] text-muted-foreground">148 members · 84 on shift now</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search…" className="rounded-full border border-border bg-surface py-2 pl-9 pr-4 text-[13px] outline-none focus:border-primary" />
          </div>
          <button className="flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-float"><UserPlus className="size-4" /> Invite</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-card">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border/70 bg-surface-variant/60 text-[11px] uppercase tracking-widest text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Department</th>
              <th className="px-5 py-3 font-semibold">Shift</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.name} className="border-b border-border/60 last:border-0 hover:bg-surface-variant/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-full gradient-primary text-primary-foreground text-[12px] font-bold">
                      {s.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                    </div>
                    <span className="font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.role}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.dept}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.shift}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-widest ${tone[s.status]}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
