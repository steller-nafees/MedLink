import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DriverLangProvider } from "@/lib/medlink/driver-i18n";

export const Route = createFileRoute("/ambulance")({
  head: () => ({
    meta: [
      { title: "MedLink · Ambulance driver" },
      { name: "description", content: "Simple, high-contrast driver app for emergency dispatch, navigation and trip updates." },
      { property: "og:title", content: "MedLink Ambulance Driver" },
      { property: "og:description", content: "Receive dispatches, navigate and update trips in English or বাংলা." },
    ],
  }),
  component: () => (
    <DriverLangProvider>
      <div className="min-h-screen gradient-hero py-8">
        <Outlet />
      </div>
    </DriverLangProvider>
  ),
});
