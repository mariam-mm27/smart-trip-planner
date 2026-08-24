import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { toast } from "react-hot-toast";

import Destinations from "../../components/common/Destinations";
import { supabase } from "../../services/supabaseClient.js";
import { useLanguage } from "../../context/LanguageContext";

import styles from "./Favorites.module.css";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function Favorites() {
  const { t } = useLanguage();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites();
  }, []);

  async function getFavorites() {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setFavorites([]);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          place_id,
          places (*)
        `)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      const places = data
        .map((favorite) => favorite.places)
        .filter(Boolean);

      setFavorites(places);
    } catch (error) {
      console.error("Get favorites error:", error);

      toast.error(
        error.message || "Failed to load favorites"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleFavoriteChange = (placeId, isFavorite) => {
    if (!isFavorite) {
      setFavorites((prev) =>
        prev.filter((place) => place.id !== placeId)
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>

          <div className="d-flex gap-3 align-items-center">

            <div className="backBTN">
              <Link
                to="/"
                className={styles.backButton}
              >
                <span className={styles.backIcon}>
                  ←
                </span>
              </Link>
            </div>

            <div className="content">

              <span className={styles.eyebrow}>
                {t("favorites")}
              </span>

              <h1 className={styles.title}>
                {t("myFavorites")}
              </h1>

              <p className={styles.subtitle}>
                {t("favoritesSubtitle")}
              </p>

            </div>

          </div>

          <span className={styles.count}>
            {favorites.length} Saved Locations
          </span>

        </div>

        {/* Empty Favorites */}
        {favorites.length === 0 ? (

          <div className={styles.empty}>

            <FiHeart
              className={styles.emptyIcon}
            />

            <h2>
              {t("noFavoritesYet")}
            </h2>

            <p>
              {t("noFavoritesDescription")}
            </p>

            <Link
              to="/explore"
              className={styles.exploreBtn}
            >
              {t("explore")}
            </Link>

          </div>

        ) : (

          /* Favorites Grid */
          <div className={styles.grid}>

            {favorites.map((place) => (

              <Destinations
                key={place.id}
                id={place.id}
                title={place.title}
                description={place.description}
                price={place.price}
                rating={place.rating}
                imageUrl={
                  place.image_url ||
                  place.imageUrl ||
                  place.image
                }
                location={place.location}
                category={
                  place.category ||
                  place.imgTitle
                }
                favorites={favorites}
                setFavorites={setFavorites}
              />

            ))}

          </div>

        )}

      </div>
    </main>
  );
}