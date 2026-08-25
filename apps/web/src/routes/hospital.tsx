import { useEffect, type ReactNode } from "react";
import { HospitalLayout } from "@/layouts/HospitalLayout";
import { useLocation } from "react-router-dom";

const hospitalHead = {
  title: "Hospital Dashboard · MedLink",
  description: "Coordinate emergency cases, beds, ICU and ambulances.",
};

export function HospitalRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isEmergencies = location.pathname === "/hospital/emergencies";
  const isBeds = location.pathname === "/hospital/beds";

  useEffect(() => {
    document.title = isEmergencies ? "Emergencies · Hospital Dashboard" : isBeds ? "Beds & ICU · Hospital Dashboard" : hospitalHead.title;
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = isEmergencies ? "Live emergency case queue." : isBeds ? "Live bed and ICU availability." : hospitalHead.description;
  }, [isBeds, isEmergencies]);

  return <HospitalLayout>{children}</HospitalLayout>;
}