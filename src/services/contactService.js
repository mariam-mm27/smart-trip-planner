import { supabase } from "./supabaseClient";

export const sendContactMessage = async (formData) => {
  const { error } = await supabase.from("contact_messages").insert([formData]);

  if (error) {
    throw error;
  }
};
