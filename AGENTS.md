# MedLink Agent Instructions

## Project

MedLink is a healthcare application organized as a monorepo.

Main applications:

- apps/mobile — React Native + Expo
- apps/web — React + Vite
- apps/api — Node.js + Express

The current task may be limited to the mobile application.

---

# General Rules

1. Do not restructure the repository unless explicitly instructed.
2. Do not delete existing files without explicit approval.
3. Do not modify unrelated applications.
4. Do not modify API code while implementing mobile UI unless explicitly requested.
5. Do not modify web application code while implementing mobile UI.
6. Prefer small, focused changes.
7. Reuse existing components before creating new ones.
8. Do not introduce unnecessary dependencies.
9. Do not change package versions unless required.
10. Do not run destructive Git commands.

---

# Git Safety

Never run:

- git reset --hard
- git clean -fd
- git checkout .
- git restore .
- git push --force
- git branch -D

Do not commit unless explicitly requested.

Do not push unless explicitly requested.

Before modifying files:

1. Inspect git status.
2. Inspect the relevant existing files.
3. Understand the current architecture.

---

# Mobile Architecture

The mobile application is located at:

apps/mobile/

The architecture is:

src/
├── app/
├── assets/
├── components/
├── constants/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
└── types/

---

# Important Architectural Rule

`src/app/` contains Expo Router routes ONLY.

Do not place large UI implementations inside `src/app/`.

Example:

src/app/(auth)/onboarding.tsx

should render:

src/features/auth/onboarding/OnboardingScreen.tsx

The route should remain thin.

---

# Feature Architecture

Feature implementations belong under:

src/features/

Examples:

src/features/auth/
src/features/patient/
src/features/ambulance/
src/features/blood/
src/features/ai/
src/features/sos/

Feature-specific components should stay inside their feature.

Example:

src/features/auth/components/AuthKit.tsx

Do not create duplicate versions of the same component in multiple locations.

---

# Shared Components

Use:

src/components/ui/

for generic reusable UI primitives.

Examples:

- Button
- Input
- Card
- Modal

Use:

src/components/shared/

for MedLink-wide components.

Examples:

- Logo
- LoadingScreen
- ErrorView

If a component is only relevant to authentication, keep it inside:

src/features/auth/components/

---

# UI Implementation

When given a UI design or UI-kit code:

1. Study the design.
2. Identify the application screen.
3. Identify reusable components.
4. Map the screen to the correct feature.
5. Reuse existing dependencies.
6. Implement the feature screen.
7. Connect it through the correct Expo Router route.
8. Do not duplicate routing logic inside the feature.
9. Preserve the visual design as closely as practical.

---

# UI Kit Rule

The `ui-kit/` directory is a design/reference source.

Do not automatically copy its folder structure into `apps/mobile`.

Instead:

UI Kit
↓
Analyze design
↓
Convert/adapt components
↓
apps/mobile/src/features/
or
apps/mobile/src/components/

Only copy code when it is compatible with the mobile application's architecture.

---

# Before Creating a Component

Search the repository first.

If an equivalent component already exists:

REUSE IT.

Do not create:

Button.tsx
PrimaryButton.tsx
MedLinkButton.tsx
CustomButton.tsx

if an existing component already provides the required functionality.

---

# Dependencies

Before installing a package:

1. Check apps/mobile/package.json.
2. Check whether the dependency already exists.
3. Prefer Expo-compatible packages.
4. Use `npx expo install <package>` for Expo/native packages.
5. Do not install packages in the repository root unless they are truly root dependencies.

---

# Validation

After implementation:

1. Run TypeScript checks when available.
2. Run Expo lint when available.
3. Start the mobile app if necessary.
4. Check the target screen.
5. Check imports and aliases.
6. Check that Expo Router still resolves routes.

Do not ignore build errors.

---

# Reporting

After completing a task, report:

- Files created
- Files modified
- Dependencies added
- Commands run
- Validation result
- Any remaining issue

Do not claim something was tested if it was not tested.