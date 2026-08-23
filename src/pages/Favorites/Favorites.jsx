import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import Destinations from '../../components/common/Destinations';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Favorites.module.css';

export default function Favorites({ favorites = [] }) {
  const { t } = useLanguage();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t('favorites')}</span>
          <h1 className={styles.title}>{t('myFavorites')}</h1>
          <p className={styles.subtitle}>{t('favoritesSubtitle')}</p>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.empty}>
            <FiHeart className={styles.emptyIcon} />
            <h2>{t('noFavoritesYet')}</h2>
            <p>{t('noFavoritesDescription')}</p>

            <Link to="/explore" className={styles.exploreBtn}>
              {t('explore')}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((place) => (
              <Destinations
                key={place.id}
                id={place.id}
                title={place.title}
                description={place.description}
                price={place.price}
                rating={place.rating}
                imageUrl={place.image_url || place.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}