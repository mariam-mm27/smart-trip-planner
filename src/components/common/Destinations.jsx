import React, { useState, useEffect } from 'react';
import styles from '../../styles/Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useAutoText } from '../../hooks/useAutoText';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalized } from '../../utils/i18nHelper';
import { FaRegHeart, FaHeart } from 'react-icons/fa';

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
  const currentLang = lang || contextLang;

  const displayTitle = useAutoText(title || getLocalized({ title }, 'title', currentLang));
  const displayDescription = useAutoText(description || getLocalized({ description }, 'description', currentLang));

  // Sync internal favorite state with the favorites array prop
  const [isFavorite, setIsFavorite] = useState(
    favorites?.some((place) => place.id === id)
  );

  useEffect(() => {
    setIsFavorite(favorites?.some((place) => place.id === id));
  }, [favorites, id]);

  function handleFavorite(e) {
    e.stopPropagation(); // Avoid triggering any card click events
    if (!setFavorites) return;

    if (isFavorite) {
      const updatedFavorites = favorites.filter((place) => place.id !== id);
      setFavorites(updatedFavorites);
      setIsFavorite(false);
    } else {
      const favoritePlace = {
        id,
        title: displayTitle,
        description: displayDescription,
        price,
        rating,
        stars: rating,
        image: imageUrl,
        imageUrl,
        location: location || '',
        imgTitle: category || '',
      };
      setFavorites([...favorites, favoritePlace]);
      setIsFavorite(true);
    }
  }

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
      <div className={styles.cardImageWrapper} style={{ position: 'relative' }}>
        <img
          src={imageUrl || 'https://via.placeholder.com/400x200'}
          alt={displayTitle || 'Destination'}
          className={styles.cardImage}
        />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavorite}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'var(--glass-bg, rgba(7, 11, 20, 0.6))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
            color: isFavorite ? '#ef4444' : 'var(--text-primary, #ffffff)',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
          }}
          aria-label="Toggle Favorite"
        >
          {isFavorite ? <FaHeart color="#ef4444" /> : <FaRegHeart />}
        </button>

        <span className={styles.ratingBadge}>
          ⭐ {rating || '5.0'}
        </span>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{displayTitle}</h3>
        <p className={styles.cardDescription}>{displayDescription}</p>

        <div className={styles.cardFooter}>
          <div>
            <span className={styles.priceLabel}>{t('from') || 'From'}</span>
            <div className={styles.priceAmount}>
              ${price || 0}
              <span className={styles.priceUnit}>{t('perDay') || '/day'}</span>
            </div>
          </div>

          <button
            className={styles.detailsBtn}
            onClick={handleViewDetails}
          >
            {t('viewDetails') || 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
}