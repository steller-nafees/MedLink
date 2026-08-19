import { createFileRoute } from "@tanstack/react-router";
import { MedlinkSplash } from "@/components/medlink/splash";

export const Route = createFileRoute("/ambulance/splash")({
  head: () => ({
    meta: [
      { title: "MedLink Ambulance · Loading" },
      { name: "description", content: "MedLink ambulance driver splash screen." },
      { property: "og:title", content: "MedLink Ambulance" },
      { property: "og:description", content: "Loading the ambulance driver app." },
    ],
  }),
  component: () => <MedlinkSplash next="/ambulance" />,
});
