import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import styles from '../styles/Details.module.css'

const ALLOWED_MAP_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'google.com'];

// Stops a bad DB value from becoming a javascript: link or an off-site redirect.
function getSafeMapsUrl(raw) {
  if (typeof raw !== 'string') return null;

  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:') return null;

    const host = url.hostname.toLowerCase();
    const isAllowed = ALLOWED_MAP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return isAllowed ? url.href : null;
  } catch {
    return null;
  }
}

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amenities,setamenities]=useState()
  

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          amenities (
            id,
            label
          )
        `)
        .eq('id', id)
        .single();

        if (error) throw error;
        setPlace(data);
      } catch (err) {
        console.error('Error loading destination:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaceDetails();
  }, [id]);

  

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-cyan-400 flex items-center justify-center font-mono">
        <span className="animate-pulse tracking-widest text-sm">CALIBRATING SYSTEMS...</span>
      </div>
    );
  }

  // Fallback data structure in case certain database fields are optional
  

  const mapsUrl = getSafeMapsUrl(place?.Location);
  // The short share link can't be framed, so the preview is geocoded from the title instead.
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(place?.title || '')}&z=13&output=embed`;

  return (
    <div className={styles.pageWrapper}>
      {/* image */}
        <div className={styles.imageContainer}>
          <img src={place.image_url} alt={place?.title || 'Destination'} />
        </div>
        <div className={styles.textContainer}>
        <div className={styles.perksContainer}>
          <span className={styles.category}>{place.category}</span>
          <span className={styles.rating}>{place.rating}</span>
        </div>
        <h1 className={styles.title}>{place.title}</h1>
        <h2 className={styles.about}>About</h2>
        <p className={styles.description}>{place.description}</p>
      </div>

      <div className={styles.amenitiesContainer}>
        <h1 className={styles.amenitiesHeading}>
          Amenties
        </h1>
        {/* amenities box */}
        {place.amenities.map((item)=>(
          <div key={item.id} className={styles.amenityContainer} >
          <h4 className={styles.amenityLabel}>{item.label}</h4>
        </div>
        ))}
        
       
      </div>
        {/* price */}
      <div className={styles.pricingContainer}>
        <p className={styles.pricingText}>
          Starting from <span>{place.price}</span> <span>CR/night</span>
         </p>

        {mapsUrl && (
          <div className={styles.mapSection}>
            <h3 className={styles.mapHeading}>Location</h3>
            <a
              className={styles.mapCard}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${place.title || 'this destination'} in Google Maps`}
            >
              <iframe
                className={styles.mapFrame}
                src={mapEmbedSrc}
                title={`Map of ${place.title || 'destination'}`}
                loading="lazy"
                tabIndex={-1}
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* An iframe swallows clicks, so a transparent layer forwards them to the anchor. */}
              <span className={styles.mapOverlay} aria-hidden="true" />
              <span className={styles.mapFooter}>
                <span className={styles.mapPlaceName}>{place.title}</span>
                <span className={styles.mapCta}>Open in Google Maps ↗</span>
              </span>
            </a>
          </div>
        )}

        <button className={styles.pricingBookBtn}>Book Now!</button>
        <button className={styles.pricingAddBtn}>Add to My Trip</button>
      </div>
    </div>
  );
}