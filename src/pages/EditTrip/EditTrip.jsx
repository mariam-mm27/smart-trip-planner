import { useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { getTripById, updateTrip } from "../../services/tripService";
import styles from "./EditTrip.module.css";

export default function EditTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [tripData, setTripData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadTrip() {
      try {
        setIsLoading(true);
        setError("");

        const trip = await getTripById(tripId);

        setTripData({
          title: trip.title || "",
          destination: trip.destination || "",
          startDate: trip.start_date || "",
          endDate: trip.end_date || "",
          budget: trip.budget || "",
        });
      } catch (error) {
        console.error("Failed to load trip:", error);
        setError("Failed to load this trip.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTrip();
  }, [tripId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setTripData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      await updateTrip(tripId, tripData);

      setSuccess("Trip updated successfully!");

      setTimeout(() => {
        navigate("/my-trips");
      }, 1000);
    } catch (error) {
      console.error("Failed to update trip:", error);
      setError(error.message || "Failed to update trip.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <Spinner animation="border" />
          <p>Loading trip...</p>
        </Container>
      </main>
    );
  }

  if (error && !tripData.title) {
    return (
      <main className={styles.page}>
        <Container>
          <p className={styles.error}>{error}</p>

          <Button onClick={() => navigate("/my-trips")}>
            Back to My Trips
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.header}>
          <span className={styles.eyebrow}>EDIT TRIP</span>

          <h1 className={styles.title}>
            Update Your <span>Trip</span>
          </h1>

          <p className={styles.subtitle}>
            Update your trip details and save your changes.
          </p>
        </div>

        <div className={styles.card}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Trip Title</Form.Label>

              <Form.Control
                type="text"
                name="title"
                value={tripData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Destination</Form.Label>

              <Form.Control
                type="text"
                name="destination"
                value={tripData.destination}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Start Date</Form.Label>

              <Form.Control
                type="date"
                name="startDate"
                value={tripData.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>End Date</Form.Label>

              <Form.Control
                type="date"
                name="endDate"
                value={tripData.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Budget</Form.Label>

              <Form.Control
                type="number"
                name="budget"
                min="1"
                value={tripData.budget}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/my-trips")}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {success && <p className={styles.success}>{success}</p>}

            {error && <p className={styles.error}>{error}</p>}
          </Form>
        </div>
      </Container>
    </main>
  );
}
