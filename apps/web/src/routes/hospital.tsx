import { useEffect, type ReactNode } from "react";
import { HospitalLayout } from "@/layouts/HospitalLayout";

export const hospitalHead = {
  title: "Hospital Dashboard · MedLink",
  description: "Coordinate emergency cases, beds, ICU and ambulances.",
};

export function HospitalRoute({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = hospitalHead.title;
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = hospitalHead.description;
  }, []);

  return <HospitalLayout>{children}</HospitalLayout>;
}