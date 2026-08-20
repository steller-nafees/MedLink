// Ported from ui-kit/src/routes/patient.profile.tsx and its referenced mock data.
export const profileMock = {
  personal: {
    fullName: "Shirley Ramirez",
    dob: "14 March 1992",
    gender: "Female",
    blood: "O+",
    address: "1420 Bayview Terrace, San Francisco",
  },
  email: "shirley.ramirez@mail.com",
  phone: "+1 (415) 555-0134",
  initials: "SR",
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Asthma"],
  medications: ["Albuterol inhaler", "Vitamin D"],
  contacts: [
    { id: "c1", name: "Miguel Ramirez", relation: "Spouse", phone: "+1 (415) 555-0007" },
    { id: "c2", name: "Dr. Amara Osei", relation: "Family physician", phone: "+1 (415) 555-0181" },
  ],
  donation: { group: "O+", lastDonation: "2026-05-20", available: true },
} as const;

export type ProfileContact = { id: string; name: string; relation: string; phone: string };
