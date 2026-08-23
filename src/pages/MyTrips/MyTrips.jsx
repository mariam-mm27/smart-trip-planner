import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { deleteTrip, getMyTrips } from "../../services/tripService";
import { useLanguage } from "../../context/LanguageContext";
import { getTripStatus, formatTripDate } from "../../utils/tripUtils";
import styles from "./MyTrips.module.css";
import { Link } from "react-router-dom";

export default function MyTrips() {
  const { t, lang } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrips() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getMyTrips();

        setTrips(data || []);
      } catch (error) {
        console.error("Failed to load trips:", error);
        setError(t('failedLoadTrips'));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  async function handleDeleteTrip(tripId) {
    const confirmed = window.confirm(t('deleteConfirm'));

    if (!confirmed) {
      return;
    }

    try {
      await deleteTrip(tripId);

      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip.id !== tripId),
      );
    } catch (error) {
      console.error("Failed to delete trip:", error);

      setError(t('failedDeleteTrip'));
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <Spinner animation="border" />
          <p>{t('loadingTrips')}</p>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t('myTrips')}</span>

          <h1 className={styles.title}>
            {t('yourTrips')}
          </h1>

          <p className={styles.subtitle}>
            {t('viewEditTrip')}
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!error && trips.length === 0 && (
          <div className={styles.empty}>
            <h2>{t('noTripsYet')}</h2>
            <p>{t('noTripsDescription')}</p>

            <Button href="/create-trip">{t('createFirstTrip')}</Button>
          </div>
        )}

        {trips.length > 0 && (
          <div className={styles.grid}>
            {trips.map((trip) => {
              const status = getTripStatus(trip.end_date);

              return (
                <Card key={trip.id} className={styles.card}>
                  <Card.Body>
                    <div className={styles.cardHead}>
                      <Card.Title className={styles.tripTitle}>
                        {trip.title}
                      </Card.Title>

                      <span
                        className={`${styles.badge} ${
                          status === "completed"
                            ? styles.badgeCompleted
                            : styles.badgeUpcoming
                        }`}
                      >
                        {t(status)}
                      </span>
                    </div>

                    <p className={styles.destination}>{trip.destination}</p>

                    <div className={styles.details}>
                      <p>
                        <strong>{t('from')}:</strong>{" "}
                        {formatTripDate(trip.start_date, lang)}
                      </p>

                      <p>
                        <strong>{t('to')}:</strong>{" "}
                        {formatTripDate(trip.end_date, lang)}
                      </p>

                      <p>
                        <strong>{t('budget')}:</strong> {trip.budget}
                      </p>
                    </div>

                    <div className={styles.actions}>
                      <Button
                        as={Link}
                        to={`/edit-trip/${trip.id}`}
                        variant="outline-primary"
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteTrip(trip.id)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
