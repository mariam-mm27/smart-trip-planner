import { useEffect, useState } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

import {
  getTripWithItinerary,
  updateTrip,
  updateTripItemDay,
  deleteTripItem,
} from "../../services/tripService";

import ItineraryPreview from "../../components/features/TripCreation/ItineraryPreview/ItineraryPreview";

import styles from "./EditTrip.module.css";

export default function EditTrip() {
  const { t } = useLanguage();

  const { tripId } = useParams();
  const navigate = useNavigate();

  const [tripData, setTripData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const [itinerary, setItinerary] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadTrip() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getTripWithItinerary(tripId);

        setTripData({
          title: result.trip.title || "",
          destination: result.trip.destination || "",
          startDate: result.trip.start_date || "",
          endDate: result.trip.end_date || "",
          budget: result.trip.budget || "",
        });

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

  function handleChange(event) {
    const { name, value } = event.target;

    setTripData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      await updateTrip(tripId, tripData);

      setSuccess(t("tripUpdatedSuccessfully"));
    } catch (error) {
      console.error("Failed to update trip:", error);

      setError(error.message || t("unexpectedError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemovePlace(placeId, dayNumber) {
    try {
      setError("");
      setSuccess("");

      const sourceDay = itinerary.find((day) => day.day === Number(dayNumber));

      const place = sourceDay?.places.find((item) => item.id === placeId);

      if (!place) {
        throw new Error(t("placeNotFound"));
      }

      if (!place.tripItemId) {
        throw new Error(t("tripItemNotFound"));
      }

      await deleteTripItem(place.tripItemId, tripId);

      setItinerary((currentItinerary) =>
        currentItinerary.map((day) => {
          if (day.day !== Number(dayNumber)) {
            return day;
          }

          return {
            ...day,
            places: day.places.filter((item) => item.id !== placeId),
          };
        }),
      );

      setSuccess(t("placeRemovedSuccessfully"));
    } catch (error) {
      console.error("Failed to remove place:", error);

      setError(error.message || t("failedRemovePlace"));
    }
  }

  async function handleMovePlace(placeId, fromDay, toDay) {
    try {
      setError("");
      setSuccess("");

      const sourceDayNumber = Number(fromDay);

      const targetDayNumber = Number(toDay);

      if (sourceDayNumber === targetDayNumber) {
        return;
      }

      const sourceDay = itinerary.find((day) => day.day === sourceDayNumber);

      if (!sourceDay) {
        throw new Error(t("sourceDayNotFound"));
      }

      const place = sourceDay.places.find((item) => item.id === placeId);

      if (!place) {
        throw new Error(t("placeNotFound"));
      }

      if (!place.tripItemId) {
        throw new Error(t("tripItemNotFound"));
      }

      // Update Supabase first.
      await updateTripItemDay(place.tripItemId, tripId, targetDayNumber);

      // Update the UI after the database succeeds.
      setItinerary((currentItinerary) =>
        currentItinerary.map((day) => {
          // Remove from old day.
          if (day.day === sourceDayNumber) {
            return {
              ...day,
              places: day.places.filter((item) => item.id !== placeId),
            };
          }

          // Add to new day.
          if (day.day === targetDayNumber) {
            return {
              ...day,
              places: [...day.places, place],
            };
          }

          return day;
        }),
      );

      setSuccess(t("placeMovedSuccessfully"));
    } catch (error) {
      console.error("Failed to move place:", error);

      setError(error.message || t("failedMovePlace"));
    }
  }

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

  if (error && !tripData.title) {
    return (
      <main className={styles.page}>
        <Container className={styles.center}>
          <p className={styles.error}>{error}</p>

          <Button onClick={() => navigate("/my-trips")}>
            {t("backToMyTrips")}
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Container>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t("editTrip")}</span>

          <h1 className={styles.title}>{t("updateYourTrip")}</h1>

          <p className={styles.subtitle}>{t("updateYourTrip")}</p>
        </div>

        {/* Trip Information */}
        <div className={styles.card}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>{t("tripTitle")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="text"
                name="title"
                value={tripData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t("destination")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="text"
                name="destination"
                value={tripData.destination}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t("startDate")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="date"
                name="startDate"
                value={tripData.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t("endDate")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="date"
                name="endDate"
                value={tripData.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t("budget")}</Form.Label>

              <Form.Control
                className={styles.input}
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
                {t("cancel")}
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("processing") : t("saveChanges")}
              </Button>
            </div>

            {success && <p className={styles.success}>{success}</p>}

            {error && <p className={styles.error}>{error}</p>}
          </Form>
        </div>

        {/* Itinerary Editing */}
        <section className={styles.itinerarySection}>
          <div className={styles.itineraryHeader}>
            <span className={styles.eyebrow}>{t("tripPlan")}</span>

            <h2 className={styles.itineraryTitle}>{t("editYourItinerary")}</h2>

            <p className={styles.itinerarySubtitle}>{t("editYourItinerary")}</p>
          </div>

          <ItineraryPreview
            itinerary={itinerary}
            onRemovePlace={handleRemovePlace}
            onMovePlace={handleMovePlace}
          />
        </section>
      </Container>
    </main>
  );
}
