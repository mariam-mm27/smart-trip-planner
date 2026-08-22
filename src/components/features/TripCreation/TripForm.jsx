import { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useLanguage } from "../../../context/LanguageContext";

import {
  calculateTripDuration,
  buildDailyItinerary,
  removePlaceFromItinerary,
  movePlaceInItinerary,
} from "../../../utils/tripUtils";

import { getPlaces } from "../../../services/placeService";
import ItineraryPreview from "./ItineraryPreview/ItineraryPreview";
import { createTrip, createTripItems } from "../../../services/tripService";
import { useNavigate } from "react-router-dom";
import styles from "./TripForm.module.css";

const CREATE_TRIP_DRAFT_KEY = "smartTripPlanner_createTripDraft";

function getCreateTripDraft() {
  try {
    const savedDraft = sessionStorage.getItem(CREATE_TRIP_DRAFT_KEY);

    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch (error) {
    console.error("Failed to load create trip draft:", error);
    return null;
  }
}

export default function TripForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  // Restore the current create-trip draft when returning from a details page.
  const savedDraft = getCreateTripDraft();

  // Stores the main information entered by the user.
  const [tripData, setTripData] = useState(
    savedDraft?.tripData || {
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: "",
    },
  );

  const [errors, setErrors] = useState({});
  const [itinerary, setItinerary] = useState(savedDraft?.itinerary || []);
  const [isCreated, setIsCreated] = useState(savedDraft?.isCreated || false);

  // Loading state while places are being fetched and the itinerary is built.
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState("");

  // Saving states are used to prevent duplicate requests and show feedback.
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Prevents the same generated trip from being saved more than once.
  const [isSaved, setIsSaved] = useState(false);

  // Keep the current create-trip draft while navigating to destination details.
  useEffect(() => {
    const hasTripData = Object.values(tripData).some((value) => value !== "");
    const hasItinerary = itinerary.length > 0;

    if (!hasTripData && !hasItinerary) {
      sessionStorage.removeItem(CREATE_TRIP_DRAFT_KEY);
      return;
    }

    sessionStorage.setItem(
      CREATE_TRIP_DRAFT_KEY,
      JSON.stringify({
        tripData,
        itinerary,
        isCreated,
      }),
    );
  }, [tripData, itinerary, isCreated]);

  // Get today's date to prevent users from selecting a past date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().split("T")[0];

  // Calculate the number of days based on the selected dates.
  const tripDuration = calculateTripDuration(
    tripData.startDate,
    tripData.endDate,
  );

  // Validate all required trip fields before generating the itinerary.
  const validateForm = () => {
    const newErrors = {};

    const start = tripData.startDate ? new Date(tripData.startDate) : null;
    const end = tripData.endDate ? new Date(tripData.endDate) : null;

    if (!tripData.title.trim()) {
      newErrors.title = t("tripTitleRequired");
    }

    if (!tripData.destination.trim()) {
      newErrors.destination = t("destinationRequired");
    }

    if (!tripData.startDate) {
      newErrors.startDate = t("startDateRequired");
    } else if (start < today) {
      newErrors.startDate = t("startDatePast");
    }

    if (!tripData.endDate) {
      newErrors.endDate = t("endDateRequired");
    } else if (tripData.startDate && end < start) {
      newErrors.endDate = t("endDateBeforeStart");
    }

    if (!tripData.budget) {
      newErrors.budget = t("budgetRequired");
    } else if (Number(tripData.budget) <= 0) {
      newErrors.budget = t("budgetPositive");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Update the form state whenever the user changes an input.
  function handleChange(event) {
    const { name, value } = event.target;

    setTripData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // Reset the end date if it becomes earlier than the new start date.
      if (
        name === "startDate" &&
        updatedData.endDate &&
        value > updatedData.endDate
      ) {
        updatedData.endDate = "";
      }

      return updatedData;
    });

    // Clear the field error while the user is editing it.
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Changing the start date can also affect the end date validation.
    if (name === "startDate") {
      setErrors((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    }
  }

  // Generate a new itinerary based on the selected trip details.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoadingPlaces(true);
      setPlacesError("");

      // Get the available places from Supabase.
      const places = await getPlaces();

      if (!places || places.length === 0) {
        setPlacesError(t("noPlacesAvailable"));
        return;
      }

      // We need two places per day for the generated itinerary.
      const suggestedPlaces = places.slice(0, Math.max(tripDuration * 2, 1));

      const generatedItinerary = buildDailyItinerary(
        suggestedPlaces,
        tripDuration,
      );

      setItinerary(generatedItinerary);
      setIsCreated(true);

      // A regenerated itinerary is a new version, so it needs to be saved again.
      setIsSaved(false);
      setSaveSuccess("");
      setSaveError("");

      // Scroll down to the generated itinerary.
      setTimeout(() => {
        document.getElementById("itinerary-preview")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Failed to load places:", error);

      setPlacesError(t("failedLoadPlaces"));
    } finally {
      setIsLoadingPlaces(false);
    }
  }

  // Remove a place from a specific day in the itinerary.
  function handleRemovePlace(placeId, dayNumber) {
    setItinerary((currentItinerary) =>
      removePlaceFromItinerary(currentItinerary, placeId, dayNumber),
    );
  }

  // Move a place from one day to another.
  function handleMovePlace(placeId, fromDay, toDay) {
    setItinerary((currentItinerary) =>
      movePlaceInItinerary(currentItinerary, placeId, fromDay, toDay),
    );
  }

  // Save the trip and its generated itinerary to Supabase.
  async function handleSaveTrip() {
    // Prevent duplicate saves, including fast double clicks.
    if (isSaved || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");
      setSaveSuccess("");

      // Create the main trip record first.
      const trip = await createTrip(tripData);

      // Save the places assigned to each day of the trip.
      await createTripItems(trip.id, itinerary);

      // Disable the save button after a successful save.
      setIsSaved(true);
      setSaveSuccess(t("tripSavedSuccessfully"));

      // The trip is now saved in Supabase, so the temporary draft is no longer needed.
      sessionStorage.removeItem(CREATE_TRIP_DRAFT_KEY);

      // Open the newly saved trip directly in its View page.
      navigate(`/view-trip/${trip.id}`);
    } catch (error) {
      console.error("Failed to save trip:", error);

      setSaveError(error.message || t("failedSaveTrip"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.header}>
          <span className={styles.eyebrow}>SMART TRIP PLANNER</span>

          <h1 className={styles.title}>
            {t("planRoute")} <span>{t("heroTitleHighlight")}</span>
          </h1>

          <p className={styles.subtitle}>{t("heroSubtitle")}</p>
        </div>

        <div className={styles.card}>
          <Form onSubmit={handleSubmit} noValidate>
            {/* Trip title */}
            <Form.Group className="mb-4" controlId="tripTitle">
              <Form.Label className={styles.label}>{t("tripTitle")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="text"
                name="title"
                placeholder="e.g. Summer in Japan"
                value={tripData.title}
                onChange={handleChange}
                isInvalid={!!errors.title}
              />

              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Trip destination */}
            <Form.Group className="mb-4" controlId="destination">
              <Form.Label className={styles.label}>
                {t("destination")}
              </Form.Label>

              <Form.Control
                className={styles.input}
                type="text"
                name="destination"
                placeholder={t("whereAreYouGoing")}
                value={tripData.destination}
                onChange={handleChange}
                isInvalid={!!errors.destination}
              />

              <Form.Control.Feedback type="invalid">
                {errors.destination}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Start and end dates */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4" controlId="startDate">
                  <Form.Label className={styles.label}>
                    {t("startDate")}
                  </Form.Label>

                  <Form.Control
                    className={styles.input}
                    type="date"
                    name="startDate"
                    min={todayString}
                    value={tripData.startDate}
                    onChange={handleChange}
                    isInvalid={!!errors.startDate}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.startDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4" controlId="endDate">
                  <Form.Label className={styles.label}>
                    {t("endDate")}
                  </Form.Label>

                  <Form.Control
                    className={styles.input}
                    type="date"
                    name="endDate"
                    min={tripData.startDate || todayString}
                    value={tripData.endDate}
                    onChange={handleChange}
                    isInvalid={!!errors.endDate}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.endDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Show the calculated trip duration once both dates are selected. */}
            {tripDuration > 0 && (
              <div className={styles.duration}>
                {t("tripDuration")}:{" "}
                <strong>
                  {tripDuration} {t("days")}
                </strong>
              </div>
            )}

            {/* Trip budget */}
            <Form.Group className="mb-4" controlId="budget">
              <Form.Label className={styles.label}>{t("budget")}</Form.Label>

              <Form.Control
                className={styles.input}
                type="number"
                name="budget"
                min="1"
                placeholder={t("enterYourBudget")}
                value={tripData.budget}
                onChange={handleChange}
                isInvalid={!!errors.budget}
              />

              <Form.Control.Feedback type="invalid">
                {errors.budget}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Generate or regenerate the itinerary */}
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoadingPlaces}
            >
              {isLoadingPlaces
                ? t("buildingItinerary")
                : isCreated
                  ? t("regenerateItinerary")
                  : t("createTrip")}
            </Button>
          </Form>
        </div>

        {isCreated && (
          <div id="itinerary-preview">
            <ItineraryPreview
              itinerary={itinerary}
              onRemovePlace={handleRemovePlace}
              onMovePlace={handleMovePlace}
            />

            {/* Save the generated trip to Supabase */}
            <div className={styles.saveSection}>
              <Button
                type="button"
                className={styles.saveButton}
                onClick={handleSaveTrip}
                disabled={isSaving || isSaved}
              >
                {isSaving
                  ? t("savingTrip")
                  : isSaved
                    ? t("tripSaved")
                    : t("saveTrip")}
              </Button>

              {saveSuccess && (
                <p className={styles.successMessage}>{saveSuccess}</p>
              )}

              {saveError && <p className={styles.errorMessage}>{saveError}</p>}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
