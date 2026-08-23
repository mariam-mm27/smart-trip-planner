import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import clsx from "clsx";
import Destinations from "../components/common/Destinations";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";


const categoryItems = [
  { id: "All", label: "all" },
  { id: "Beaches", label: "beaches" },
  { id: "Historical", label: "historical" },
  { id: "Hiking", label: "hiking" },
  { id: "Food", label: "food" },
];

export default function Home({ favorites = [], setFavorites }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter,setActiveFilter]= useState('Beaches')

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data, error } = await supabase.from("places").select("*").order('rating',{ascending:false}).limit(6);
        if (error) throw error;
        setDestinations(data || []);
      } catch (err) {
        console.error("Error fetching destinations:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((place) => {
      const query = searchQuery.toLowerCase().trim();
      const matchedSearch =
        query === "" ||
        place.title?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query);

      const matchedCategory =
        activeFilter.toLowerCase() === "all" ||
        place.category?.toLowerCase().trim() ===
          activeFilter.toLowerCase().trim();

      return matchedCategory && matchedSearch;
    });
  }, [destinations, activeFilter, searchQuery]);

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          {t("heroTitle")} <span>{t("heroTitleHighlight")}</span>
        </h1>
        <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>

        <div className={styles.searchCard}>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("whereTo")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="bi bi-calendar"></i>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("dates")}
            />
          </div>

          <button
            onClick={() => {
              document
                .getElementById("destinations-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className={styles.searchBtn}
          >
            {t("search")}
          </button>

          <div className={styles.categories}>
            {categoryItems.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={clsx(styles.categoryBtn, {
                  [styles.activeCategory]: activeFilter === cat.id,
                })}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic section */}
      <section className={styles.dynamicSection}>
        {user ? (
          <div className={styles.dynamicCard}>
            <div className={styles.dynamicContent}>
              <p className={styles.dynamicEyebrow}>{t("welcomeBack")}</p>

              <h2 className={styles.dynamicTitle}>{t("readyForAdventure")}</h2>

              <p className={styles.dynamicText}>{t("manageYourTrips")}</p>
            </div>

            <div className={styles.dynamicActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => navigate("/create-trip")}
              >
                {t("createNewTrip")}
              </button>

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => navigate("/my-trips")}
              >
                {t("myTrips")}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.dynamicCard}>
            <div className={styles.dynamicContent}>
              <p className={styles.dynamicEyebrow}>{t("startYourJourney")}</p>

              <h2 className={styles.dynamicTitle}>
                {t("planYourTripSmartly")}
              </h2>

              <p className={styles.dynamicText}>{t("smartTripDescription")}</p>
            </div>

            <div className={styles.dynamicActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => navigate("/register")}
              >
                {t("getStarted")}
              </button>

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => navigate("/login")}
              >
                {t("login")}
              </button>
            </div>
          </div>
        )}
      </section>

      <section id="destinations-section" className={styles.destinationsSection}>
        <div className={styles.sectionHeader}>
          <i className="bi bi-fire text-info fs-5"></i>
          <h2 className={styles.sectionTitle}>{t("trendingDestinations")}</h2>
        </div>

        {loading ? (
          <p className="text-secondary text-center py-4">{t("loading")}...</p>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary mb-3">{t("noDestinations")}</p>
            <button
              className="btn btn-sm btn-outline-info rounded-pill px-3"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
            >
              {t("clearFilters")}
            </button>
          </div>
        ) : (
          <div className={styles.destinationsList}>
            {filteredDestinations.map((place) => (
              <Destinations
              key={place.id}
              id={place.id}
              title={place.title}
              description={place.description}
              price={place.price}
              rating={place.rating}
              imageUrl={place.image_url || place.imageUrl}
              category={place.category}
              location={place.location}
              lang={lang}
              favorites={favorites}
              setFavorites={setFavorites}
            />
            ))}
          </div>
        )}
      </section>

      <section className={styles.benefits}>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>{t("aiPlanner")}</h4>
            <p className={styles.benefitsDescription}>{t("aiPlannerDesc")}</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>{t("budgeting")}</h4>
            <p className={styles.benefitsDescription}>{t("budgetingDesc")}</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>{t("offlineAccess")}</h4>
            <p className={styles.benefitsDescription}>
              {t("offlineAccessDesc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}