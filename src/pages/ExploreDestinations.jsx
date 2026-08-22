import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/Explore.module.css';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Destinations from '../components/common/Destinations';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const categoryItems = [
  { id: 'All', label: 'all' },
  { id: 'Beaches', label: 'beaches' },
  { id: 'Historical', label: 'historical' },
  { id: 'Hiking', label: 'hiking' },
  { id: 'Food', label: 'food' },
];

export default function ExploreDestinations() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const { data, error } = await supabase.from('places').select('*');
        if (error) throw error;
        setDestinations(data || []);
      } catch (err) {
        console.error('Error fetching destinations:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((place) => {
      const query = searchQuery.toLowerCase().trim();
      const matchedSearch =
        query === '' ||
        place.title?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query);

      const matchedCategory =
        activeFilter.toLowerCase() === 'all' ||
        place.category?.toLowerCase().trim() === activeFilter.toLowerCase().trim();
      return matchedCategory && matchedSearch;
    });
  }, [destinations, activeFilter, searchQuery]);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.searchCard}>
        <div className={styles.inputGroup}>
          <span className={styles.inputIcon}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('whereTo')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categories}>
          {categoryItems.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={clsx(styles.categoryBtn, {
                [styles.activeCategory]: activeFilter === cat.id,
              })}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.productGrid}>
        {loading ? (
          <div className="py-4 text-center">{t('search')}...</div>
        ) : filteredDestinations.length === 0 ? (
          <div className="py-4 text-center">
            <p>{t('noDestinations')}</p>
          </div>
        ) : (
          <div className={styles.destinationsList}>
            {filteredDestinations.map((place) => (
              <Destinations
                key={place.id}
                id={place.id}
                title={place.title}
                description={place.description}
                price={place.price}
                rating={place.rating}
                imageUrl={place.image_url || place.imageUrl}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
