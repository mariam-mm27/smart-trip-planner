import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import styles from '../styles/Details.module.css';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAutoText } from '../hooks/useAutoText';
import { getLocalized } from '../utils/i18nHelper';
import Toast from '../components/common/Toast';
import TripSelector from '../components/common/TripSelector';
import { FiArrowLeft } from 'react-icons/fi';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [addingToTrip, setAddingToTrip] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleGoBack = () => {
    navigate(-1);
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
      } catch (err) {
        console.error('Error loading destination:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlaceDetails();
  }, [id]);

  // Handle Add to Trip button
  const handleAddToTrip = async () => {
    if (!user) {
      setToastMessage(t('pleaseLogin'));
      setToastType('error');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    setShowTripSelector(true);
  };

  // Handle trip selection and insertion
  const handleSelectTrip = async (selectedTrip) => {
    try {
      setAddingToTrip(true);
      
      // Insert into trip_items table with correct schema
      const tripItemData = {
        trip_id: selectedTrip.id,
        place_id: parseInt(id),
        day_number: 1, // Default to day 1, can be improved with date selection
      };

      const { error } = await supabase
        .from('trip_items')
        .insert([tripItemData]);

      if (error) throw error;

      setToastMessage(t('addedToTrip'));
      setToastType('success');
      setShowTripSelector(false);

      // Navigate to My Trips after 2s
      setTimeout(() => {
        navigate('/my-trips');
      }, 2000);
    } catch (err) {
      console.error('Error adding to trip:', err.message);
      setToastMessage(err.message || 'Failed to add to trip');
      setToastType('error');
    } finally {
      setAddingToTrip(false);
    }
  };

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

  return (
    <div className={styles.pageWrapper}>
      {/* Back Button */}
      <button
        type="button"
        className={styles.backBtn}
        onClick={() => navigate(-1)}
        title="Go back"
        aria-label="Go back"
      >
        <FiArrowLeft /> {t("back")}
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
          {t('amenities')}
        </h2>
        {place.amenities?.length > 0 ? (
          place.amenities.map((item) => (
            <div key={item.id} className={styles.amenityContainer}>
              <h4 className={styles.amenityLabel}>
                {t(item.label, item.label)}
              </h4>
            </div>
          ))
        ) : (
          <p className="text-secondary text-xs">{t('noAmenities')}</p>
        )}
      </div>

      {/* Pricing Card */}
      <div className={styles.pricingContainer}>
        <p className={styles.pricingText}>
          {t('from')}{' '}
          <span>${place.price || 0}</span> <span>{t('perDay')}</span>
        </p>
        <button 
          className={styles.pricingAddBtn}
          onClick={handleAddToTrip}
          disabled={addingToTrip}
        >
          {addingToTrip ? t('processing') : t('addToMyTrip')}
        </button>
      </div>

      {/* Full-Width Bottom Back Button */}
      <button
        type="button"
        onClick={handleGoBack}
        className={styles.fullWidthBackBtn}
      >
        <i className="bi bi-arrow-left"></i>
        <span>{t('back')}</span>
      </button>

      {/* Trip Selector Modal */}
      {showTripSelector && (
        <TripSelector
          onClose={() => setShowTripSelector(false)}
          onSelectTrip={handleSelectTrip}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
} 