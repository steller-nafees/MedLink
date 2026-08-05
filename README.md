# 🚑 MedLink - Connecting Care, Saving Lives

MedLink is an integrated healthcare emergency response platform designed to connect patients, hospitals, ambulances, and administrators through a unified digital ecosystem.

The platform aims to reduce emergency response times, improve hospital resource management, and provide real-time healthcare coordination.

---

## Project Overview

MedLink consists of:

### Mobile Application (Expo + React Native)

#### Patient Portal
- SOS Emergency Requests
- Hospital Discovery
- Hospital Reservations
- Ambulance Tracking
- AI Health Assistant
- Notifications
- Profile Management

#### Ambulance Portal
- Emergency Dispatch Management
- Navigation & Tracking
- Trip History
- Notifications
- Driver Profile

---

### Web Application (Next.js)

#### Hospital Dashboard
- Emergency Queue Management
- Bed Availability
- Ambulance Requests
- Reservations
- Staff Management
- Analytics

#### Admin Dashboard
- User Management
- Hospital Verification
- Ambulance Monitoring
- System Analytics
- Revenue Reports
- Notifications

---

## Tech Stack

### Frontend

- React Native
- Expo
- Expo Router
- TypeScript

### Web

- Next.js
- React
- TypeScript

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Docker

### Shared Packages

- Shared Types
- Validation Schemas
- API Client
- UI Components
- Realtime Events

---

## Monorepo Structure

```text
medlink/
│
├── apps/
│   ├── mobile/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── shared-types/
│   ├── shared-validation/
│   ├── realtime-events/
│   ├── env-config/
│   ├── shared-utils/
│   ├── api-client/
│   ├── eslint-config/
│   └── tsconfig/
│
├── tooling/
│
├── docs/
│
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/steller-nafees/MedLink.git
cd MedLink
```

### Install Dependencies

```bash
npm install
```

### Start Database

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

### Run Mobile Application

```bash
cd apps/mobile
npm start
```

---

## Development Workflow

Update local repository:

```bash
git checkout main
git pull origin main
```

Create feature branch:

```bash
git checkout -b feature/your-feature-name
```

Push feature branch:

```bash
git push origin feature/your-feature-name
```
Commit Style:

```bash
feat:
fix:
docs:
refactor:
test:
chore:
```


Create Pull Request on GitHub.

---

## Git Branch Strategy

```text
main
│
├── feature/*
├── bugfix/*
└── hotfix/*
```

### Rules

- Never push directly to `main`
- Use Pull Requests
- Use Conventional Commits
- Keep branches focused on a single feature

---

## Docker Database

Development Database:

```env
POSTGRES_USER=medlink
POSTGRES_PASSWORD=MedLink@2026
POSTGRES_DB=medlink
```

Connection String:

```env
DATABASE_URL=postgresql://medlink:MedLink2026@localhost:5432/medlink
```

---

## Contributors

### Team MedLink

- Project Lead - H M Nafees N Islam
- Mobile Developers - H M Nafees N Islam, Shanjida Ahmed
- Backend Developers - Hasan Md. Turabi Rahman, Sanjida Sultana Iffat
- Web Developers - H M Nafees N Islam, Shanjida Ahmed
- UI/UX Designers - H M Nafees N Islam

---

## License

This project is licensed under the MIT License.
