import { supabase } from "./supabaseClient";

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
