# Implementation Plan: MedLink Mobile — Part 1: Frontend Audit & Unified Design System

Comprehensive audit of the existing MedLink React Native / Expo mobile application and implementation of a unified, healthcare-oriented visual design system foundation.

---

## 1. Frontend Audit & Problem Identification

### Current Architecture & Screens Audit

| Layer / Area | Current State | Findings |
|---|---|---|
| **Route Architecture (`src/app/`)** | Expo Router file-based routing with `(auth)`, `(patient)`, `(ambulance)` route groups. | Routes are mostly thin delegates pointing to features. Root layout lacks `SafeAreaProvider`, status bar configuration, and global font loading guard. |
| **Feature Screens (`src/features/`)** | Implemented: `SplashScreen`, `OnboardingScreen`, `WelcomeScreen`, `AccountTypeScreen`, `LoginScreen`, `SignupScreen`, `DriverSignupScreen`, `PatientHomeScreen`, `SOSScreen`. Placeholders: `ai`, `activity`, `blood`, `hospitals`, `notifications`, `preferences`, `profile`, `reservations`, `settings`, `tracking`, and all `(ambulance)` screens. | Implemented screens work but have fragmented styling, hardcoded measurements, inline gradient duplication, and inconsistent safe area handling. |
| **Theme & Tokens (`src/theme.ts`)** | Basic colors, radii, and shadows exist. | Missing comprehensive semantic tokens (e.g. `warning`, `success` variations, `borderLight`, `textSecondary`, `surfaceElevated`), spacing system, typography scales, and `src/constants/theme.ts` is 0 bytes. |
| **Typography** | Relying on unconfigured system fonts with hardcoded `fontSize` and `fontWeight` throughout screens. | Lacks a unified typography scale and font loading mechanism. |
| **Safe Area & Status Bar** | Mixed: some screens use deprecated/iOS-only `SafeAreaView` from `react-native`, some use `useSafeAreaInsets`, `PatientHomeScreen` has no safe area top inset at all. | Status bar collision occurs on notched / punch-hole devices on `PatientHomeScreen`. |
| **Reusable UI Primitives** | Only `AuthInput.tsx` and `AuthSelect.tsx` in `components/ui/`. `packages/ui` is an empty stub. | Buttons, cards, badges, section headers, loading states, empty states, and error states are duplicated across screens using raw inline views. |

---

### Categorized UI Problems

#### 🚨 Critical Issues
1. **Status Bar & Notch Overlap**: `PatientHomeScreen` uses `<ScrollView style={{ flex: 1, backgroundColor: bgColor }}>` with a static `paddingTop: 16` inside without safe-area insets, causing header elements (avatar, greeting, notification bell) to overlap device status bars and camera cutouts.
2. **Missing Global `SafeAreaProvider`**: `apps/mobile/src/app/_layout.tsx` only renders `<Stack screenOptions={{ headerShown: false }} />` without `SafeAreaProvider`, leading to unpredictable safe area calculations on Android/iOS.
3. **Inconsistent Keyboard Handling**: Input forms handle `KeyboardAvoidingView` differently across `LoginScreen`, `SignupScreen`, and `DriverSignupScreen`, often lacking keyboard dismissal on tap outside or proper bottom offset calculation.
4. **No Global Font Loading Strategy**: System fonts are used everywhere without a centralized typography hierarchy.

#### ⚠️ Major Issues
1. **Inconsistent & Duplicated UI Elements**: Buttons (pill gradients, border buttons, emergency buttons) are rewritten with custom inline `LinearGradient` and styles across every screen instead of using a unified `Button` component.
2. **Scattered & Arbitrary Spacing**: Hardcoded values such as `padding: 13`, `fontSize: 15.5`, `fontSize: 12.5`, `paddingBottom: 200`, `letterSpacing: 4.6` are strewn throughout screens without token alignment.
3. **Missing Semantic Color Tokens**: `SignupScreen` and other features note that theme palette lacks warning, success, and neutral variant tokens.
4. **Empty / Inconsistent Theme Modules**: `src/constants/theme.ts` is an empty file (0 bytes), while `src/theme.ts` exists, causing confusion.

#### 💡 Minor Issues
1. **Disparate Shadow Styles**: Inconsistent shadow elevations across cards, modals, and buttons.
2. **Inconsistent Border Radii**: Varying border radii across cards (12, 16, 20, 24, 28) and badges without standard hierarchy.
3. **Icon Size / Stroke Discrepancies**: Icons vary between 14, 16, 18, 20, 24 with differing stroke weights.

---

