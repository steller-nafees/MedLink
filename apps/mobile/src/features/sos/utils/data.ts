// MedLink Enterprise — SOS Emergency demo dataset (all fictional)

export type Severity = 'critical' | 'high' | 'moderate' | 'low';

export type Hospital = {
  id: string;
  name: string;
  tier: 'A' | 'B' | 'C'; // A = preferred/partner hospital
  distanceKm: number;
  etaMin: number;
  address: string;
  rating: number;
  phone: string;
  departments: string[];
  beds: { total: number; available: number };
  icu: { total: number; available: number };
  emergency: boolean;
  bloodBank: string[];
  /** Position on the shared, illustrative patient map. */
  coord: { x: number; y: number };
};

export const hospitals: Hospital[] = [
  {
    id: 'h-evercare',
    name: 'Evercare Hospital Dhaka',
    tier: 'A',
    distanceKm: 2.1,
    etaMin: 8,
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka',
    rating: 4.8,
    phone: '+880 2 8431065',
    departments: ['Emergency', 'Cardiology', 'Trauma', 'Neurology', 'ICU'],
    beds: { total: 300, available: 58 },
    icu: { total: 40, available: 9 },
    emergency: true,
    bloodBank: ['O-', 'O+', 'A+', 'B+', 'AB+'],
    coord: { x: 50, y: 40 },
  },
  {
    id: 'h-square',
    name: 'Square Hospital',
    tier: 'A',
    distanceKm: 3.4,
    etaMin: 11,
    address: '18/F, West Panthapath, Dhaka',
    rating: 4.7,
    phone: '+880 2 8144400',
    departments: ['Emergency', 'Cardiology', 'Oncology', 'ICU'],
    beds: { total: 450, available: 70 },
    icu: { total: 50, available: 11 },
    emergency: true,
    bloodBank: ['O+', 'A+', 'A-', 'B+'],
    coord: { x: 40, y: 30 },
  },
  {
    id: 'h-united',
    name: 'United Hospital',
    tier: 'A',
    distanceKm: 4.0,
    etaMin: 13,
    address: 'Plot 15, Road 71, Gulshan, Dhaka',
    rating: 4.6,
    phone: '+880 2 8836000',
    departments: ['Emergency', 'Cardiology', 'Nephrology', 'ICU'],
    beds: { total: 500, available: 90 },
    icu: { total: 45, available: 7 },
    emergency: true,
    bloodBank: ['O+', 'A+', 'B+', 'AB+'],
    coord: { x: 62, y: 25 },
  },
  {
    id: 'h-labaid',
    name: 'Labaid Specialized Hospital',
    tier: 'B',
    distanceKm: 5.2,
    etaMin: 16,
    address: 'House 1, Road 4, Dhanmondi, Dhaka',
    rating: 4.4,
    phone: '+880 2 9676356',
    departments: ['Emergency', 'Diagnostics', 'Cardiology', 'General'],
    beds: { total: 250, available: 30 },
    icu: { total: 20, available: 3 },
    emergency: true,
    bloodBank: ['O+', 'A+', 'B+'],
    coord: { x: 30, y: 60 },
  },
  {
    id: 'h-dmch',
    name: 'Dhaka Medical College Hospital',
    tier: 'B',
    distanceKm: 6.0,
    etaMin: 19,
    address: 'Secretariat Rd, Dhaka',
    rating: 4.1,
    phone: '+880 2 55165088',
    departments: ['Emergency', 'Trauma', 'General', 'ICU'],
    beds: { total: 2300, available: 150 },
    icu: { total: 60, available: 5 },
    emergency: true,
    bloodBank: ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    coord: { x: 45, y: 70 },
  },
  {
    id: 'h-ibnsina',
    name: 'Ibn Sina Hospital',
    tier: 'C',
    distanceKm: 7.1,
    etaMin: 22,
    address: 'House 48, Road 9/A, Dhanmondi, Dhaka',
    rating: 4.3,
    phone: '+880 2 9611315',
    departments: ['General', 'Orthopedics', 'Diagnostics'],
    beds: { total: 150, available: 18 },
    icu: { total: 10, available: 1 },
    emergency: false,
    bloodBank: ['O+', 'A+'],
    coord: { x: 20, y: 45 },
  },
];

export type Ambulance = {
  id: string;
  callSign: string;
  reg: string;
  provider: string;
  driver: string;
  type: 'ALS' | 'BLS' | 'Critical Care';
  crew: string;
  etaMin: number;
  distanceKm: number;
  phone: string;
  status: 'available' | 'en_route' | 'on_scene' | 'returning';
};

export const ambulances: Ambulance[] = [
  {
    id: 'a-01',
    callSign: 'Unit 12',
    reg: 'Dhaka Metro Cha 11-1111',
    provider: 'MedLink Emergency Services',
    driver: 'Md. Kamal Hossain',
    type: 'ALS',
    crew: 'Medical Officer Dr. Farhan Kabir · Paramedic Rakib Hasan',
    etaMin: 4,
    distanceKm: 1.1,
    phone: '+880 1712-334455',
    status: 'available',
  },
  {
    id: 'a-02',
    callSign: 'Unit 07',
    reg: 'Dhaka Metro Cha 22-4519',
    provider: 'City Care Ambulance',
    driver: 'Md. Rashed Mia',
    type: 'BLS',
    crew: 'EMT Shanto Das · EMT Jannatul Ferdous',
    etaMin: 6,
    distanceKm: 2.3,
    phone: '+880 1819-776543',
    status: 'available',
  },
  {
    id: 'a-03',
    callSign: 'Unit 21',
    reg: 'Dhaka Metro Cha 33-7802',
    provider: 'LifeLine Rescue',
    driver: 'Md. Sohel Rana',
    type: 'BLS',
    crew: 'EMT Rakib Hasan · Emergency Care Assistant Nur Islam',
    etaMin: 9,
    distanceKm: 3.4,
    phone: '+880 1933-220087',
    status: 'en_route',
  },
];

export const emergencySuggestions = [
  'My grandmother had a heart attack.',
  'Severe allergic reaction, face swelling.',
  'Car accident, head injury.',
  'High fever and seizure in a child.',
];

export const SOS_COORDINATION_FEE_BDT = 1000;
