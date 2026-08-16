import { createFileRoute } from "@tanstack/react-router";
import { MedlinkSplash } from "@/components/medlink/splash";

export const Route = createFileRoute("/patient/auth/splash")({
  head: () => ({
    meta: [
      { title: "MedLink · Emergency Healthcare. Connected." },
      { name: "description", content: "MedLink splash — connecting patients, hospitals and ambulances." },
      { property: "og:title", content: "MedLink — Emergency Healthcare. Connected." },
      { property: "og:description", content: "Connecting patients, hospitals and ambulances." },
    ],
  }),
  component: () => <MedlinkSplash next="/patient/auth/onboarding" />,
});
