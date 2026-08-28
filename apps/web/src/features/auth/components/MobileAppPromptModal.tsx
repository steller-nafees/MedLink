import { motion } from "framer-motion";
import { Phone, X } from "lucide-react";

type MobileAppPromptModalProps = {
  onBackHome: () => void;
  onClose: () => void;
};

export function MobileAppPromptModal({ onBackHome, onClose }: MobileAppPromptModalProps) {
  return (
    <div
      className="landing-auth-overlay mobile-app-overlay"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.section
        className="mobile-app-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mobile-app-title"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <button type="button" onClick={onClose} className="landing-auth-close" aria-label="Close">
          <X size={20} />
        </button>

        <span className="mobile-app-icon">
          <Phone size={28} />
        </span>

        <h2 id="mobile-app-title">Use the MedLink mobile app</h2>
        <p>
          Patient and ambulance accounts are available on our mobile app. Download it to request
          care, track ambulances, and manage emergency responses on the go.
        </p>

        <div className="mobile-app-actions">
          <button type="button" onClick={onBackHome} className="mobile-app-btn-secondary">
            Back to home
          </button>
          <button type="button" className="mobile-app-btn-primary">
            Download app
          </button>
        </div>
      </motion.section>
    </div>
  );
}
