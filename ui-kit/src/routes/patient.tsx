import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "MedLink · Patient app" },
      { name: "description", content: "Request emergency services and manage your medical information." },
      { property: "og:title", content: "MedLink Patient" },
      { property: "og:description", content: "AI-assisted emergency care in your pocket." },
    ],
  }),
  component: () => (
    <div className="min-h-screen gradient-hero py-8">
      <Outlet />
    </div>
  ),
});
