import { useEffect, useState } from "react";
import { Container, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAutoText } from "../../hooks/useAutoText";
import { getTripWithItinerary } from "../../services/tripService";
import styles from "./ViewTrip.module.css";
import { Link } from "react-router-dom";

function ViewPlace({ place, t }) {
  const displayTitle = useAutoText(place.title);
  const displayCategory = useAutoText(place.category);

  return (
    <div className={styles.place}>
      <div>
        <h4>{displayTitle}</h4>

        <span className={styles.category}>{displayCategory}</span>

        <span className={styles.rating}>★ {place.rating}</span>

        <Link to={`/details/${place.id}`} className={styles.detailsButton}>
          {t("viewDetails")}
        </Link>
      </div>
    </div>
  );
}

export default function ViewTrip() {
  const { t } = useLanguage();

  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrip() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getTripWithItinerary(tripId);

        setTrip(result.trip);
        setItinerary(result.itinerary || []);
      } catch (error) {
        console.error("Failed to load trip:", error);

        setError(error.message || t("failedLoadTrip"));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrip();
  }, [tripId, t]);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <Spinner animation="border" />

          <p>{t("loadingTrip")}</p>
        </Container>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <p className={styles.error}>{error || t("tripNotFound")}</p>

          <button
            className={styles.backButton}
            onClick={() => navigate("/my-trips")}
          >
            {t("backToMyTrips")}
          </button>
        </Container>
      </main>
    );
  }

  return (
    <ViewTripContent
      trip={trip}
      itinerary={itinerary}
      t={t}
      navigate={navigate}
    />
  );
}

function ViewTripContent({ trip, itinerary, t, navigate }) {
  const displayTripTitle = useAutoText(trip.title);

  const displayDestination = useAutoText(trip.destination);

  return (
    <main className={styles.page}>
      <Container>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t("tripDetails")}</span>

          <h1 className={styles.title}>{displayTripTitle}</h1>

          <p className={styles.subtitle}>{t("savedItinerary")}</p>
        </div>

        {/* Trip Information */}
        <Card className={styles.card}>
          <Card.Body>
            <div className={styles.destination}>{displayDestination}</div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span>{t("startDate")}</span>

                <strong>{trip.start_date}</strong>
              </div>

              <div className={styles.detail}>
                <span>{t("endDate")}</span>

                <strong>{trip.end_date}</strong>
              </div>

              <div className={styles.detail}>
                <span>{t("budget")}</span>

                <strong>{trip.budget}</strong>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Saved Itinerary */}
        <section className={styles.itinerarySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>{t("tripPlan")}</span>

            <h2 className={styles.sectionTitle}>{t("savedItinerary")}</h2>

            <p className={styles.sectionSubtitle}>{t("savedItinerary")}</p>
          </div>

          {itinerary.length > 0 ? (
            <div className={styles.itineraryGrid}>
              {itinerary.map((day) => (
                <Card key={day.day} className={styles.dayCard}>
                  <Card.Body>
                    <h3 className={styles.dayTitle}>
                      {t("days")} {day.day}
                    </h3>

                    {day.places.length > 0 ? (
                      <div className={styles.places}>
                        {day.places.map((place) => (
                          <ViewPlace key={place.id} place={place} t={t} />
                        ))}
                      </div>
                    ) : (
                      <p className={styles.empty}>{t("noPlacesForDay")}</p>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className={styles.emptyItinerary}>
              {t("noItineraryAvailable")}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => navigate(`/edit-trip/${trip.id}`)}
          >
            {t("edit")}
          </button>

          <button
            className={styles.backButton}
            onClick={() => navigate("/my-trips")}
          >
            {t("backToMyTrips")}
          </button>
        </div>
      </Container>
    </main>
  );
}
