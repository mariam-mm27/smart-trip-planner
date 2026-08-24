import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { deleteTrip, getMyTrips } from "../../services/tripService";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./MyTrips.module.css";
import { Link } from "react-router-dom";

export default function MyTrips() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
        setError(t("failedLoadTrips"));
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  async function handleDeleteTrip(tripId) {
    const confirmed = window.confirm(t("deleteConfirm"));

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

      setError(t("failedDeleteTrip"));
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <Spinner animation="border" />
          <p>{t("loadingTrips")}</p>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          title="Go back"
          aria-label="Go back"
        >
          <FiArrowLeft /> {t("back")}
        </button>

        <div className={styles.header}>
          <span className={styles.eyebrow}>{t("myTrips")}</span>

          <h1 className={styles.title}>{t("yourTrips")}</h1>

          <p className={styles.subtitle}>{t("viewEditTrip")}</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!error && trips.length === 0 && (
          <div className={styles.empty}>
            <h2>{t("noTripsYet")}</h2>
            <p>{t("noTripsDescription")}</p>

            <Button href="/create-trip">{t("createFirstTrip")}</Button>
          </div>
        )}

        {trips.length > 0 && (
          <div className={styles.grid}>
            {trips.map((trip) => (
              <Card key={trip.id} className={styles.card}>
                <Card.Body>
                  <Card.Title className={styles.tripTitle}>
                    {trip.title}
                  </Card.Title>

                  <p className={styles.destination}>{trip.destination}</p>

                  <div className={styles.details}>
                    <p>
                      <strong>{t("from")}:</strong> {trip.start_date}
                    </p>

                    <p>
                      <strong>{t("to")}:</strong> {trip.end_date}
                    </p>

                    <p>
                      <strong>{t("budget")}:</strong> {trip.budget}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Button
                      as={Link}
                      to={`/view-trip/${trip.id}`}
                      variant="outline-primary"
                      className={styles.actionButton}
                    >
                      {t("viewTrip")}
                    </Button>

                    <Button
                      as={Link}
                      to={`/edit-trip/${trip.id}`}
                      variant="outline-secondary"
                      className={styles.actionButton}
                    >
                      {t("edit")}
                    </Button>

                    <Button
                      variant="outline-danger"
                      className={styles.actionButton}
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
