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
  const [activeFilter, setActiveFilter] = useState('All')

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
      {/* Authenticated User: Top Welcome Header - KEPT EXACTLY AS ORIGINAL */}
      {user && (
        <section className={styles.greetingHeader}>
          <h1 className={styles.greetingTitle}>
            {t("welcomeBack")}, {user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : "Traveler"}! ­ƒæï
          </h1>
          <p className={styles.greetingSubtitle}>{t("readyToPlan")}</p>
          <div className={styles.greetingActions}>
            <button
              type="button"
              className={styles.greetingPrimaryBtn}
              onClick={() => navigate("/create-trip")}
            >
              + {t("createNewTrip")}
            </button>
            <button
              type="button"
              className={styles.greetingSecondaryBtn}
              onClick={() => navigate("/my-trips")}
            >
              {t("myTrips")}
            </button>
          </div>
        </section>
      )}

      {/* Hero Search Section - Title & Subtitle ALWAYS Inside Search Card */}
      <section className={styles.heroSection}>
        <div className={styles.searchCard}>
          <div className={styles.searchCardHeader}>
            <h1 className={styles.searchCardTitle}>
              {t("heroTitle")} <span>{t("heroTitleHighlight")}</span>
            </h1>
            <p className={styles.searchCardSubtitle}>{t("heroSubtitle")}</p>
          </div>

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

      <section id="destinations-section" className={styles.destinationsSection}>
        <div className={styles.sectionHeaderModern}>
          <h2 className={styles.sectionTitleModern}>
            <span className={styles.trendingText}>Trending</span>{" "}
            <span className={styles.destinationsText}>Destinations</span>
          </h2>
          <div className={styles.accentLine}></div>
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

      {/* Guest State: Promotional Section (Moved After Destinations) */}
      {!user && (
        <section className={styles.dynamicSection}>
          <div className={styles.dynamicCard}>
            <div className={styles.dynamicContent}>
              <h2 className={styles.dynamicTitle}>
                {t("planYourTripSmartly")} ­ƒîì
              </h2>
              <p className={styles.dynamicSubtitle}>{t("smartTripDescription")}</p>
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
        </section>
      )}

      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("whySmartTripPlanner")}</h2>
        </div>
        <div className={styles.benefits}>
          <div className={styles.benefitsItem}>
            <div className={styles.benefitsText}>
              <h4 className={styles.benefitsHeading}>{t("tripPlanner")}</h4>
              <p className={styles.benefitsDescription}>{t("tripPlannerDesc")}</p>
            </div>
            <button
              className={styles.benefitsBtn}
              onClick={() => navigate("/create-trip")}
            >
              {t("tryNow")}
            </button>
          </div>
          <div className={styles.benefitsItem}>
            <div className={styles.benefitsText}>
              <h4 className={styles.benefitsHeading}>{t("budgeting")}</h4>
              <p className={styles.benefitsDescription}>{t("budgetingDesc")}</p>
            </div>
            <button
              className={styles.benefitsBtn}
              onClick={() => navigate("/my-trips")}
            >
              {t("exploreBudget")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
