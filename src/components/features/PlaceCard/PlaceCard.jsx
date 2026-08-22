import React, { useState } from 'react';
import { FaLocationDot } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import styles from './PlaceCard.module.css';
import { useAutoText } from '../../../hooks/useAutoText';
import { useLanguage } from '../../../context/LanguageContext';
import { getLocalized } from '../../../utils/i18nHelper';

export default function PlaceCard(prop) {
  const { lang, t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(
    prop.favorites?.some((place) => place.id === prop.id)
  );

  const displayTitle = useAutoText(prop.title || getLocalized(prop, 'title', lang));
  const displayDescription = useAutoText(prop.description || getLocalized(prop, 'description', lang));

  function handleFavorite() {
    if (isFavorite) {
      const updatedFavorites = prop.favorites.filter(
        (place) => place.id !== prop.id
      );
      prop.setFavorites(updatedFavorites);
      setIsFavorite(false);
    } else {
      const favoritePlace = {
        id: prop.id,
        title: displayTitle,
        description: displayDescription,
        location: prop.location,
        stars: prop.stars,
        imgTitle: prop.imgTitle,
        image: prop.image,
      };
      prop.setFavorites([...prop.favorites, favoritePlace]);
      setIsFavorite(true);
    }
  }

  return (
    <div className={styles["place-card"]}>
      <div className={styles["card-image"]}>
        <img src={prop.image} alt={displayTitle || ''} />
        <span className={styles["category"]}>
          {prop.imgTitle}
        </span>
        <button
          className={styles["favorite-btn"]}
          onClick={handleFavorite}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className={styles["card-content"]}>
        <h2 className={styles["card-title"]}>{displayTitle}</h2>
        <p className={styles["card-description"]}>{displayDescription}</p>
        <div className={styles["card-location"]}><FaLocationDot />{prop.location}</div>
        <hr />
        <div className={styles["card-bottom"]}>
          <div className={styles["card-rating"]}>
            <FaRegStar className={styles["star-icon"]} />
            <span className={styles["stars"]}>{prop.stars}</span>
          </div>

          <span className={styles["plan-btn"]}>
            {t('planRoute')}
          </span>
        </div>
      </div>
    </div>
  );
}
