import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patient/auth")({
  head: () => ({
    meta: [
      { title: "Get started · MedLink" },
      { name: "description", content: "Onboarding, sign in and guest Emergency SOS access for MedLink." },
      { property: "og:title", content: "Get started with MedLink" },
      { property: "og:description", content: "Emergency SOS without an account, plus a calm sign-in experience." },
    ],
  }),
  component: () => <Outlet />,
});
