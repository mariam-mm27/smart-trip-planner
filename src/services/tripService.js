import { supabase } from "./supabaseClient";
import { calculateTripDuration } from "../utils/tripUtils";

export async function createTrip(tripData) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      title: tripData.title,
      destination: tripData.destination,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      budget: Number(tripData.budget),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createTripItems(tripId, itinerary) {
  const tripItems = itinerary.flatMap((day) =>
    day.places.map((place) => ({
      trip_id: tripId,
      place_id: place.id,
      day_number: day.day,
    })),
  );

  if (tripItems.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("trip_items")
    .insert(tripItems)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyTrips() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTrip(tripId, tripData) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("trips")
    .update({
      title: tripData.title,
      destination: tripData.destination,
      start_date: tripData.startDate,
      end_date: tripData.endDate,
      budget: Number(tripData.budget),
    })
    .eq("id", tripId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTripById(tripId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTrip(tripId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

/*
 * Get a trip together with its saved itinerary.
 */
export async function getTripWithItinerary(tripId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // Get the trip and make sure it belongs to the current user.
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (tripError) {
    throw tripError;
  }

  // Get saved places and their day numbers.
  const { data: tripItems, error: itemsError } = await supabase
    .from("trip_items")
    .select(
      `
      id,
      trip_id,
      place_id,
      day_number,
      places (*)
    `,
    )
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true });

  if (itemsError) {
    throw itemsError;
  }

  const duration = calculateTripDuration(trip.start_date, trip.end_date);

  const itinerary = Array.from({ length: duration }, (_, index) => ({
    day: index + 1,
    places: [],
  }));

  tripItems.forEach((item) => {
    const day = itinerary.find(
      (dayItem) => dayItem.day === Number(item.day_number),
    );

    if (!day || !item.places) {
      return;
    }

    day.places.push({
      ...item.places,
      tripItemId: item.id,
    });
  });

  return {
    trip,
    itinerary,
  };
}

/*
 * Move a saved place to another day.
 */
export async function updateTripItemDay(tripItemId, tripId, dayNumber) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // Verify that the trip belongs to the current user.
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (tripError) {
    throw tripError;
  }

  const { data, error } = await supabase
    .from("trip_items")
    .update({
      day_number: Number(dayNumber),
    })
    .eq("id", tripItemId)
    .eq("trip_id", trip.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
 * Delete a saved place from a trip.
 */
export async function deleteTripItem(tripItemId, tripId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // Verify that the trip belongs to the current user.
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (tripError) {
    throw tripError;
  }

  const { error } = await supabase
    .from("trip_items")
    .delete()
    .eq("id", tripItemId)
    .eq("trip_id", trip.id);

  if (error) {
    throw error;
  }
}
