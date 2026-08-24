import React, { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import { useNavigate } from "react-router-dom";
import { useAutoText } from "../../hooks/useAutoText";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalized } from "../../utils/i18nHelper";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { useFavorites } from "../../context/FavoritesContext";
import { toast } from "react-hot-toast";

export default function Destinations({
  id,
  title,
  description,
  price,
  rating,
  imageUrl,
  image_url,
  image,
  location,
  Location,
  location_url,
  category,
  lang,
  favorites = [],
  setFavorites,
}) {
  const navigate = useNavigate();
  const { t, lang: contextLang } = useLanguage();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const currentLang = lang || contextLang;

  const displayTitle = useAutoText(
    title || getLocalized({ title }, "title", currentLang)
  );

  const displayDescription = useAutoText(
    description ||
      getLocalized({ description }, "description", currentLang)
  );

  const displayImage =
    imageUrl ||
    image_url ||
    image ||
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

  const displayLocation = location || Location || location_url || "";
  const displayRating = rating != null ? rating : "5.0";
  const displayPrice = price != null ? price : 0;

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavorited(id));
  }, [id, isFavorited]);

 const handleFavorite = async (e) => {
  e.stopPropagation();

  if (favoriteLoading) return;

  if (!user) {
    toast.error("Please login to add favorites");
    setTimeout(() => {
      navigate("/login");
    }, 1200);
    return;
  }

  setFavoriteLoading(true);

  try {
    const success = await toggleFavorite(id);
    
    if (!isFavorite) {
      // Adding to favorites
      setIsFavorite(true);
      toast.success("Added to Favorites successfully! ❤️");
    } else {
      // Removing from favorites
      setIsFavorite(false);
      toast.success("Removed from Favorites");
    }

    // Update parent component if needed
    if (setFavorites) {
      if (isFavorite) {
        const updated = favorites.filter(place => place.id !== id);
        setFavorites(updated);
      }
    }
  } catch (error) {
    console.error("Favorite error:", error);
    toast.error(error.message || "Something went wrong");
    setIsFavorite(!isFavorite);
  } finally {
    setFavoriteLoading(false);
  }
};

  const handleViewDetails = () => {
    navigate(`/details/${id}`, {
      state: {
        itemData: {
          id,
          title: displayTitle,
          description: displayDescription,
          price: displayPrice,
          rating: displayRating,
          imageUrl: displayImage,
          location: displayLocation,
          category: category || "",
        },
      },
    });
  };

  return (
    <div className={styles.destinationCard}>
      <div
        className={styles.cardImageWrapper}
        style={{ position: "relative" }}
      >
        <img
          src={displayImage}
          alt={displayTitle || "Destination"}
          className={styles.cardImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
          }}
        />

        <button
          type="button"
          onClick={handleFavorite}
          disabled={favoriteLoading}
          className={styles.favoriteButton}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? (
            <FaHeart color="#ef4444" />
          ) : (
            <FaRegHeart />
          )}
        </button>

        <span className={styles.ratingBadge}>
          ⭐ {displayRating}
        </span>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>
          {displayTitle}
        </h3>

        <p className={styles.cardDescription}>
          {displayDescription}
        </p>

        <div className={styles.cardFooter}>
          <div>
            <span className={styles.priceLabel}>
              {t("from") || "From"}
            </span>

            <div className={styles.priceAmount}>
              ${displayPrice}

              <span className={styles.priceUnit}>
                {t("perDay") || "/day"}
              </span>
            </div>
          </div>

          <button
            className={styles.detailsBtn}
            onClick={handleViewDetails}
          >
            {t("viewDetails") || "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}