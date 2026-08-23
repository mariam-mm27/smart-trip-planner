import { supabase } from "./supabaseClient";

// `Location` is capitalised in the database, unlike every other column.
function toPlaceRow(placeData) {
  return {
    title: placeData.title,
    description: placeData.description,
    category: placeData.category,
    rating: Number(placeData.rating),
    price: Number(placeData.price),
    image_url: placeData.imageUrl,
    Location: placeData.location,
  };
}

export async function getPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("rating", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getAllPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getPlaceById(placeId) {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", placeId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPlace(placeData) {
  const { data, error } = await supabase
    .from("places")
    .insert(toPlaceRow(placeData))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePlace(placeId, placeData) {
  const { data, error } = await supabase
    .from("places")
    .update(toPlaceRow(placeData))
    .eq("id", placeId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePlace(placeId) {
  const { error } = await supabase.from("places").delete().eq("id", placeId);

  if (error) {
    throw error;
  }
}

