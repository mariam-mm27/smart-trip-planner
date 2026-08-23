export function calculateTripDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();

  if (difference < 0) {
    return 0;
  }

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
}

export function buildDailyItinerary(places, duration) {
  if (!places?.length || !duration || duration <= 0) {
    return [];
  }

  const itinerary = Array.from({ length: duration }, (_, index) => ({
    day: index + 1,
    places: [],
  }));

  places.forEach((place, index) => {
    const dayIndex = index % duration;

    itinerary[dayIndex].places.push(place);
  });

  return itinerary;
}

export function removePlaceFromItinerary(itinerary, placeId, dayNumber) {
  return itinerary.map((day) => {
    if (day.day !== dayNumber) {
      return day;
    }

    return {
      ...day,
      places: day.places.filter((place) => place.id !== placeId),
    };
  });
}

export function movePlaceInItinerary(itinerary, placeId, fromDay, toDay) {
  let movedPlace = null;

  const updatedItinerary = itinerary.map((day) => {
    if (day.day !== fromDay) {
      return day;
    }

    movedPlace = day.places.find((place) => place.id === placeId);

    return {
      ...day,
      places: day.places.filter((place) => place.id !== placeId),
    };
  });

  if (!movedPlace) {
    return itinerary;
  }

  return updatedItinerary.map((day) => {
    if (day.day !== toDay) {
      return day;
    }

    return {
      ...day,
      places: [...day.places, movedPlace],
    };
  });
}

export function getTripStatus(endDate) {
  if (!endDate) {
    return "upcoming";
  }

  const end = new Date(endDate);

  if (Number.isNaN(end.getTime())) {
    return "upcoming";
  }

  // Compare calendar days only, so a trip ending today still counts as upcoming.
  end.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return end.getTime() < today.getTime() ? "completed" : "upcoming";
}

export function formatTripDate(dateString, lang = "en") {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
