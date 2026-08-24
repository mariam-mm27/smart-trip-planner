import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { FiX } from 'react-icons/fi';
import styles from '../../styles/TripSelector.module.css';

// Helper function to calculate days between dates
function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  } catch {
    return 1;
  }
}

export default function TripSelector({ onClose, onSelectTrip }) {
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
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
      setError(t('selectTripToAdd') || 'Please select a trip');
      return;
    }
    onSelectTrip(selectedTrip.id, selectedDay);
    onClose();
  };

  const tripDaysCount = selectedTrip
    ? calculateDays(selectedTrip.start_date, selectedTrip.end_date)
    : 1;

  const daysOptions = Array.from({ length: tripDaysCount }, (_, i) => i + 1);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('selectTripModal') || 'Select a Trip'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <p className={styles.message}>{t('processing') || 'Loading...'}</p>
          ) : trips.length === 0 ? (
            <p className={styles.message}>{t('noTripsAvailable') || 'No trips available'}</p>
          ) : (
            <>
              <div className={styles.tripsList}>
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className={`${styles.tripItem} ${selectedTrip?.id === trip.id ? styles.selected : ''}`}
                    onClick={() => {
                      setSelectedTrip(trip);
                      setSelectedDay(1);
                      setError('');
                    }}
                  >
                    <input
                      type="radio"
                      name="trip"
                      value={trip.id}
                      checked={selectedTrip?.id === trip.id}
                      onChange={() => {
                        setSelectedTrip(trip);
                        setSelectedDay(1);
                        setError('');
                      }}
                      className={styles.radioInput}
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

              {selectedTrip && (
                <div className={styles.daySelector}>
                  <label htmlFor="day-select" className={styles.dayLabel}>
                    {t('selectDay') || 'Select Day'}:
                  </label>
                  <select
                    id="day-select"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className={styles.daySelect}
                  >
                    {daysOptions.map((day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('cancel') || 'Cancel'}
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedTrip || loading || trips.length === 0}
          >
            {t('confirm') || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
