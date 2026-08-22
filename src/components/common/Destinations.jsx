import styles from '../../styles/Home.module.css';import { useNavigate } from 'react-router-dom';

export default function Destinations({ id, title, description, price, rating, imageUrl }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/details/${id}`
    ,{state:{itemData:{id,title,description,price,rating,imageUrl}}});
  };
  return (
  
    <div className={styles.destinationCard}>
      <div className={styles.cardImageWrapper}>
        <img
          src={imageUrl || 'https://via.placeholder.com/400x200'}
          alt={title}
          className={styles.cardImage}
        />
        <span className={styles.ratingBadge}>
          ⭐ {rating || '5.0'}
        </span>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>

        <div className={styles.cardFooter}>
          <div>
            <span className={styles.priceLabel}>From</span>
            <div className={styles.priceAmount}>
              ${price || 0}
              <span className={styles.priceUnit}>/day</span>
            </div>
          </div>

          <button
            className={styles.detailsBtn}
            onClick={handleViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
