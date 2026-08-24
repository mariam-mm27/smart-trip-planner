import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

import Destinations from "../../components/common/Destinations";
import Toast from "../../components/common/Toast";
import { supabase } from "../../services/supabaseClient.js";
import { useLanguage } from "../../context/LanguageContext";

import styles from "./Favorites.module.css";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

export default function Favorites() {
  const { t } = useLanguage();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
      setToast({
        show: true,
        message: error?.message || t('failedLoadPlaces') || "Failed to load favorites",
        type: 'error'
      });
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

  const handleClearAll = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Delete all favorites for this user
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites([]);
      setShowClearConfirm(false);
      setToast({
        show: true,
        message: t('allFavoritesRemoved') || 'All favorites have been removed',
        type: 'success'
      });
    } catch (error) {
      console.error('Error clearing favorites:', error);
      setToast({
        show: true,
        message: error?.message || t('failedRemovePlace') || 'Failed to clear favorites',
        type: 'error'
      });
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

          <div className={styles.headerActions}>
            <span className={styles.count}>
              {favorites.length} Saved Locations
            </span>
            {favorites.length > 0 && (
              <button 
                className={styles.clearAllBtn}
                onClick={() => setShowClearConfirm(true)}
                title="Remove all favorites"
              >
                {t("clearAll") || "Clear All"}
              </button>
            )}
          </div>

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
                location={
                  place.location ||
                  place.Location ||
                  place.location_url
                }
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

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowClearConfirm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t("clearAll") || "Clear All"}</h2>
            <p className={styles.modalMessage}>
              {t("confirmClearAll") || "Are you sure you want to remove all favorites? This cannot be undone."}
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancel}
                onClick={() => setShowClearConfirm(false)}
              >
                {t("cancel") || "Cancel"}
              </button>
              <button 
                className={styles.modalConfirm}
                onClick={handleClearAll}
              >
                {t("clearAll") || "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </main>
  );
}