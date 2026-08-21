export type AuthStateTone = "primary" | "muted" | "emergency";

export type AuthStateIcon = "Loader2" | "WifiOff" | "TriangleAlert" | "Inbox";

export interface AuthStateMock {
  id: "loading" | "offline" | "error" | "empty";
  icon: AuthStateIcon;
  tone: AuthStateTone;
  title: string;
  description: string;
}

// Ported verbatim from ui-kit/src/routes/patient.auth.states.tsx.
export const authStatesMockData: readonly AuthStateMock[] = [
  {
    id: "loading",
    icon: "Loader2",
    tone: "primary",
    title: "Signing you in",
    description: "Securing your session and syncing your medical profile.",
  },
  {
    id: "offline",
    icon: "WifiOff",
    tone: "muted",
    title: "No internet connection",
    description: "Emergency SOS still works over your carrier network.",
  },
  {
    id: "error",
    icon: "TriangleAlert",
    tone: "emergency",
    title: "Something went wrong",
    description: "We couldn't verify your credentials. Please check and try again.",
  },
  {
    id: "empty",
    icon: "Inbox",
    tone: "muted",
    title: "Nothing here yet",
    description: "Once you sign in, your appointments and records will appear here.",
  },
] as const;

export const authVerificationMockData = {
  title: "Verify it's you",
  description: "Code sent to +880 17XX-XXXXXX",
  code: "418",
  actionLabel: "Verify",
  otpLength: 5,
} as const;

export const authStatesGalleryCopy = {
  title: "System states",
  description: "Loading, connectivity, errors and verification.",
  retryLabel: "Retry",
  tryAgainLabel: "Try again",
  emergencySosLabel: "Emergency SOS",
  createAccountLabel: "Create Account",
} as const;
