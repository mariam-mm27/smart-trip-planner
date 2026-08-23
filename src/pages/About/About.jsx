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
import { useLanguage } from "../../context/LanguageContext";

const features = [
  {
    icon: <FiCompass />,
    title: "smartTripPlanning",
    description: "smartTripPlanningDesc",
  },
  {
    icon: <FiMap />,
    title: "exploreDestinations",
    description: "exploreDestinationsDesc",
  },
  {
    icon: <FiCalendar />,
    title: "dailyItinerary",
    description: "dailyItineraryDesc",
  },
  {
    icon: <FiHeart />,
    title: "favoritesFeature",
    description: "favoritesFeatureDesc",
  },
  {
    icon: <FiUser />,
    title: "personalProfile",
    description: "personalProfileDesc",
  },
  {
    icon: <FiShield />,
    title: "secureAccess",
    description: "secureAccessDesc",
  },
];

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <main className={styles.page}>
      {/* Hero / Overview */}
      <section className={styles.hero}>
        <span className={styles.eyebrow}>{t("about")}</span>

        <div className={styles.heroIcon}>
          <FiCompass />
        </div>

        <h1 className={styles.title}>
          {t("aboutHeroTitle")} <span>{t("aboutHeroHighlight")}</span>
        </h1>

        <p className={styles.subtitle}>{t("aboutSubtitle")}</p>
      </section>

      {/* Project Overview */}
      <section className={styles.overview}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>{t("ourPurpose")}</span>

          <h2>{t("travelPlanningMadeSimple")}</h2>

          <p>{t("aboutPurposeDescription")}</p>
        </div>

        <div className={styles.overviewCards}>
          <div className={styles.overviewCard}>
            <FiMapPin className={styles.cardIcon} />

            <div>
              <h3>{t("discover")}</h3>

              <p>{t("discoverDescription")}</p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <FiCalendar className={styles.cardIcon} />

            <div>
              <h3>{t("organize")}</h3>

              <p>{t("organizeDescription")}</p>
            </div>
          </div>

          <div className={styles.overviewCard}>
            <FiDollarSign className={styles.cardIcon} />

            <div>
              <h3>{t("plan")}</h3>

              <p>{t("planDescription")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>{t("keyFeatures")}</span>

          <h2>
            {t("everythingYouNeed")} <span>{t("planYourTrip")}</span>
          </h2>

          <p>{t("featuresDescription")}</p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>

              <h3>{t(feature.title)}</h3>

              <p>{t(feature.description)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <FiCompass className={styles.ctaIcon} />

        <h2>{t("readyToPlan")}</h2>

        <p>{t("aboutCtaDescription")}</p>

        <button
          type="button"
          className={styles.ctaButton}
          onClick={() => navigate("/create-trip")}
        >
          {t("startPlanning")}
          <span>→</span>
        </button>
      </section>
    </main>
  );
}