## 2. Proposed Changes & Implementation Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Root Layout (_layout.tsx)                │
│   SafeAreaProvider + Font Loading Guard + StatusBar Manager │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       Theme System           │        │     Reusable UI Foundation   │
│  - Palette (Teal Brand)      │        │  - Screen (Safe/Keyboard)    │
│  - Semantic Color Tokens     │        │  - Header / NavBar           │
│  - Typography Scale          │        │  - Button (Variants/States)  │
│  - Spacing Scale (xs-xxl)    │        │  - Input & Select / Chips    │
│  - Radii & Elevation/Shadows │        │  - Card (Variants/States)    │
│  - Constants & Helpers       │        │  - Badge & Chip              │
│                              │        │  - SectionHeader             │
│                              │        │  - Loading / Empty / Error   │
└──────────────────────────────┘        └──────────────────────────────┘
```

### Dependency Updates
- Install `@expo-google-fonts/plus-jakarta-sans` and `expo-font` via `npx expo install` for medical-grade, clean typography.

---

### Theme & Design Tokens

#### [MODIFY] [theme.ts](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/theme.ts) & [constants/theme.ts](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/constants/theme.ts)
- **Brand Colors**: Teal primary (`#16A89C`), dark teal (`#0E746C`), light teal (`#E6F7F5`), container (`#D8F6F3`), secondary (`#3DBDB3`), accent (`#69D2CA`).
- **Semantic Tokens**: `primary`, `primaryDark`, `primaryLight`, `primaryContainer`, `secondary`, `secondaryLight`, `accent`, `background`, `backgroundDark`, `surface`, `surfaceElevated`, `surfaceVariant`, `textPrimary`, `textSecondary`, `textMuted`, `border`, `borderLight`, `success`, `successLight`, `warning`, `warningLight`, `error`, `errorLight`, `emergency`, `emergencyDark`, `emergencyLight`, `info`, `infoLight`.
- **Typography Scale**: `display`, `h1`, `h2`, `h3`, `bodyLarge`, `body`, `bodySmall`, `caption`, `label`, `button` with exact fontSize, lineHeight, fontWeight, letterSpacing, and fontFamily mappings.
- **Spacing System**: `xxs` (2), `xs` (4), `sm` (8), `md` (12), `lg` (16), `xl` (20), `xxl` (24), `xxxl` (32), `huge` (40).
- **Radius & Shadows**: `xs` (4), `sm` (8), `md` (12), `lg` (16), `xl` (20), `xxl` (24), `xxxl` (32), `pill` (999); standard card, floating, dialog, emergency glow shadows.

---

### Root Architecture & Safe-Area Setup

#### [MODIFY] [_layout.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/app/_layout.tsx)
- Integrate `SafeAreaProvider` from `react-native-safe-area-context`.
- Load Plus Jakarta Sans font weights (`400`, `500`, `600`, `700`, `800`) using `useFonts`.
- Setup `StatusBar` (`style="dark"`, `backgroundColor="transparent"`, `translucent={true}`).
- Render loading splash state until fonts are ready.

---

### Reusable UI Foundation Components (`src/components/ui/`)

#### [NEW] [Screen.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Screen.tsx)
- Unified screen container handling top/bottom safe areas, scrolling vs static view, keyboard avoiding behavior, background color, and status bar.

#### [NEW] [Header.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Header.tsx)
- Reusable navigation header with back button, title, subtitle, right actions, and transparent / solid background modes.

#### [NEW] [Button.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Button.tsx)
- Unified button supporting variants (`primary` with brand gradient, `secondary`, `outline`, `ghost`, `emergency`, `destructive`), sizes (`sm`, `md`, `lg`), loading spinner, icon left/right, and pill/rounded styling.

#### [NEW] [Input.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Input.tsx)
- Standardized text input with label, left icon, password visibility toggle, clear button, helper text, error styling, and focus borders.

#### [NEW] [Card.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Card.tsx)
- Clean healthcare card with variants (`default`, `elevated`, `outlined`, `interactive`, `accent`), padding tokens, and interactive press states.

#### [NEW] [Badge.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Badge.tsx) & [Chip.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/Chip.tsx)
- Semantic badge (`success`, `warning`, `error`, `emergency`, `info`, `neutral`, `primary`) and interactive selectable filter chips.

#### [NEW] [SectionHeader.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/SectionHeader.tsx)
- Standard section header with title, subtitle, optional badge, and action button / link ("See all").

#### [NEW] [FeedbackStates.tsx](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/FeedbackStates.tsx)
- Reusable `LoadingState`, `EmptyState`, and `ErrorState` components with icons, messages, and retry actions.

#### [MODIFY] [index.ts](file:///d:/Education/North%20South%20University/Semesters/Summer_26_7th/CSE327/Medlink/Medlink/apps/mobile/src/components/ui/index.ts)
- Export all UI components cleanly while preserving backward compatibility with `AuthInput` and `AuthSelect`.

---

## 3. Verification Plan

### Automated / Code Quality Tests
1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
   Verify 0 type errors across all changed files and component interfaces.

2. **Expo Start Verification**:
   ```bash
   npx expo start
   ```
   Ensure the Expo dev server starts cleanly and resolves all routes, fonts, and safe-area providers.

### Manual Verification
- Verify that existing screens continue to render without runtime errors.
- Validate that the new typography and theme tokens are consistently accessible.
- Confirm safe-area handling properly pads headers and content across different device aspect ratios.
