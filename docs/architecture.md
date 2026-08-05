# MedLink Architecture

## Project Overview

MedLink is a healthcare emergency response and coordination platform that connects patients, hospitals, ambulance services, and administrators through a unified digital ecosystem.

The primary goal is to reduce emergency response times, improve healthcare coordination, and provide real-time visibility into medical resources and emergency operations.

---

# System Architecture

```text
┌──────────────────────────┐
│      Mobile App          │
│ React Native + Expo      │
└─────────────┬────────────┘
              │
              │ HTTPS
              ▼
┌──────────────────────────┐
│      MedLink API         │
│    Node.js + Express     │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│      PostgreSQL 18       │
└─────────────┬────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼

Hospital Dashboard    Admin Dashboard
 React.js + Vite      React.js + Vite
```

---

# Technology Stack

## Mobile Application

- React Native
- Expo
- Expo Router
- TypeScript

Purpose:

- Patient Portal
- Ambulance Portal

---

## Web Application

- React.js
- Vite
- TypeScript

Purpose:

- Hospital Dashboard
- Admin Dashboard

---

## Backend API

- Node.js
- Express.js
- TypeScript

Responsibilities:

- Authentication
- Authorization
- Business Logic
- Database Access
- Notification Handling
- Realtime Event Processing

---

## Database

- PostgreSQL 18
- Dockerized Local Development

Responsibilities:

- User Management
- Hospital Data
- Ambulance Data
- Emergency Requests
- Reservations
- Notifications
- Audit Logs

---

# User Roles

## Patient

Capabilities:

- Register/Login
- Search Hospitals
- View Hospital Details
- Create SOS Requests
- Track Ambulances
- Receive Notifications
- Manage Profile

---

## Ambulance Driver

Capabilities:

- Login
- Receive Emergency Dispatch
- Manage Trips
- Update Status
- View Trip History
- Receive Notifications

---

## Hospital Staff

Capabilities:

- Manage Beds
- Manage Ambulance Requests
- Manage Emergencies
- Manage Reservations
- Manage Staff
- View Analytics

---

## Administrator

Capabilities:

- Manage Users
- Verify Hospitals
- Monitor Ambulances
- Review Audit Logs
- Manage Notifications
- View Revenue Analytics
- Monitor System Health

---

# Monorepo Architecture

```text
apps/
├── mobile/
├── web/
└── api/

packages/
├── shared-types/
├── shared-validation/
├── shared-utils/
├── api-client/
├── realtime-events/
├── env-config/
├── ui/
├── eslint-config/
└── tsconfig/
```

---

# Application Structure

## Mobile Application

```text
mobile/
│
├── app/
│   ├── (auth)/
│   ├── (patient)/
│   ├── (ambulance)/
│   └── index.tsx
│
├── components/
├── hooks/
├── services/
├── constants/
└── assets/
```

---

## Web Application

```text
web/
│
├── src/
│   ├── admin/
│   ├── hospital/
│   ├── routes/
│   ├── layouts/
│   ├── shared/
│   └── components/
│
├── public/
└── assets/
```

---

## API Application

```text
api/
│
├── src/
│   ├── modules/
│   ├── middleware/
│   ├── config/
│   ├── infrastructure/
│   ├── shared/
│   └── server.ts
│
└── prisma/
```

---

# Shared Packages

## shared-types

Purpose:

Shared TypeScript interfaces.

Examples:

- User
- Hospital
- Ambulance
- SOSRequest
- Reservation
- Notification

---

## shared-validation

Purpose:

Reusable validation schemas.

Examples:

- Login Validation
- Registration Validation
- Reservation Validation

---

## api-client

Purpose:

Centralized API communication.

Used by:

- Mobile Application
- Web Application

---

## shared-utils

Purpose:

Reusable utility functions.

Examples:

- Date Formatting
- Distance Calculation
- Common Helpers

---

## realtime-events

Purpose:

Shared realtime event contracts.

Examples:

- SOS Created
- Ambulance Assigned
- Reservation Approved

---

# Authentication Strategy

Provider:

Supabase Authentication

Supported Methods:

- Email & Password

Roles:

```text
PATIENT
AMBULANCE_DRIVER
HOSPITAL_STAFF
ADMIN
```

---

# Authorization Strategy

Role-Based Access Control (RBAC)

Access is determined by authenticated user role.

Each role receives only the permissions required for their responsibilities.

---

# API Communication Flow

```text
Mobile App
     │
     ▼
 API Client
     │
     ▼
 MedLink API
     │
     ▼
 PostgreSQL
```

```text
Web App
     │
     ▼
 API Client
     │
     ▼
 MedLink API
     │
     ▼
 PostgreSQL
```

Direct database access from frontend applications is prohibited.

---

# Realtime Features

Planned:

- SOS Status Updates
- Ambulance Tracking
- Hospital Capacity Updates
- Emergency Notifications

Technology Candidates:

- Supabase Realtime
- WebSockets

---

# Environment Management

Environment files:

```text
.env
.env.local
.env.example
```

Secrets must never be committed to source control.

---

# Git Workflow

Permanent Branch:

```text
main
```

Feature Branches:

```text
feature/*
```

Bug Fix Branches:

```text
bugfix/*
```

Emergency Fixes:

```text
hotfix/*
```

All changes must be merged through Pull Requests.

Direct commits to main are prohibited.

---

# Architectural Principles

1. API-First Development
2. Shared Types Across Applications
3. Single Source of Truth
4. Modular Monorepo Design
5. Role-Based Access Control
6. Dockerized Development Environment
7. Reusable Shared Packages
8. Secure Authentication
9. Maintainable Codebase
10. Scalable System Design