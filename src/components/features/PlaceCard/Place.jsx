import React from 'react'
import PlaceCard from './PlaceCard.jsx'

export default function Place() {
    const title = "Place"
    const location = "Location"
    const stars = 4.5
    const imgTitle = "Image Title"
    const image = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  return <>
  <PlaceCard
      title="Example Place"
      description="This is an example place."
      location="Example Location"
      stars={4.5}
      reviews={100}
      imgTitle="Example Image"
    />

    <PlaceCard
      title="Example Place"
      description="This is an example place."
      location="Example Location"
      stars={4.5}
      reviews={100}
      imgTitle="Example Image"
    />
  
  </>
}
