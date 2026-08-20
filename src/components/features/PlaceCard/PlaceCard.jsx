import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { supabase } from "../../../services/supabaseClient.js";
import styles from "./PlaceCard.module.css";

export default function PlaceCard(prop) {
  const [isFavorite, setIsFavorite] = useState(false);

  async function handleFavorite() {
    const previousState = isFavorite;

    // Optimistic UI
    setIsFavorite((prev) => !prev);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setIsFavorite(previousState);
        toast.error("Please login first");
        return;
      }

      if (!previousState) {
        // ADD FAVORITE
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            place_id: prop.id,
          });

        if (error) {
          throw error;
        }

        toast.success("Added to favorites");
      } else {
        // REMOVE FAVORITE
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", prop.id);

        if (error) {
          throw error;
        }

        toast.success("Removed from favorites");
      }
    } catch (error) {
      console.error("🔥 FAVORITE ERROR:", error);

      toast.error(error.message || "Failed to update favorite");

      // Rollback
      setIsFavorite(previousState);
    }
  }

  return (
    <div className={styles["place-card"]}>
      <div className={styles["card-image"]}>
        <img src={prop.image} alt="" />

        <button
          className={styles["favorite-btn"]}
          onClick={handleFavorite}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className={styles["card-content"]}>
        <h2 className={styles["card-title"]}>
          {prop.title}
        </h2>

        <p className={styles["card-description"]}>
          {prop.description}
        </p>

        <div className={styles["card-location"]}>
          <FaLocationDot />
          {prop.location}
        </div>

        <hr />

        <div className={styles["card-bottom"]}>
          <div className={styles["card-rating"]}>
            <FaRegStar className={styles["star-icon"]} />

            <span className={styles["stars"]}>
              {prop.stars}
            </span>
          </div>

          <span className={styles["plan-btn"]}>
            Plan Route
          </span>
        </div>
      </div>
    </div>
  );
}