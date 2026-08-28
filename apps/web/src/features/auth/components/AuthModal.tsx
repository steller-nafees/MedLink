import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupPanel } from "./SignupPanel";
import { MobileAppPromptModal } from "./MobileAppPromptModal";

export type AuthTab = "login" | "signup";

type AuthModalProps = {
  initialTab: AuthTab;
  onClose: () => void;
  onTabChange?: (tab: AuthTab) => void;
};

const tabContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
  }),
};

export function AuthModal({ initialTab, onClose, onTabChange }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [direction, setDirection] = useState(0);
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const switchTab = (next: AuthTab) => {
    if (next === tab) return;
    setDirection(next === "signup" ? 1 : -1);
    setTab(next);
    onTabChange?.(next);
  };

  const handleBackHome = () => {
    setShowMobilePrompt(false);
    onClose();
  };

  return (
    <>
      {!showMobilePrompt && (
        <div
          className="landing-auth-overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.section
            className="landing-auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="landing-auth-modal-header">
              <div>
                <span className="auth-modal-badge">
                  <ShieldCheck size={14} /> Secure access
                </span>
                <h2 id="auth-modal-title">{tab === "login" ? "Welcome back" : "Join MedLink"}</h2>
              </div>
              <button type="button" onClick={onClose} className="landing-auth-close" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="landing-auth-tabs" role="tablist" aria-label="Authentication options">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                onClick={() => switchTab("login")}
                className={tab === "login" ? "active" : ""}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signup"}
                onClick={() => switchTab("signup")}
                className={tab === "signup" ? "active" : ""}
              >
                Sign up
              </button>
              <motion.span
                className="landing-auth-tab-indicator"
                layout
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                style={{ left: tab === "login" ? "4px" : "calc(50% + 2px)" }}
              />
            </div>

            <div className="landing-auth-tab-content">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={tab}
                  custom={direction}
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {tab === "login" ? (
                    <LoginForm onMobileAppRequired={() => setShowMobilePrompt(true)} />
                  ) : (
                    <SignupPanel />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      )}

      {showMobilePrompt && (
        <MobileAppPromptModal
          onBackHome={handleBackHome}
          onClose={() => setShowMobilePrompt(false)}
        />
      )}
    </>
  );
}
