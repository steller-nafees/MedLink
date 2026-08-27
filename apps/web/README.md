# MedLink Web

MedLink Web is the browser-based dashboard application for the MedLink healthcare platform.

The web application provides role-based dashboards and management interfaces for:

- Hospital staff
- System administrators

The mobile application is responsible for patient and ambulance workflows, while the web application focuses on operational and administrative workflows.

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- CSS / reusable UI components
- REST API integration

---

## Project Structure

```text
apps/web/
├── public/
├── src/
│   ├── app/
│   │   └── Application-level configuration
│   │
│   ├── assets/
│   │   └── Static images and assets
│   │
│   ├── features/
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── dashboard/
│   │   │   ├── drivers/
│   │   │   ├── hospitals/
│   │   │   ├── notifications/
│   │   │   ├── users/
│   │   │   └── verification/
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   └── hospital/
│   │       ├── beds/
│   │       ├── dashboard/
│   │       ├── emergencies/
│   │       ├── notifications/
│   │       ├── payments/
│   │       └── requests/
│   │
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── HospitalLayout.tsx
│   │
│   ├── routes/
│   │   ├── admin.tsx
│   │   ├── auth.tsx
│   │   ├── hospital.tsx
│   │   └── index.tsx
│   │
│   ├── services/
│   │   └── API and backend service integrations
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   ├── charts/
│   │   │   ├── forms/
│   │   │   ├── tables/
│   │   │   └── ui/
│   │   │
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── theme/
│   │   └── utils/
│   │
│   ├── store/
│   │   └── Global application state
│   │
│   ├── types/
│   │   └── Shared TypeScript types
│   │
│   └── utils/
│       └── General utility functions
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
