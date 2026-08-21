export const mockData = {
  driverName: { en: "Abdul Karim", bn: "আবদুল করিম" },
  driverPhone: "01712-334455",
  ambulanceId: "AM-2287",
  ambulanceReg: "Dhaka Metro Cha 11-1111",
  ambulanceType: { en: "ALS", bn: "এএলএস" },
  ambulanceTypeLabel: { en: "Advanced Life Support", bn: "অ্যাডভান্সড লাইফ সাপোর্ট" },
  ambulanceProvider: { en: "MedLink Ambulance Services", bn: "মেডলিংক অ্যাম্বুলেন্স সার্ভিস" },
  ambulanceStatus: "active" as const,
  shift: {
    en: "Morning Shift (06:00 - 14:00)",
    bn: "সকালের শিফট (০৬:০০ - ১৪:০০)",
  },
  lastLocation: {
    address: {
      en: "Bashundhara Residential Area, Dhaka",
      bn: "বসুন্ধরা আবাসিক এলাকা, ঢাকা",
    },
    updated: {
      en: "Updated 12 seconds ago",
      bn: "১২ সেকেন্ড আগে আপডেট হয়েছে",
    },
  },
  stats: {
    tripsToday: "7",
    avgResponseMinutes: "6",
    rating: "4.9",
  },
  incomingRequest: {
    type: {
      en: "Cardiac Emergency",
      bn: "হৃদরোগ জরুরি",
    },
    patient: {
      en: "Eleanor Chen · 74",
      bn: "এলিনর চেন · ৭৪",
    },
    pickup: {
      en: "412 Elmwood Ave",
      bn: "৪১২ এলমউড অ্যাভিনিউ",
    },
    destination: {
      en: "St. Mercy Medical",
      bn: "সেন্ট মার্সি মেডিকেল",
    },
    contact: "+880 1712-334455",
  },
  navigation: {
    nextTurn: {
      distance: "400 m",
      instruction: {
        en: "Turn right onto Elmwood Ave",
        bn: "ডানে মোড় নিন এলমউড অ্যাভিনিউতে",
      }
    },
    destination: {
      name: {
        en: "St. Mercy Medical Center",
        bn: "সেন্ট মার্সি মেডিকেল সেন্টার",
      },
      etaMinutes: 4,
      distance: "1.1 km"
    },
    route: {
      from: { x: 40, y: 62 },
      to: { x: 42, y: 38 },
    },
    markers: [
      { x: 40, y: 62, kind: "ambulance" as const, label: { en: "You", bn: "আপনি" } },
      { x: 52, y: 70, kind: "patient" as const, label: { en: "Pickup", bn: "পিকআপ" } },
      { x: 42, y: 38, kind: "hospital" as const, label: { en: "Mercy", bn: "মার্সি" } },
    ]
  },
  trip: {
    emergencyNotes: {
      en: "Chest pain for 25 minutes. Aspirin given. Family present at pickup.",
      bn: "২৫ মিনিট ধরে বুকে ব্যথা। অ্যাসপিরিন দেওয়া হয়েছে। পরিবার উপস্থিত।"
    },
    department: {
      en: "Cardiology",
      bn: "কার্ডিওলজি"
    },
    hospital: {
      name: {
        en: "St. Mercy Medical Center",
        bn: "সেন্ট মার্সি মেডিকেল সেন্টার"
      },
      address: {
        en: "412 Elmwood Ave · Downtown",
        bn: "৪১২ এলমউড অ্যাভিনিউ · ডাউনটাউন"
      },
      phone: "+880 9611-556677",
      department: {
        en: "Emergency · Cardiology",
        bn: "জরুরি · কার্ডিওলজি"
      }
    }
  },
  tripHistory: [
    {
      icon: "HeartPulse",
      tone: "emergency" as const,
      date: { en: "Today · 10:14 AM", bn: "আজ · সকাল ১০:১৪" },
      type: { en: "Cardiac Emergency", bn: "হৃদরোগ জরুরি" },
      hospital: { en: "St. Mercy Medical", bn: "সেন্ট মার্সি মেডিকেল" },
      dur: { en: "12 min", bn: "১২ মিনিট" }
    },
    {
      icon: "Wind",
      tone: "warning" as const,
      date: { en: "Today · 08:22 AM", bn: "আজ · সকাল ০৮:২২" },
      type: { en: "Respiratory", bn: "শ্বাসকষ্ট" },
      hospital: { en: "Northshore Regional", bn: "নর্থশোর রিজিওনাল" },
      dur: { en: "9 min", bn: "৯ মিনিট" }
    },
    {
      icon: "Bandage",
      tone: "info" as const,
      date: { en: "Yesterday · 07:12 PM", bn: "গতকাল · সন্ধ্যা ০৭:১২" },
      type: { en: "Laceration", bn: "কাটা ক্ষত" },
      hospital: { en: "City General", bn: "সিটি জেনারেল" },
      dur: { en: "18 min", bn: "১৮ মিনিট" }
    }
  ],
  notifications: [
    {
      icon: "Siren",
      tone: "emergency" as const,
      titleKey: "newRequest",
      body: { en: "Cardiac emergency · 1.1 km away", bn: "হৃদরোগ জরুরি · ১.১ কিমি দূরে" },
      time: { en: "Just now", bn: "এইমাত্র" },
      unread: true
    },
    {
      icon: "Building2",
      tone: "info" as const,
      titleKey: "nHospitalUpdated",
      body: { en: "Destination changed to St. Mercy Medical", bn: "গন্তব্য পরিবর্তন: সেন্ট মার্সি মেডিকেল" },
      time: { en: "12 min ago", bn: "১২ মিনিট আগে" },
      unread: true
    },
    {
      icon: "UserX",
      tone: "warning" as const,
      titleKey: "nCancelled",
      body: { en: "Trip #AM-2288 cancelled by patient", bn: "ট্রিপ #AM-2288 রোগী বাতিল করেছে" },
      time: { en: "1 hour ago", bn: "১ ঘণ্টা আগে" }
    },
    {
      icon: "CheckCircle2",
      tone: "success" as const,
      titleKey: "nCompleted",
      body: { en: "Trip #AM-2287 · 14 min", bn: "ট্রিপ #AM-2287 · ১৪ মিনিট" },
      time: { en: "3 hours ago", bn: "৩ ঘণ্টা আগে" }
    }
  ]
};
