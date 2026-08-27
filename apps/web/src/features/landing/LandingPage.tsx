import { motion, type Variants } from "framer-motion";
import {
  Ambulance,
  ArrowUpRight,
  Building2,
  Clock,
  HeartPulse,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import logo from "@/assets/images/Logos/medlink_without_tagline.png";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// The three-node dispatch route drawn behind the hero copy.
// Kept in one place because the SVG path and the CSS offset-path
// animation on the pulse dot must stay in sync — see landing.css.
const ROUTE_PATH =
  "M62,232 C132,146 176,74 256,74 C336,74 372,150 450,206";

const stats = [
  { icon: Building2, value: "40+", label: "Partner hospitals" },
  { icon: Ambulance, value: "500+", label: "Ambulances onboard" },
  { icon: Clock, value: "24/7", label: "Emergency response" },
  { icon: User, value: "10,000+", label: "Patients served" },
];

const steps = [
  {
    number: "01",
    icon: Stethoscope,
    title: "Patient requests",
    copy: "One tap shares your location and vitals with the nearest available ambulance team.",
  },
  {
    number: "02",
    icon: Ambulance,
    title: "Live dispatch",
    copy: "The team accepts, navigates, and posts status updates in real time as they move.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Hospital ready",
    copy: "Beds and staff are briefed before the patient arrives, so care starts at the door.",
  },
];

const roles = [
  { name: "Patients", tag: "Request and track care" },
  { name: "Ambulance teams", tag: "Accept and navigate" },
  { name: "Hospitals", tag: "Coordinate arrivals" },
  { name: "Admins", tag: "Oversee the network" },
];

const why = [
  {
    icon: ShieldCheck,
    title: "Verified network",
    copy: "Every hospital and ambulance team is vetted before it can accept a request on MedLink.",
  },
  {
    icon: HeartPulse,
    title: "Real-time tracking",
    copy: "Patients and hospitals see exactly where help is and when it will arrive — no guessing.",
  },
];

export function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(() =>
    searchParams.get("signup") === "true" ? "signup" : searchParams.get("auth") === "true" ? "login" : null,
  );
  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setSearchParams({ auth: "true", ...(mode === "signup" ? { signup: "true" } : {}) });
  };
  const closeAuth = () => {
    setAuthMode(null);
    setSearchParams({});
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <img src={logo} alt="MedLink" />
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#hero">Home</a>
          <a href="#how-it-works">How it works</a>
          <a href="#who-its-for">Who it's for</a>
          <a href="#why">Why MedLink</a>
        </nav>
        <div className="landing-actions">
          <button type="button" onClick={() => openAuth("login")} className="landing-login landing-auth-button">
            Log in
          </button>
          <button type="button" onClick={() => openAuth("signup")} className="landing-header-cta landing-auth-button">
            Get started
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="hero">
          <motion.div className="landing-hero-copy" initial="hidden" animate="show" variants={stagger}>
            <motion.span variants={fadeUp} className="landing-kicker">
              Emergency care network · Bangladesh
            </motion.span>
            <motion.h1 variants={fadeUp}>
              Care that moves
              <br />
              with you
            </motion.h1>
            <motion.p variants={fadeUp} className="landing-lede">
              MedLink connects patients, ambulance teams, and hospitals in one live network, so every
              request finds the nearest help and the nearest bed, automatically.
            </motion.p>
            <motion.div variants={fadeUp} className="landing-hero-actions">
              <button type="button" onClick={() => openAuth("signup")} className="landing-primary landing-auth-button">
                Request care
              </button>
              <a href="#how-it-works" className="landing-secondary">
                See how it works
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="landing-hero-art"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <svg viewBox="0 0 520 300" className="hero-route-svg" aria-hidden="true">
              <path d={ROUTE_PATH} className="hero-route-path" />
            </svg>
            <span className="hero-pulse-dot" aria-hidden="true" />

            <div className="hero-node hero-node-patient">
              <Stethoscope size={16} />
              <span>Patient</span>
            </div>
            <div className="hero-node hero-node-ambulance">
              <Ambulance size={16} />
              <span>Ambulance</span>
            </div>
            <div className="hero-node hero-node-hospital">
              <Building2 size={16} />
              <span>Hospital</span>
            </div>

            <motion.div
              className="landing-profile-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <strong>Fahim Ahmed</strong>
              <small>Verified paramedic · on route</small>
            </motion.div>

            <motion.div
              className="landing-open-badge"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.5 }}
            >
              <span className="landing-open-dot" />
              <div>
                <strong>Dispatch active</strong>
                <small>Available 24 hours</small>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          className="landing-stats"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={stagger}
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <motion.div className="landing-stat" key={label} variants={fadeUp}>
              <Icon size={16} />
              <span>
                <strong>{value}</strong> {label}
              </span>
            </motion.div>
          ))}
        </motion.section>

        <motion.section
          className="landing-steps"
          id="how-it-works"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="landing-section-heading">
            <span className="landing-kicker">How it works</span>
            <h2>From request to recovery, one connected path</h2>
          </motion.div>

          <motion.div variants={stagger} className="landing-steps-grid">
            {steps.map(({ number, icon: Icon, title, copy }) => (
              <motion.div className="landing-step" key={title} variants={fadeUp} whileHover={{ y: -6 }}>
                <div className="landing-step-top">
                  <span className="landing-step-number">{number}</span>
                  <Icon size={20} />
                </div>
                <h4>{title}</h4>
                <p>{copy}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <section className="landing-roles" id="who-its-for">
          <motion.div
            className="landing-section-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <span className="landing-kicker">Who it's for</span>
            <h2>Built for every role in the network</h2>
          </motion.div>

          <motion.div
            className="landing-role-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            {roles.map(({ name, tag }) => (
              <motion.div className="landing-role-card" key={name} variants={fadeUp} whileHover={{ y: -6 }}>
                <div className="landing-role-avatar">
                  <User size={20} />
                </div>
                <strong>{name}</strong>
                <small>{tag}</small>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="landing-why" id="why">
          <motion.div
            className="landing-why-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="landing-kicker">
              Why MedLink
            </motion.span>
            <motion.h2 variants={fadeUp}>Built to remove the delay between a request and a response</motion.h2>
          </motion.div>

          <motion.div
            className="landing-why-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            {why.map(({ icon: Icon, title, copy }) => (
              <motion.div className="landing-why-card" key={title} variants={fadeUp}>
                <span className="landing-why-icon">
                  <Icon size={20} />
                </span>
                <h4>{title}</h4>
                <p>{copy}</p>
                <ArrowUpRight size={16} className="landing-why-arrow" />
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="landing-why-hotline">
              <Phone size={18} />
              <div>
                <strong>16263</strong>
                <small>National emergency hotline, live 24/7</small>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          className="landing-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <HeartPulse size={22} className="landing-cta-icon" />
          <h2>
            Start your emergency
            <br />
            care network today
          </h2>
          <button type="button" onClick={() => openAuth("signup")} className="landing-cta-btn landing-auth-button">
            Create account
          </button>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <img src={logo} alt="MedLink" />
            <p>Find help fast and coordinate care across our network.</p>
          </div>
          <div>
            <strong>Network</strong>
            <a href="#who-its-for">Patients</a>
            <a href="#who-its-for">Ambulance teams</a>
            <a href="#who-its-for">Hospitals</a>
          </div>
          <div>
            <strong>Quick links</strong>
            <Link to="/">About</Link>
            <button type="button" onClick={() => openAuth("signup")} className="landing-footer-link">Contact us</button>
            <a href="#why">Why MedLink</a>
          </div>
          <div className="landing-footer-newsletter">
            <strong>Stay updated</strong>
            <div className="landing-newsletter-input">
              <input type="email" placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 MedLink. All rights reserved.</span>
        </div>
      </footer>

      {authMode && (
        <div className="landing-auth-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeAuth()}>
          <section className="landing-auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="landing-auth-modal-header">
              <div>
                <span className="landing-kicker">MedLink secure access</span>
                <h2 id="auth-modal-title">{authMode === "login" ? "Welcome back" : "Join the care network"}</h2>
              </div>
              <button type="button" onClick={closeAuth} className="landing-auth-close" aria-label="Close authentication dialog"><X size={20} /></button>
            </div>
            <div className="landing-auth-tabs" role="tablist" aria-label="Authentication options">
              <button type="button" role="tab" aria-selected={authMode === "login"} onClick={() => setAuthMode("login")} className={authMode === "login" ? "active" : ""}>Log in</button>
              <button type="button" role="tab" aria-selected={authMode === "signup"} onClick={() => setAuthMode("signup")} className={authMode === "signup" ? "active" : ""}>Sign up</button>
            </div>
            {authMode === "login" ? <LoginPage onSignup={() => setAuthMode("signup")} /> : <SignupPage onBack={() => setAuthMode("login")} />}
            {authMode === "signup" && <p className="landing-auth-contact">Need help choosing an account? <a href="mailto:hello@medlink.health">Contact us</a>.</p>}
          </section>
        </div>
      )}
    </div>
  );
}