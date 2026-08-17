import React from 'react'
import PlaceCard from "../../components/features/PlaceCard/PlaceCard"
import styles from "./Favorites.module.css"

export default function Favorites({ favorites, setFavorites }) {

  return (
    <div className={styles.page}>
      <div className="container-fluid">
      <div className={styles.header}>

        <div>
          <h1 className={styles.title}>
            My Favorites
          </h1>

          <p className={styles.subtitle}>
            Your curated list of destinations to explore.
          </p>
        </div>

        <span className={styles.count}>
          {favorites.length} Saved Locations
        </span>

      </div>
      </div>


      {favorites.length === 0 ? (

        <div className={styles.empty}>
          No saved places yet.
        </div>

      ) : (

        <div className="container-fluid">
        <div className="row gy-4">

          {favorites.map((place) => (
            
            <div
              className="col-12 col-sm-6 col-md-6 col-lg-4 d-flex justify-content-center"
              key={place.id}
            >

            <PlaceCard
              key={place.id}
              {...place}
              favorites={favorites}
              setFavorites={setFavorites}
            />
            </div>

          ))}
            
        </div>
      </div>

      )}

    </div>
  )
}