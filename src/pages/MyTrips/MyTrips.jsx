import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { deleteTrip, getMyTrips } from "../../services/tripService";
import styles from "./MyTrips.module.css";
import { Link } from "react-router-dom";

export default function MyTrips() {
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
        setError("Failed to load your trips. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrips();
  }, []);

  async function handleDeleteTrip(tripId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip?",
    );

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

      setError("Failed to delete this trip. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <Spinner animation="border" />
          <p>Loading your trips...</p>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.header}>
          <span className={styles.eyebrow}>MY TRIPS</span>

          <h1 className={styles.title}>
            Your <span>Trips</span>
          </h1>

          <p className={styles.subtitle}>
            View and manage the trips you have created.
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!error && trips.length === 0 && (
          <div className={styles.empty}>
            <h2>No trips yet</h2>
            <p>You haven't created any trips yet.</p>

            <Button href="/create-trip">Create Your First Trip</Button>
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
                      <strong>From:</strong> {trip.start_date}
                    </p>

                    <p>
                      <strong>To:</strong> {trip.end_date}
                    </p>

                    <p>
                      <strong>Budget:</strong> {trip.budget}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Button
                      as={Link}
                      to={`/edit-trip/${trip.id}`}
                      variant="outline-primary"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      Delete
                    </Button>{" "}
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
