import { useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";

import {
  calculateTripDuration,
  buildDailyItinerary,
  removePlaceFromItinerary,
  movePlaceInItinerary,
} from "../../../utils/tripUtils";

import { getPlaces } from "../../../services/placeService";
import ItineraryPreview from "./ItineraryPreview/ItineraryPreview";
import { createTrip, createTripItems } from "../../../services/tripService";

import styles from "./TripForm.module.css";

export default function TripForm() {
  // Stores the main information entered by the user.
  const [tripData, setTripData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
  });

  const [errors, setErrors] = useState({});
  const [itinerary, setItinerary] = useState([]);
  const [isCreated, setIsCreated] = useState(false);

  // Loading state while places are being fetched and the itinerary is built.
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState("");

  // Saving states are used to prevent duplicate requests and show feedback.
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Prevents the same generated trip from being saved more than once.
  const [isSaved, setIsSaved] = useState(false);

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
      newErrors.title = "Trip title is required.";
    }

    if (!tripData.destination.trim()) {
      newErrors.destination = "Destination is required.";
    }

    if (!tripData.startDate) {
      newErrors.startDate = "Start date is required.";
    } else if (start < today) {
      newErrors.startDate = "Start date cannot be in the past.";
    }

    if (!tripData.endDate) {
      newErrors.endDate = "End date is required.";
    } else if (tripData.startDate && end < start) {
      newErrors.endDate = "End date cannot be before start date.";
    }

    if (!tripData.budget) {
      newErrors.budget = "Budget is required.";
    } else if (Number(tripData.budget) <= 0) {
      newErrors.budget = "Budget must be greater than 0.";
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
        setPlacesError("No places are available.");
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

      setPlacesError("Failed to load places. Please try again.");
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
      setSaveSuccess("Trip saved successfully!");
    } catch (error) {
      console.error("Failed to save trip:", error);

      setSaveError(error.message || "Failed to save trip. Please try again.");
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
            Plan Your Next <span>Adventure</span>
          </h1>

          <p className={styles.subtitle}>
            Create your trip and let us help you build the perfect itinerary.
          </p>
        </div>

        <div className={styles.card}>
          <Form onSubmit={handleSubmit} noValidate>
            {/* Trip title */}
            <Form.Group className="mb-4" controlId="tripTitle">
              <Form.Label className={styles.label}>Trip Title</Form.Label>

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
              <Form.Label className={styles.label}>Destination</Form.Label>

              <Form.Control
                className={styles.input}
                type="text"
                name="destination"
                placeholder="Where are you going?"
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
                  <Form.Label className={styles.label}>Start Date</Form.Label>

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
                  <Form.Label className={styles.label}>End Date</Form.Label>

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
                Trip Duration: <strong>{tripDuration} Days</strong>
              </div>
            )}

            {/* Trip budget */}
            <Form.Group className="mb-4" controlId="budget">
              <Form.Label className={styles.label}>Budget</Form.Label>

              <Form.Control
                className={styles.input}
                type="number"
                name="budget"
                min="1"
                placeholder="Enter your budget"
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
                ? "Building Itinerary..."
                : isCreated
                  ? "Regenerate Itinerary"
                  : "Create Trip"}
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
                  ? "Saving Trip..."
                  : isSaved
                    ? "Trip Saved"
                    : "Save Trip"}
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
