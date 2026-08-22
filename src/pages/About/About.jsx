import React from "react";
import {
  FiCompass,
  FiMap,
  FiCalendar,
  FiHeart,
  FiUser,
  FiShield,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import styles from "./About.module.css";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <FiCompass />,
    title: "Smart Trip Planning",
    description:
      "Create personalized trips and organize your travel plans in one place.",
  },
  {
    icon: <FiMap />,
    title: "Explore Destinations",
    description:
      "Discover destinations and explore places based on different categories.",
  },
  {
    icon: <FiCalendar />,
    title: "Daily Itinerary",
    description:
      "Organize your selected places into a clear daily itinerary for your trip.",
  },
  {
    icon: <FiHeart />,
    title: "Favorites",
    description:
      "Save places you like so you can easily find them again when planning your trips.",
  },
  {
    icon: <FiUser />,
    title: "Personal Profile",
    description:
      "Manage your profile information and keep your travel experience personalized.",
  },
  {
    icon: <FiShield />,
    title: "Secure Access",
    description:
      "Protected routes and authentication keep your personal trip data accessible to you.",
  },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <main className={styles.page}>
      {/* Hero / Overview */}
      <section className={styles.hero}>
        <span className={styles.eyebrow}>ABOUT SMART TRIP PLANNER</span>

        <div className={styles.heroIcon}>
          <FiCompass />
        </div>

        <h1 className={styles.title}>
          Plan Your Journey <span>Smartly</span>
        </h1>

        <p className={styles.subtitle}>
          Smart Trip Planner is a travel planning platform designed to help
          users discover destinations, create personalized trips, and organize
          their travel plans in one convenient place.
        </p>
      </section>

      {/* Project Overview */}
      <section className={styles.overview}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>OUR PURPOSE</span>

          <h2>
            Travel planning, <span>made simpler.</span>
          </h2>

          <p>
            From discovering new places to organizing your itinerary, Smart Trip
            Planner brings the essential parts of trip planning together. Users
            can explore destinations, save favorite places, create trips, and
            manage their plans through a personalized experience.
          </p>
        </div>

        <div className={styles.overviewCards}>
          <div className={styles.overviewCard}>
            <FiMapPin className={styles.cardIcon} />

            <div>
              <h3>Discover</h3>
              <p>
                Explore destinations and find places that match your interests.
              </p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <FiCalendar className={styles.cardIcon} />

            <div>
              <h3>Organize</h3>
              <p>
                Build and manage your trips with organized dates and
                itineraries.
              </p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <FiDollarSign className={styles.cardIcon} />

            <div>
              <h3>Plan</h3>
              <p>
                Keep important trip details such as destinations and budgets
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>KEY FEATURES</span>

          <h2>
            Everything you need to <span>plan your trip.</span>
          </h2>

          <p>
            Smart Trip Planner provides tools that make discovering and managing
            your travel plans easier.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <FiCompass className={styles.ctaIcon} />

        <h2>Ready to plan your next adventure?</h2>

        <p>
          Discover new destinations and start organizing your next trip with
          Smart Trip Planner.
        </p>

        <button
          type="button"
          className={styles.ctaButton}
          onClick={() => navigate("/create-trip")}
        >
          Start Planning
          <span>→</span>
        </button>
      </section>
    </main>
  );
}
