import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaceCard from "./PlaceCard.jsx";
import { supabase } from "../../../services/supabaseClient.js";
import { FaMagnifyingGlass } from "react-icons/fa6";
import styles from "./Place.module.css";
import placeImage from "../../../assets/images/Frame 1.png";
import LoadingSpinner from "../../common/LoadingSpinner.jsx";

export default function Place({ favorites, setFavorites }) {

  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPlaces = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("id", { ascending: false });

      if (!error && isMounted) {
        setPlaces(data || []);
      } else if (error) {
        console.error("Error fetching places:", error);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.placesPage}>

      {/* Search Area */}
      <div className="container-fluid d-flex justify-content-center">

        <div className={styles.searchBox}>

          <div className={styles.searchInputWrapper}>
            <FaMagnifyingGlass className={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search destinations..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterButtons}>

            <button
              className={`${styles.filterBtn} ${styles.active}`}
            >
              ☷ Filters
            </button>

            <button className={styles.filterBtn}>
              Category
            </button>

            <button className={styles.filterBtn}>
              Price
            </button>

            <button className={styles.filterBtn}>
              Rating
            </button>

            {/* Favorites Button */}
            <button
              className={styles.filterBtn}
              onClick={() => navigate("/favorites")}
            >
              ❤️ Favorites
            </button>

          </div>

        </div>
      </div>


      {/* Places Cards */}
      <div className="container-fluid">

        {loading ? (

          <LoadingSpinner />

        ) : (

          <div className="row gy-4">

            {places.map((place) => (

              <div
                className="col-12 col-sm-6 col-md-6 col-lg-4 d-flex justify-content-center"
                key={place.id}
              >

                <PlaceCard
                  id={place.id}
                  image={place.image_url || place.imageUrl || place.image || placeImage}
                  imgTitle={place.category || place.imgTitle}
                  title={place.title}
                  description={place.description}
                  location={place.Location || place.location || place.location_url}
                  stars={place.rating || place.stars || "5.0"}
                  price={place.price}
                  reviews={place.reviews}
                  favorites={favorites}
                  setFavorites={setFavorites}
                />

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}