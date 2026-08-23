import { supabase } from "./supabaseClient";

export const sendContactMessage = async (formData) => {
  const { error } = await supabase.from("contact_messages").insert([formData]);

  if (error) {
    throw error;
  }
};

export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};
