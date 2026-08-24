import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/Explore.module.css';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Destinations from '../components/common/Destinations';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const categoryItems = [
  { id: 'All',label:'all'},
  { id: 'Beaches', label: 'beaches' },
  { id: 'Historical', label: 'historical' },
  { id: 'Hiking', label: 'hiking' },
  { id: 'Food', label: 'food' },
];

export default function ExploreDestinations({ favorites = [], setFavorites }) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen,setIsSidebarOpen]=useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [maxPrice, setMaxPrice] = useState(1000);                   
  const [minRating, setMinRating] = useState(0);                   
  const [sortBy, setSortBy] = useState('popular');

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
  const toggleCategory = (catId) => {
      setSelectedCategories((prev) =>
        prev.includes(catId) ? prev.filter((item) => item !== catId) : [...prev, catId]
      );
    };

    const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
    setSelectedCategories([]);
    setMaxPrice(1000);
    setMinRating(0);
    setSortBy('popular');
  };
  const filteredDestinations = useMemo(() => {
    const filtered = destinations.filter((place) => {
      const query = searchQuery.toLowerCase().trim();
      const matchedSearch =
        query === '' ||
        place.title?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query);
      //category
      const matchedCategory =
        activeFilter.toLowerCase() === 'all' ||
        place.category?.toLowerCase().trim() === activeFilter.toLowerCase().trim();
      //price
      const matchedPrice = Number(place.price || 0) <= maxPrice;
      //rating
      const matchedRating = Number(place.rating || 0) >= minRating;

      return matchedCategory && matchedSearch && matchedPrice && matchedRating;
    });
    return[...filtered].sort((a,b)=>{
      if(sortBy === 'price-asc'){
        return(a.price||0) - (b.price || 0)
      }
      if(sortBy === 'price-desc'){
        return(b.price||0) - (a.price || 0)
      }
      if(sortBy === 'rating'){
        return (b.rating||0) - (a.rating||0)
      }
      return(b.id || 0) - (a.id || 0);//default "popular"
    })
  }, [destinations, activeFilter, searchQuery,selectedCategories,minRating,maxPrice,sortBy]);

    return (
    <div className={styles.pageWrapper}>
      
      {/* Slide-out Sidebar on the Left */}
      <aside className={clsx(styles.filterSidebar, { [styles.sidebarOpen]: isSidebarOpen })}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>
            <i className="bi bi-sliders me-2"></i>
            {t('filters') || 'Filters & Sort'}
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.sidebarBody}>
          {/* Sort Selection */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('sortBy') || 'Sort By'}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.selectInput}
            >
              <option value="popular">{t("popular")}</option>
              <option value="rating">{t("highestRated")}</option>
              <option value="price-asc">{t("priceLowHigh")}</option>
              <option value="price-desc">{t("priceHighLow")}</option>
            </select>
          </div>

          {/* Max Budget Slider */}
          <div className={styles.filterGroup}>
            <div className="d-flex justify-content-between mb-1">
              <label className={styles.filterLabel}>{t('budget') || 'Max Budget'}</label>
              <span className={styles.filterValue}>${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>

          {/* Rating Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('minRating') || 'Minimum Rating'}</label>
            <div className="d-flex gap-2">
              {[0, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setMinRating(rate)}
                  className={clsx(styles.ratingPill, {
                    [styles.activeRatingPill]: minRating === rate,
                  })}
                >
                  {rate === 0 ? t("all") : `⭐ ${rate}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 d-flex flex-column gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className={styles.clearBtn}
            >
              {t('clearFilters') || 'Clear All Filters'}
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className={styles.applyBtn}
            >
              {t("applyAndClose")}
            </button>
          </div>
          {/* Categories */}
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
        </div>
      </aside>

      {/* Main Page Content */}
      <section className={styles.searchCard}>
        <div className="d-flex gap-2 w-100">
          {/* Toggle Trigger Button */}
          <button
            type="button"
            className={styles.sidebarTriggerBtn}
            onClick={()=>isSidebarOpen==true?setIsSidebarOpen(false):setIsSidebarOpen(true)}
          >
           ☰
          </button>

          {/* Search Input */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('whereTo')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        
      </section>

      {/* Results */}
      <section className={styles.productGrid}>
        {loading ? (
          <div className="py-4 text-center text-secondary">{t('search')}...</div>
        ) : filteredDestinations.length === 0 ? (
          <div className="py-5 text-center text-secondary">
            <p className="mb-2">{t('noDestinations')}</p>
            <button
              type="button"
              className="btn btn-sm btn-outline-info rounded-pill px-3"
              onClick={handleClearFilters}
            >
              {t('clearFilters') || 'Reset'}
            </button>
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
              category={place.category}
              location={place.location}
              lang={lang}
              favorites={favorites}
              setFavorites={setFavorites}
            />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}