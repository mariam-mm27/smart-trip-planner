import React, { useEffect, useState } from 'react'
import PlaceCard from './PlaceCard.jsx'
import { supabase } from "../../../services/supabaseClient.js";
export default function Place({ favorites, setFavorites }) {

  const [places, setPlaces] = useState([])

  useEffect(() => {
    supabase
      .from('places')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.log(error)
        } else {
          setPlaces(data)
        }
      })
  }, [])

  return (
    <>
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          id={place.id}
          image="src/assets/images/Frame 1.png"
          title={place.title}
          description={place.description}
          location={place.location}
          stars={place.stars}
          reviews={place.reviews}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      ))}
    </>
  )
}