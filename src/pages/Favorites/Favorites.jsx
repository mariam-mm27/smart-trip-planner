import React from 'react'
import { useLanguage } from '../../context/LanguageContext';
import PlaceCard from "../../components/features/PlaceCard/PlaceCard";

export default function Favorites({ favorites, setFavorites }) {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('myFavorites', 'My Favorites')}</h1>

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