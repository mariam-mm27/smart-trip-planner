import styles from '../../styles/Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useAutoText } from '../../hooks/useAutoText';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalized } from '../../utils/i18nHelper';

export default function Destinations({ id, title, description, price, rating, imageUrl, lang }) {
  const navigate = useNavigate();
  const { t, lang: contextLang } = useLanguage();
  const currentLang = lang || contextLang;

  const displayTitle = useAutoText(title || getLocalized({ title }, 'title', currentLang));
  const displayDescription = useAutoText(description || getLocalized({ description }, 'description', currentLang));

  const handleViewDetails = () => {
    navigate(`/details/${id}`
    ,{state:{itemData:{id,title,description,price,rating,imageUrl}}});
  };

  return (
    <div className={styles.destinationCard}>
      <div className={styles.cardImageWrapper}>
        <img
          src={imageUrl || 'https://via.placeholder.com/400x200'}
          alt={displayTitle}
          className={styles.cardImage}
        />
        <span className={styles.ratingBadge}>
          ⭐ {rating || '5.0'}
        </span>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{displayTitle}</h3>
        <p className={styles.cardDescription}>{displayDescription}</p>

        <div className={styles.cardFooter}>
          <div>
            <span className={styles.priceLabel}>{t('from')}</span>
            <div className={styles.priceAmount}>
              ${price || 0}
              <span className={styles.priceUnit}>{t('perDay')}</span>
            </div>
          </div>

          <button
            className={styles.detailsBtn}
            onClick={handleViewDetails}
          >
            {t('viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
