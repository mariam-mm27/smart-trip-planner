<<<<<<< Updated upstream
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import clsx from 'clsx';
import Destinations from '../components/common/Destinations'
=======
import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import { supabase } from "../services/supabaseClient";

import { useNavigate } from "react-router-dom";

import styles from "../styles/Home.module.css";

import clsx from "clsx";

import Destinations from "../components/common/Destinations";

import { useLanguage } from "../context/LanguageContext";

import { useAuth } from "../context/AuthContext";
>>>>>>> Stashed changes

const categories = ['All', 'Beaches', 'Historical', 'Hiking', 'Food'];

<<<<<<< Updated upstream
export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
=======
const categoryItems = [
  {
    id: "All",
    label: "all",
  },
  {
    id: "Beaches",
    label: "beaches",
  },
  {
    id: "Historical",
    label: "historical",
  },
  {
    id: "Hiking",
    label: "hiking",
  },
  {
    id: "Food",
    label: "food",
  },
];


export default function Home({
  favorites = [],
  setFavorites,
}) {

  const navigate = useNavigate();

  const { user } = useAuth();

  const { t, lang } = useLanguage();


  const [destinations, setDestinations] =
    useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState("Beaches");


  // =========================
  // FETCH DESTINATIONS
  // =========================
>>>>>>> Stashed changes

  useEffect(() => {

    const fetchDestinations = async () => {

      try {
<<<<<<< Updated upstream
        const { data, error } = await supabase.from('places').select('*');
=======

        const {
          data,
          error,
        } = await supabase
          .from("places")
          .select("*")
          .order("rating", {
            ascending: false,
          })
          .limit(6);

>>>>>>> Stashed changes
        if (error) throw error;

        setDestinations(data || []);

      } catch (err) {
<<<<<<< Updated upstream
        console.error('Error fetching destinations:', err.message);
=======

        console.error(
          "Error fetching destinations:",
          err.message
        );

>>>>>>> Stashed changes
      } finally {

        setLoading(false);

      }
    };

    fetchDestinations();

  }, []);

<<<<<<< Updated upstream
 
    const filteredDestinations=  useMemo(()=>{
      return destinations.filter((place)=>{
        const query = searchQuery.toLowerCase().trim();
        const matchedSearch =
        query === ''||
        place.title?.toLowerCase().includes(query)||
        place.description?.toLowerCase().includes(query)

      const matchedCategory=
      activeFilter.toLowerCase() === "all"||
      place.category?.toLowerCase().trim() === activeFilter.toLowerCase()
       return matchedCategory && matchedSearch
      })     
    },[destinations,activeFilter,searchQuery])


  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Plan Your Next Adventure <span>Smartly</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Leverage AI-driven insights to craft the perfect itinerary. Optimize
          routes, manage budgets, and explore the unknown with precision.
        </p>

       
        <div className={styles.searchCard}>
          <div className="input-group mb-2 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: '#0d1527' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary">
=======

  // =========================
  // FILTER DESTINATIONS
  // =========================

  const filteredDestinations = useMemo(() => {

    return destinations.filter((place) => {

      const query =
        searchQuery
          .toLowerCase()
          .trim();

      const matchedSearch =
        query === "" ||
        place.title
          ?.toLowerCase()
          .includes(query) ||
        place.description
          ?.toLowerCase()
          .includes(query);

      const matchedCategory =
        activeFilter
          .toLowerCase() === "all" ||
        place.category
          ?.toLowerCase()
          .trim() ===
          activeFilter
            .toLowerCase()
            .trim();

      return (
        matchedCategory &&
        matchedSearch
      );

    });

  }, [
    destinations,
    activeFilter,
    searchQuery,
  ]);


  return (

    <div className={styles.page}>

      {/* =========================
          HERO SECTION
      ========================= */}

      <section
        className={styles.heroSection}
      >

        <h1
          className={styles.heroTitle}
        >
          {t("heroTitle")}{" "}

          <span>
            {t("heroTitleHighlight")}
          </span>
        </h1>


        <p
          className={styles.heroSubtitle}
        >
          {t("heroSubtitle")}
        </p>


        {/* SEARCH CARD */}

        <div
          className={styles.searchCard}
        >

          {/* Search */}

          <div
            className={styles.inputGroup}
          >

            <span
              className={styles.inputIcon}
            >
>>>>>>> Stashed changes
              <i className="bi bi-search"></i>
            </span>

            <input
              type="text"
<<<<<<< Updated upstream
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Where to?"
              value={searchQuery}
              onChange={(e)=>{setSearchQuery(e.target.value)}}
=======
              className={
                styles.searchInput
              }
              placeholder={t("whereTo")}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
>>>>>>> Stashed changes
            />

          </div>

<<<<<<< Updated upstream
          <div className="input-group mb-3 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: '#0d1527' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary">
=======

          {/* Date */}

          <div
            className={styles.inputGroup}
          >

            <span
              className={styles.inputIcon}
            >
>>>>>>> Stashed changes
              <i className="bi bi-calendar"></i>
            </span>

            <input
              type="text"
<<<<<<< Updated upstream
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Dates"
=======
              className={
                styles.searchInput
              }
              placeholder={t("dates")}
>>>>>>> Stashed changes
            />

          </div>

<<<<<<< Updated upstream
          <button onClick={()=>{document.getElementById('destinations-section')?.scrollIntoView({ behavior: 'smooth' });}} className={styles.searchBtn}>Search</button>

          {/* Category Filter Pills */}
          <div className={styles.categories}>
            {categories.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilter(tag)}
                className={clsx(styles.categoryBtn, {
                  [styles.activeCategory]: activeFilter === tag,
                })}
              >
                {tag}
              </button>
            ))}
