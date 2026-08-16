import React from 'react'
import PlaceCard from "../../components/features/PlaceCard/PlaceCard";

export default function Favorites({ favorites, setFavorites }) {
  return (
    <div>
      <h1>My Favorites</h1>

      {favorites.map((place) => (
        <PlaceCard
          key={place.id}
          {...place}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      ))}
    </div>
  );
}