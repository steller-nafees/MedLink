import { ArrowUpRight, Building2, HelpCircle, Phone } from "lucide-react";

export function SignupPanel() {
  return (
    <div className="auth-form-panel auth-signup-panel">
      <p className="auth-form-lede">
        Join the MedLink care network. Our team will help you onboard hospitals, ambulance fleets,
        or patient services.
      </p>

      <ul className="auth-signup-benefits">
        <li>
          <Building2 size={18} />
          <span>Hospital &amp; admin web dashboards</span>
        </li>
        <li>
          <Phone size={18} />
          <span>Patient &amp; ambulance mobile apps</span>
        </li>
        <li>
          <HelpCircle size={18} />
          <span>Dedicated onboarding support</span>
        </li>
      </ul>

      <button type="button" className="auth-contact-sales-btn">
        <ArrowUpRight size={18} />
        Contact sales
      </button>

      <p className="auth-signup-note">
        Already have an account? Switch to the Log in tab above.
      </p>
    </div>
  );
}
