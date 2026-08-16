import { Outlet, createFileRoute } from "@tanstack/react-router";
import { WebShell, type NavItem } from "@/components/medlink/web-shell";
import {
  LayoutDashboard,
  Inbox,
  BedDouble,
  CreditCard,
  Siren,
  Truck,
  Droplet,
} from "lucide-react";
import { emergencyQueue, hospitalRequests } from "@/lib/medlink/data";

export const Route = createFileRoute("/hospital")({
  head: () => ({
    meta: [
      { title: "Hospital Dashboard · MedLink" },
      {
        name: "description",
        content: "Coordinate emergency cases, beds, ICU and ambulances.",
      },
      { property: "og:title", content: "MedLink Hospital" },
      {
        property: "og:description",
        content: "Real-time hospital command center.",
      },
    ],
  }),

  component: () => {
    const nav: NavItem[] = [
      {
        to: "/hospital",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        to: "/hospital/payments",
        label: "Payments",
        icon: CreditCard,
      },
      {
        to: "/hospital/emergencies",
        label: "Emergencies",
        icon: Siren,
        badge: emergencyQueue.filter(
          (e) => e.status !== "completed" && e.status !== "arrived"
        ).length,
      },
      {
        to: "/hospital/beds",
        label: "Beds & ICU",
        icon: BedDouble,
      },
      {
        to: "/hospital/ambulances",
        label: "Ambulances",
        icon: Truck,
      },
      {
        to: "/hospital/requests",
        label: "Requests",
        icon: Inbox,
        badge: "Coming Soon",
      },
      {
        to: "/hospital/blood",
        label: "Blood",
        icon: Droplet,
        badge: "Coming Soon",
      },
    ];

    return (
      <WebShell
        role="Hospital"
        nav={nav}
        user={{
          name: "Dr. Amara Okafor",
          role: "Emergency Lead · St. Mercy",
        }}
      >
        <Outlet />
      </WebShell>
    );
  },
});