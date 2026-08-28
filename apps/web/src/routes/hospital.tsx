import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { HospitalLayout } from "@/layouts/HospitalLayout";
import { getStoredUser } from "@/services/auth";
import { useLocation } from "react-router-dom";

const hospitalHead = {
  title: "Hospital Dashboard · MedLink",
  description: "Coordinate emergency cases, beds, ICU and ambulances.",
};

export function HospitalRoute({ children }: { children: ReactNode }) {
  if (!getStoredUser()) return <Navigate to="/hospital/login" replace />;
  const location = useLocation();
  const isEmergencies = location.pathname === "/hospital/emergencies";
  const isBeds = location.pathname === "/hospital/beds";
  const isReservations = location.pathname === "/hospital/reservations";
  const isRequests = location.pathname === "/hospital/requests";
  const isPayments = location.pathname === "/hospital/payments";

  useEffect(() => {
    document.title = isEmergencies ? "Emergencies · Hospital Dashboard" : isBeds ? "Beds & ICU · Hospital Dashboard" : isReservations ? "Reservations · MedLink Hospital" : isRequests ? "Incoming Requests · MedLink Hospital" : isPayments ? "Payment Tracking · MedLink Hospital" : hospitalHead.title;
    const title = isRequests ? "Incoming Requests · MedLink Hospital" : document.title;
    const descriptionContent = isRequests ? "One inbox for consultations, tests, beds, ICU and emergencies." : isPayments ? "Service fees owed to MedLink, per patient and service." : hospitalHead.description;
    for (const [property, content] of [["og:title", title], ["og:description", descriptionContent]] as const) {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.append(tag);
      }
      tag.content = content;
    }
    let description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    description.content = isEmergencies ? "Live emergency case queue." : isBeds ? "Live bed and ICU availability." : isReservations ? "Approve bed and ICU reservations and track occupancy." : isRequests ? "Accept, reject and complete patient requests across all MedLink services." : isPayments ? "Track hospital charges, MedLink service fees and settlement status." : hospitalHead.description;
  }, [isBeds, isEmergencies, isReservations, isRequests, isPayments]);

  return <HospitalLayout>{children}</HospitalLayout>;
}