=======

          {/* Search Button */}

          <button
            onClick={() => {

              document
                .getElementById(
                  "destinations-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                });

            }}
            className={styles.searchBtn}
          >
            {t("search")}
          </button>


          {/* Categories */}

          <div
            className={styles.categories}
          >

            {categoryItems.map(
              (cat) => (

                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      cat.id
                    )
                  }
                  className={clsx(
                    styles.categoryBtn,
                    {
                      [styles.activeCategory]:
                        activeFilter ===
                        cat.id,
                    }
                  )}
                >
                  {t(cat.label)}
                </button>

              )
            )}

>>>>>>> Stashed changes
          </div>

        </div>

      </section>

<<<<<<< Updated upstream
   
      <section className={styles.destinationsSection}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3 bg-transparent">
          <i className="bi bi-fire text-info fs-5"></i>
          <h2 className="fs-5 fw-bold mb-0 ms-3 text-white bg-transparent text-center">Trending Destinations</h2>
          
=======

      {/* =========================
          DYNAMIC SECTION
      ========================= */}

      <section
        className={styles.dynamicSection}
      >

        {user ? (

          <div
            className={
              styles.dynamicCard
            }
          >

            <div
              className={
                styles.dynamicContent
              }
            >

              <p
                className={
                  styles.dynamicEyebrow
                }
              >
                {t("welcomeBack")}
              </p>

              <h2
                className={
                  styles.dynamicTitle
                }
              >
                {t(
                  "readyForAdventure"
                )}
              </h2>

              <p
                className={
                  styles.dynamicText
                }
              >
                {t(
                  "manageYourTrips"
                )}
              </p>

            </div>


            <div
              className={
                styles.dynamicActions
              }
            >

              <button
                type="button"
                className={
                  styles.primaryAction
                }
                onClick={() =>
                  navigate(
                    "/create-trip"
                  )
                }
              >
                {t("createNewTrip")}
              </button>


              <button
                type="button"
                className={
                  styles.secondaryAction
                }
                onClick={() =>
                  navigate(
                    "/my-trips"
                  )
                }
              >
                {t("myTrips")}
              </button>

            </div>

          </div>

        ) : (

          <div
            className={
              styles.dynamicCard
            }
          >

            <div
              className={
                styles.dynamicContent
              }
            >

              <p
                className={
                  styles.dynamicEyebrow
                }
              >
                {t(
                  "startYourJourney"
                )}
              </p>

              <h2
                className={
                  styles.dynamicTitle
                }
              >
                {t(
                  "planYourTripSmartly"
                )}
              </h2>

              <p
                className={
                  styles.dynamicText
                }
              >
                {t(
                  "smartTripDescription"
                )}
              </p>

            </div>


            <div
              className={
                styles.dynamicActions
              }
            >

              <button
                type="button"
                className={
                  styles.primaryAction
                }
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
              >
                {t("getStarted")}
              </button>


              <button
                type="button"
                className={
                  styles.secondaryAction
                }
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                {t("login")}
              </button>

            </div>

          </div>

        )}

      </section>


      {/* =========================
          DESTINATIONS
      ========================= */}

      <section
        id="destinations-section"
        className={
          styles.destinationsSection
        }
      >

        <div
          className={
            styles.sectionHeader
          }
        >

          <i className="bi bi-fire text-info fs-5"></i>

          <h2
            className={
              styles.sectionTitle
            }
          >
            {t(
              "trendingDestinations"
            )}
          </h2>

