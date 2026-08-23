import { useLanguage } from "../../../../context/LanguageContext";
import { useAutoText } from "../../../../hooks/useAutoText";
import styles from "./ItineraryPreview.module.css";
import { Link } from "react-router-dom";

function ItineraryPlace({
  place,
  dayNumber,
  itinerary,
  onRemovePlace,
  onMovePlace,
}) {
  const displayTitle = useAutoText(place.title);
  const displayCategory = useAutoText(place.category);

  const { t } = useLanguage();

  return (
    <div className={styles.place}>
      <div className={styles.placeInfo}>
        <h4>{displayTitle}</h4>

        {place.category && (
          <span className={styles.category}>{displayCategory}</span>
        )}

        {place.rating && (
          <span className={styles.rating}>★ {place.rating}</span>
        )}
      </div>

      <div className={styles.actions}>
        <Link to={`/details/${place.id}`} className={styles.detailsButton}>
          {t("viewDetails")}
        </Link>
        <select
          className={styles.moveSelect}
          value=""
          onChange={(event) => {
            const newDay = Number(event.target.value);

            if (!newDay) {
              return;
            }

            onMovePlace(place.id, dayNumber, newDay);
          }}
        >
          <option value="">{t("movePlace")}</option>

          {itinerary
            .filter((targetDay) => targetDay.day !== dayNumber)
            .map((targetDay) => (
              <option key={targetDay.day} value={targetDay.day}>
                {t("days")} {targetDay.day}
              </option>
            ))}
        </select>

        <button
          type="button"
          className={styles.removeButton}
          onClick={() => onRemovePlace(place.id, dayNumber)}
        >
          {t("removePlace")}
        </button>
      </div>
    </div>
  );
}

export default function ItineraryPreview({
  itinerary,
  onRemovePlace,
  onMovePlace,
}) {
  const { t } = useLanguage();

  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {itinerary.map((day) => (
        <div key={day.day} className={styles.day}>
          <h3 className={styles.dayTitle}>
            {t("days")} {day.day}
          </h3>

          {day.places.length === 0 ? (
            <p className={styles.empty}>{t("noPlacesForDay")}</p>
          ) : (
            <div className={styles.places}>
              {day.places.map((place) => (
                <ItineraryPlace
                  key={place.id}
                  place={place}
                  dayNumber={day.day}
                  itinerary={itinerary}
                  onRemovePlace={onRemovePlace}
                  onMovePlace={onMovePlace}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
