import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { FiX } from 'react-icons/fi';
import styles from '../../styles/TripSelector.module.css';

export default function TripSelector({ onClose, onSelectTrip }) {
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('trips')
          .select('id, title, start_date, end_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTrips(data || []);
      } catch (err) {
        console.error('Error fetching trips:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleConfirm = () => {
    if (!selectedTrip) {
      setError(t('selectTripToAdd'));
      return;
    }
    onSelectTrip(selectedTrip);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('selectTripModal')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <p className={styles.message}>{t('processing')}</p>
          ) : trips.length === 0 ? (
            <p className={styles.message}>{t('noTripsAvailable')}</p>
          ) : (
            <div className={styles.tripsList}>
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className={`${styles.tripItem} ${selectedTrip?.id === trip.id ? styles.selected : ''}`}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <input
                    type="radio"
                    name="trip"
                    value={trip.id}
                    checked={selectedTrip?.id === trip.id}
                    onChange={() => setSelectedTrip(trip)}
                  />
                  <div className={styles.tripInfo}>
                    <h3 className={styles.tripTitle}>{trip.title}</h3>
                    <p className={styles.tripDates}>
                      {trip.start_date} → {trip.end_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedTrip || loading || trips.length === 0}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
