import { motion } from "framer-motion";
import { ArrowRight, Ambulance, Building2, HeartPulse, MapPin, ShieldCheck, Siren, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/Logos/medlink_without_tagline.png";

const paths = [
  { icon: Stethoscope, title: "For patients", copy: "Find care, request an ambulance, and keep your emergency details close.", tint: "lime" },
  { icon: Ambulance, title: "For ambulance teams", copy: "See nearby requests and move patients safely with less back and forth.", tint: "white" },
  { icon: Building2, title: "For hospitals", copy: "Coordinate beds, reservations, payments, and emergency arrivals in one place.", tint: "lilac" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-logo"><img src={logo} alt="MedLink" /></Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#who-its-for">Who it's for</a>
        </nav>
        <div className="landing-actions">
          <Link to="/auth" className="landing-login">Log in</Link>
          <Link to="/auth?signup=true" className="landing-signup">Get started <ArrowRight size={16} /></Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="landing-hero">
          <motion.div
            className="landing-hero-copy"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="landing-kicker">
              <span className="landing-kicker-dot" /> Care that moves with you
            </motion.span>
            <motion.h1 variants={fadeUp}>
              When every minute matters, <em>move as one.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="landing-lede">
              MedLink connects patients, ambulance teams, and hospitals so the right care can find you faster.
            </motion.p>
            <motion.div variants={fadeUp} className="landing-hero-actions">
              <Link to="/auth?signup=true" className="landing-primary">
                Create your account <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="landing-text-link">
                See how it works <ArrowRight size={16} />
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="landing-trust">
              <ShieldCheck size={16} /> Built for urgent care in Bangladesh <span>•</span> Available 24/7
            </motion.div>
          </motion.div>

          <motion.div
            className="landing-hero-art"
            aria-label="MedLink care network"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="landing-grid" />
            <div className="landing-orbit landing-orbit-one" />
            <div className="landing-orbit landing-orbit-two" />

            <motion.div
              className="landing-center-mark"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartPulse size={48} />
              <span>MEDLINK</span>
            </motion.div>

            <motion.div
              className="landing-care-card landing-care-card-main"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="landing-icon coral"><HeartPulse size={20} /></span>
              <div><strong>Care network active</strong><small>Patients and hospitals are connected</small></div>
              <span className="landing-status"><span className="landing-status-dot" />Live</span>
            </motion.div>

            <motion.div
              className="landing-care-card landing-care-card-location"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <span className="landing-icon teal"><MapPin size={18} /></span>
              <div><strong>Dhaka coverage</strong><small>Emergency response nearby</small></div>
            </motion.div>

            <motion.div
              className="landing-care-card landing-care-card-ambulance"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <span className="landing-icon navy pulse"><Ambulance size={18} /></span>
              <div><strong>Ambulance dispatched</strong><small>Help is on the way</small></div>
            </motion.div>
          </motion.div>
        </section>

        {/* STRIP */}
        <motion.section
          className="landing-strip"
          id="how-it-works"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
        >
          {[
            ["01", "Tell us what you need", "One simple place to start"],
            ["02", "We connect the right people", "Less waiting, clearer updates"],
            ["03", "Care keeps moving", "From request to recovery"],
          ].map(([n, t, s]) => (
            <motion.div key={n} variants={fadeUp} whileHover={{ y: -4 }}>
              <span className="landing-strip-number">{n}</span>
              <strong>{t}</strong>
              <small>{s}</small>
            </motion.div>
          ))}
        </motion.section>

        {/* AUDIENCE */}
        <section className="landing-audience" id="who-its-for">
          <motion.div
            className="landing-section-heading"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
          >
            <span className="landing-kicker">One network, every role</span>
            <h2>Designed around the moments that matter.</h2>
          </motion.div>

          <motion.div
            className="landing-paths"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            {paths.map(({ icon: Icon, title, copy, tint }) => (
              <motion.article
                className={`landing-path landing-path-${tint}`}
                key={title}
                variants={fadeUp}
                whileHover={{ y: -8, rotate: -0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="landing-path-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
                <Link to="/auth?signup=true">Get started <ArrowRight size={15} /></Link>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="landing-footer">
        <img src={logo} alt="MedLink" />
        <span>Connecting care, saving lives.</span>
        <Link to="/auth" className="landing-footer-link">Open portal <ArrowRight size={15} /></Link>
        <Link to="/auth" className="landing-sos"><Siren size={15} /> Emergency SOS</Link>
      </footer>
    </div>
  );
}