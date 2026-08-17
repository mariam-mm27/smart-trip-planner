import { supabase } from "./supabaseClient";

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
