import React, { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import { useNavigate } from "react-router-dom";
import { useAutoText } from "../../hooks/useAutoText";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalized } from "../../utils/i18nHelper";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Destinations({
  id,
  title,
  description,
  price,
  rating,
  imageUrl,
  location,
  category,
  lang,
  favorites = [],
  setFavorites,
}) {
  const navigate = useNavigate();
  const { t, lang: contextLang } = useLanguage();
  const { user } = useAuth();

  const currentLang = lang || contextLang;

  const displayTitle = useAutoText(
    title || getLocalized({ title }, "title", currentLang)
  );

  const displayDescription = useAutoText(
    description ||
      getLocalized({ description }, "description", currentLang)
  );

  const [isFavorite, setIsFavorite] = useState(
    favorites?.some((place) => place.id === id)
  );

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setIsFavorite(favorites?.some((place) => place.id === id));
  }, [favorites, id]);

  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();

    // User is not logged in
    if (!user) {
      showNotification("Please login to add favorites");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      return;
    }

    if (!setFavorites) return;

    // Remove favorite
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (place) => place.id !== id
      );

      setFavorites(updatedFavorites);
      setIsFavorite(false);

      showNotification("Removed from favorites");
    }

    // Add favorite
    else {
      const favoritePlace = {
        id,
        title: displayTitle,
        description: displayDescription,
        price,
        rating,
        stars: rating,
        image: imageUrl,
        imageUrl,
        location: location || "",
        imgTitle: category || "",
      };

      setFavorites([...favorites, favoritePlace]);
      setIsFavorite(true);

      showNotification("Added to favorites ❤️");
    }
  };

  const handleViewDetails = () => {
    navigate(`/details/${id}`, {
      state: {
        itemData: {
          id,
          title: displayTitle,
          description: displayDescription,
          price,
          rating,
          imageUrl,
        },
      },
    });
  };

  return (
    <div className={styles.destinationCard}>
      {notification && (
        <div className={styles.favoriteNotification}>
          {notification}
        </div>
      )}

      <div
        className={styles.cardImageWrapper}
        style={{ position: "relative" }}
      >
        <img
          src={
            imageUrl ||
            "https://via.placeholder.com/400x200"
          }
          alt={displayTitle || "Destination"}
          className={styles.cardImage}
        />

        <button
          type="button"
          onClick={handleFavorite}
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
          ⭐ {rating || "5.0"}
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
              ${price || 0}

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