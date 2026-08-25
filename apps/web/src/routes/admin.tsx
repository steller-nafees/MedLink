import { useEffect, type ReactNode } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";

const adminHead = {
  title: "Super Admin · MedLink Platform Console",
  description: "Govern the MedLink platform: verification, users, revenue and system health.",
  ogTitle: "MedLink Super Admin",
  ogDescription: "Platform governance, verification and revenue monitoring."
};

export function AdminRoute({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = adminHead.title;
    
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = adminHead.description;

    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.append(ogTitle);
    }
    ogTitle.content = adminHead.ogTitle;

    let ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.append(ogDescription);
    }
    ogDescription.content = adminHead.ogDescription;
  }, []);

  return <AdminLayout>{children}</AdminLayout>;
}
