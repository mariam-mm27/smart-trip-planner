import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import styles from '../styles/Details.module.css';
import { useLanguage } from '../context/LanguageContext';
import { useAutoText } from '../hooks/useAutoText';
import { getLocalized } from '../utils/i18nHelper';
import { FiArrowLeft, FiShare2, FiHeart, FiHeartFill } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import TripSelector from '../components/common/TripSelector';
import Toast from '../components/common/Toast';

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
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddToTrip = () => {
    if (!user) {
      setToast({
        show: true,
        message: t('pleaseLoginToAddTrip') || 'Please login to add places to your trip',
        type: 'error'
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    setShowTripSelector(true);
  };

  const handleTripSelected = async (tripId, dayNumber) => {
    try {
      const { error } = await supabase
        .from('trip_items')
        .insert({
          trip_id: tripId,
          place_id: id,
          day_number: dayNumber
        });

      if (error) throw error;

      setToast({
        show: true,
        message: t('addedToTripSuccess') || 'Added to My Trips successfully!',
        type: 'success'
      });

      setShowTripSelector(false);

      // Redirect to View Trip page
      setTimeout(() => {
        navigate(`/view-trip/${tripId}`);
      }, 1500);
    } catch (error) {
      console.error('Error adding to trip:', error);
      setToast({
        show: true,
        message: t('failedToAddToTrip') || 'Failed to add to trip',
        type: 'error'
      });
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setToast({
        show: true,
        message: t('linkCopiedToClipboard') || 'Link copied to clipboard!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setToast({
        show: true,
        message: t('failedToCopyLink') || 'Failed to copy link',
        type: 'error'
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setToast({
        show: true,
        message: t('pleaseLoginToAddTrip') || 'Please login to add to favorites',
        type: 'error'
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('place_id', id);

        if (error) throw error;

        setIsFavorite(false);
        setToast({
          show: true,
          message: t('removedFromFavorites') || 'Removed from favorites',
          type: 'success'
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            place_id: id
          });

        if (error) throw error;

        setIsFavorite(true);
        setToast({
          show: true,
          message: t('addedToFavorites') || 'Added to favorites!',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setToast({
        show: true,
        message: error?.message || t('unexpectedError') || 'An error occurred',
        type: 'error'
      });
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', id)
        .single();

      if (data) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      // No favorite found or error, that's okay
      setIsFavorite(false);
    }
  };

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
        
        // Check if this place is favorited
        await checkIfFavorite();
      } catch (err) {
        console.error('Error loading destination:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaceDetails();
  }, [id, user]);

  // Localized dynamic texts
  const displayTitle = useAutoText(
    place?.title || getLocalized(place || {}, 'title', lang)
  );
  const displayDescription = useAutoText(
    place?.description || getLocalized(place || {}, 'description', lang)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-cyan-400 flex items-center justify-center font-mono">
        <span className="animate-pulse tracking-widest text-sm">
          {t('calibratingSystems') || 'CALIBRATING SYSTEMS...'}
        </span>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-300 flex flex-col items-center justify-center gap-4">
        <p>{t('noDestinations') || 'Destination not found.'}</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm"
        >
          {t('back') || 'Go Back'}
        </button>
      </div>
    );
  }

  const mapsUrl = getSafeMapsUrl(place?.Location);
  // The short share link can't be framed, so the preview is geocoded from the title instead.
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    place?.title || ''
  )}&z=13&output=embed`;

  return (
    <div className={styles.pageWrapper}>
      {/* Back Arrow Button */}
      <button
        onClick={() => navigate(-1)}
        className={styles.backBtn}
        aria-label="Go back"
      >
        <FiArrowLeft /> {t('back') || 'Back'}
      </button>

      {/* Top Image Banner */}
      <div className={styles.imageContainer}>
        <img
          src={place.image_url || place.imageUrl}
          alt={displayTitle || 'Destination'}
        />
      </div>

      {/* Place Details */}
      <div className={styles.textContainer}>
        <div className={styles.perksContainer}>
          <span className={styles.category}>
            {t(place.category?.toLowerCase()) || place.category}
          </span>
          <span className={styles.rating}>⭐ {place.rating || '5.0'}</span>
        </div>
        <h1 className={styles.title}>{displayTitle}</h1>
        <h2 className={styles.about}>{t('about') || 'About'}</h2>
        <p className={styles.description}>{displayDescription}</p>
      </div>

      {/* Amenities Section */}
      <div className={styles.amenitiesContainer}>
        <h2 className={styles.amenitiesHeading}>
          {t('amenities') || 'Amenities'}
        </h2>
        {place.amenities?.length > 0 ? (
          place.amenities.map((item) => (
            <div key={item.id} className={styles.amenityContainer}>
              <h4 className={styles.amenityLabel}>
                {t(item.label) || item.label}
              </h4>
            </div>
          ))
        ) : (
          <p className="text-secondary text-xs">{t('noAmenities') || 'No amenities available'}</p>
        )}
      </div>

      {/* Pricing Card */}
      <div className={styles.pricingContainer}>
        <p className={styles.pricingText}>
          {t('from') || 'Starting from'}{' '}
          <span>${place.price || 0}</span> <span>{t('perDay') || 'per night'}</span>
        </p>

        {mapsUrl && (
          <div className={styles.mapSection}>
            <h3 className={styles.mapHeading}>{t('location') || 'Location'}</h3>
            <a
              className={styles.mapCard}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('openInGoogleMaps') || 'Open in Google Maps'}: ${
                displayTitle || place.title || ''
              }`}
            >
              <iframe
                className={styles.mapFrame}
                src={mapEmbedSrc}
                title={`${t('location') || 'Location'}: ${place.title || ''}`}
                loading="lazy"
                tabIndex={-1}
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* An iframe swallows clicks, so a transparent layer forwards them to the anchor. */}
              <span className={styles.mapOverlay} aria-hidden="true" />
              <span className={styles.mapFooter}>
                <span className={styles.mapPlaceName}>{displayTitle || place.title}</span>
                <span className={styles.mapCta}>
                  {t('openInGoogleMaps') || 'Open in Google Maps'} ↗
                </span>
              </span>
            </a>
          </div>
        )}

        <button 
          className={styles.pricingAddBtn}
          onClick={handleAddToTrip}
        >
          {t('addToMyTrip') || (lang === 'ar' ? 'أضف إلى رحلتي' : 'Add to My Trip')}
        </button>

        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FiHeartFill /> : <FiHeart />}
            {t('favorites') || 'Favorite'}
          </button>

          <button 
            className={styles.shareBtn}
            onClick={handleShare}
            title="Share this destination"
            aria-label="Share"
          >
            <FiShare2 /> {t('share') || 'Share'}
          </button>
        </div>
      </div>

      {/* Full-Width Bottom Back Button */}
      <button
        type="button"
        onClick={handleGoBack}
        className={styles.fullWidthBackBtn}
      >
        <i className="bi bi-arrow-left"></i>
        <span>{t('back') || (lang === 'ar' ? 'رجوع' : 'Go Back')}</span>
      </button>

      {/* Trip Selector Modal */}
      {showTripSelector && (
        <TripSelector
          onClose={() => setShowTripSelector(false)}
          onSelectTrip={handleTripSelected}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
} 