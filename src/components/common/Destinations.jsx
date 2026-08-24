<<<<<<< Updated upstream
import styles from '../../styles/Home.module.css';import { useNavigate } from 'react-router-dom';
import placeholderImage from '../../assets/images/Frame 1.png';
=======
import React, { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import { useNavigate } from "react-router-dom";
import { useAutoText } from "../../hooks/useAutoText";
import { useLanguage } from "../../context/LanguageContext";
import { getLocalized } from "../../utils/i18nHelper";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
>>>>>>> Stashed changes

export default function Destinations({ id, title, description, price, rating, imageUrl }) {
  const navigate = useNavigate();
<<<<<<< Updated upstream
=======
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

  // Sync favorite state with favorites array
  useEffect(() => {
    setIsFavorite(favorites?.some((place) => place.id === id));
  }, [favorites, id]);

  // Show notification
  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  // Handle favorite button
  const handleFavorite = (e) => {
    e.stopPropagation();

    // =========================
    // USER NOT LOGGED IN
    // =========================
    if (!user) {
      showNotification("Please login to add favorites");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

      return;
    }

    if (!setFavorites) return;

    // =========================
    // REMOVE FAVORITE
    // =========================
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (place) => place.id !== id
      );

      setFavorites(updatedFavorites);
      setIsFavorite(false);

      showNotification("Removed from favorites");
    }

    // =========================
    // ADD FAVORITE
    // =========================
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
>>>>>>> Stashed changes

      showNotification("Added to favorites ❤️");
    }
  };

  // View details
  const handleViewDetails = () => {
    navigate(`/destination/${id}`
    ,{state:{itemData:{id,title,description,price,rating,imageUrl}}});
  };
  return (
  
    <div className={styles.destinationCard}>
<<<<<<< Updated upstream
      <div className={styles.cardImageWrapper}>
        <img
          src={imageUrl || placeholderImage}
          alt={title}
          className={styles.cardImage}
        />
=======

      {/* Notification */}
      {notification && (
        <div className={styles.favoriteNotification}>
          {notification}
        </div>
      )}

      {/* Image */}
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

        {/* Favorite Heart */}
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

        {/* Rating */}
>>>>>>> Stashed changes
        <span className={styles.ratingBadge}>
          ⭐ {rating || "5.0"}
        </span>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
<<<<<<< Updated upstream
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
=======

        <h3 className={styles.cardTitle}>
          {displayTitle}
        </h3>

        <p className={styles.cardDescription}>
          {displayDescription}
        </p>
>>>>>>> Stashed changes

        <div className={styles.cardFooter}>

          <div>
<<<<<<< Updated upstream
            <span className={styles.priceLabel}>From</span>
            <div className={styles.priceAmount}>
              ${price || 0}
              <span className={styles.priceUnit}>/day</span>
=======
            <span className={styles.priceLabel}>
              {t("from") || "From"}
            </span>

            <div className={styles.priceAmount}>
              ${price || 0}

              <span className={styles.priceUnit}>
                {t("perDay") || "/day"}
              </span>
>>>>>>> Stashed changes
            </div>
          </div>

          <button
            className={styles.detailsBtn}
            onClick={handleViewDetails}
          >
<<<<<<< Updated upstream
            View Details
=======
            {t("viewDetails") || "View Details"}
>>>>>>> Stashed changes
          </button>

        </div>
      </div>
    </div>
  );
}
