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

### Web Application (React.js)

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

- React.js
- Vite
- TypeScript

### Backend

- Javascript
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
│   │
│   ├── mobile/                 # React Native + Expo
│   │
│   ├── web/                    # React.js + Vite
│   │   ├── src/
│   │   │   ├── admin/
│   │   │   ├── hospital/
│   │   │   ├── shared/
│   │   │   ├── routes/
│   │   │   └── layouts/
│   │   │
│   │   └── public/
│   │
│   └── api/                    # Node.js + Express
│       ├── src/
│       │   ├── modules/
│       │   ├── middleware/
│       │   ├── config/
│       │   ├── infrastructure/
│       │   ├── shared/
│       │   └── server.ts
│       │
│       └── prisma/             # Empty for now
│
├── packages/
│   │
│   ├── shared-types/
│   ├── shared-validation/
│   ├── shared-utils/
│   ├── api-client/
│   ├── realtime-events/
│   ├── env-config/
│   ├── ui/
│   ├── eslint-config/
│   └── tsconfig/
│
├── docs/
│   ├── architecture.md
│   ├── api-spec.md
│   ├── database.md
│   └── conventions.md
│
├── tooling/
│   ├── docker/
│   └── scripts/
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── LICENSE.md
└── README.md
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
feat: Adds a new feature to the code. This triggers a minor version bump.
Example: feat: add emergency SOS button

fix: Repairs a bug in the code. This triggers a patch version bump.
Example: fix: resolve hospital search loading issue

docs: Changes only documentation files, such as README or Markdown files.
Example: docs: update project installation guide

refactor: Rewrites or restructures code without changing its behavior, fixing bugs, or adding features.
Example: refactor: simplify ambulance request logic

test: Adds missing tests or corrects existing tests without changing production code.
Example: test: add unit tests for SOS service

chore: Handles routine maintenance, build tasks, dependencies, or configuration files that do not modify source or test files.
Example: chore: update ESLint configuration
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
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
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
- Mobile & Web Developers - H M Nafees N Islam, Shanjida Ahmed
- Backend Developers - Hasan Md. Turabi Rahman, Sanjida Sultana Iffat
- UI/UX Designers - H M Nafees N Islam

---

## License

This project is licensed under the MIT License.
