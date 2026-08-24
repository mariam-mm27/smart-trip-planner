import React, { useEffect, useState } from "react";

import { FaLocationDot } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { toast } from "react-hot-toast";

import { supabase } from "../../../services/supabaseClient.js";

import styles from "./PlaceCard.module.css";

import { useAutoText } from "../../../hooks/useAutoText";
import { useLanguage } from "../../../context/LanguageContext";
import { getLocalized } from "../../../utils/i18nHelper";

export default function PlaceCard(prop) {
  const { lang, t } = useLanguage();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const displayTitle = useAutoText(
    prop.title || getLocalized(prop, "title", lang)
  );

  const displayDescription = useAutoText(
    prop.description || getLocalized(prop, "description", lang)
  );

  // Check if this place is already a favorite
  useEffect(() => {
    const checkFavorite = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("place_id", prop.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking favorite:", error);
        return;
      }

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [prop.id]);

  async function handleFavorite() {
    if (favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        toast.error("Please login first");
        return;
      }

      // ADD favorite
      if (!isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            place_id: prop.id,
          });

        if (error) throw error;

        setIsFavorite(true);
        toast.success("Added to favorites");
      }

      // REMOVE favorite
      else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", prop.id);

        if (error) throw error;

        setIsFavorite(false);
        toast.success("Removed from favorites");

        if (prop.onFavoriteChange) {
          prop.onFavoriteChange(prop.id, false);
        }
      }
    } catch (error) {
      console.error("🔥 FAVORITE ERROR:", error);
      toast.error(error.message || "Failed to update favorite");
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <div className={styles["place-card"]}>
      <div className={styles["card-image"]}>
        <img
          src={prop.image}
          alt={displayTitle || ""}
        />

        <span className={styles["category"]}>
          {prop.imgTitle}
        </span>

        <button
          className={styles["favorite-btn"]}
          onClick={handleFavorite}
          disabled={favoriteLoading}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className={styles["card-content"]}>
        <h2 className={styles["card-title"]}>
          {displayTitle}
        </h2>

        <p className={styles["card-description"]}>
          {displayDescription}
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
            {t("planRoute")}
          </span>
        </div>
      </div>
    </div>
  );
}