>>>>>>> Stashed changes
        </div>
          <div className="text-center mb-4">
            <button
              className={styles.explorePlacesBtn}
              onClick={() => navigate('/place')}
            >
              Explore All Places
            </button>
          </div>


        {/* Loading */}

        {loading ? (
<<<<<<< Updated upstream
          <p className="text-secondary text-center py-4">Loading destinations...</p>
        ) :  filteredDestinations.length === 0 ? (
          <div className='text-center py-5'>
            <p className='text-secondary mb-2'>No destinations</p>
            <button
              className="btn btn-sm btn-outline-info rounded-pill px-3"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
            >
              Clear Filters
=======

          <p
            className="text-secondary text-center py-4"
          >
            {t("loading")}...
          </p>

        ) : filteredDestinations.length === 0 ? (

          /* No results */

          <div
            className="text-center py-5"
          >

            <p
              className="text-secondary mb-3"
            >
              {t(
                "noDestinations"
              )}
            </p>

            <button
              className="btn btn-sm btn-outline-info rounded-pill px-3"
              onClick={() => {

                setSearchQuery("");

                setActiveFilter(
                  "All"
                );

              }}
            >
              {t(
                "clearFilters"
              )}
>>>>>>> Stashed changes
            </button>

          </div>
<<<<<<< Updated upstream
        ):(
          <div className={styles.destinationsList}>
            {filteredDestinations.map((place) => (
              <Destinations
                key={place.id}
                id={place.id}
                title={place.title}
                description={place.description}
                price={place.price}
                rating={place.rating}
                imageUrl={place.image_url}
              />
            ))}
=======

        ) : (

          /* Cards */

          <div
            className={
              styles.destinationsList
            }
          >

            {filteredDestinations.map(
              (place) => (

                <Destinations

                  key={place.id}

                  id={place.id}

                  title={place.title}

                  description={
                    place.description
                  }

                  price={place.price}

                  rating={place.rating}

                  imageUrl={
                    place.image_url ||
                    place.imageUrl
                  }

                  category={
                    place.category
                  }

                  location={
                    place.location
                  }

                  lang={lang}

                  favorites={
                    favorites
                  }

                  setFavorites={
                    setFavorites
                  }

                />

              )
            )}

>>>>>>> Stashed changes
          </div>

        )}

      </section>
<<<<<<< Updated upstream
      {/* benefits */}
      <section className={styles.benefits}>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>AI Planner</h4>
            <p className={styles.benefitsDescription}>Intelligent algorithms craft routes optimized for time, weather, and crowds.</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>Budgeting</h4>
            <p className={styles.benefitsDescription}>Real-time expense tracking with predictive cost modeling for your journey.</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>Offline Access</h4>
            <p className={styles.benefitsDescription}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis, alias rerum ad doloremque at aspernatur?</p>
=======


      {/* =========================
          BENEFITS
      ========================= */}

      <section
        className={styles.benefits}
      >

        <div
          className={
            styles.benefitsItem
          }
        >

          <div
            className={
              styles.benefitsText
            }
          >

            <h4
              className={
                styles.benefitsHeading
              }
            >
              {t("aiPlanner")}
            </h4>

            <p
              className={
                styles.benefitsDescription
              }
            >
              {t(
                "aiPlannerDesc"
              )}
            </p>

>>>>>>> Stashed changes
          </div>

        </div>


        <div
          className={
            styles.benefitsItem
          }
        >

          <div
            className={
              styles.benefitsText
            }
          >

            <h4
              className={
                styles.benefitsHeading
              }
            >
              {t("budgeting")}
            </h4>

            <p
              className={
                styles.benefitsDescription
              }
            >
              {t(
                "budgetingDesc"
              )}
            </p>

          </div>

        </div>


        <div
          className={
            styles.benefitsItem
          }
        >

          <div
            className={
              styles.benefitsText
            }
          >

            <h4
              className={
                styles.benefitsHeading
              }
            >
              {t("offlineAccess")}
            </h4>

            <p
              className={
                styles.benefitsDescription
              }
            >
              {t(
                "offlineAccessDesc"
              )}
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}