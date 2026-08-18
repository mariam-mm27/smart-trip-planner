import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import clsx from 'clsx';
import Destinations from '../components/common/Destinations'

const categories = ['All', 'Beaches', 'Historical', 'Hiking', 'Food'];

export default function Home() {
  const navigate = useNavigate();
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

 
    const filteredDestinations=  useMemo(()=>{
      return destinations.filter((place)=>{
        const query = searchQuery.toLowerCase().trim();
        const matchedSearch =
        query === ''||
        place.title?.toLowerCase().includes(query)||
        place.description?.toLowerCase().includes(query)

      const matchedCategory=
      activeFilter.toLowerCase() === "all"||
      place.category?.toLowerCase().trim()
       return matchedCategory & matchedSearch
      })     
    },[destinations,activeFilter,searchQuery])


  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Plan Your Next Adventure <span>Smartly</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Leverage AI-driven insights to craft the perfect itinerary. Optimize
          routes, manage budgets, and explore the unknown with precision.
        </p>

       
        <div className={styles.searchCard}>
          <div className="input-group mb-2 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: '#0d1527' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Where to?"
              value={searchQuery}
              onChange={(e)=>{setSearchQuery(e.target.value)}}
            />
          </div>

          <div className="input-group mb-3 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: '#0d1527' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary">
              <i className="bi bi-calendar"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Dates"
            />
          </div>

          <button onClick={()=>{document.getElementById('destinations-section')?.scrollIntoView({ behavior: 'smooth' });}} className={styles.searchBtn}>Search</button>

          {/* Category Filter Pills */}
          <div className={styles.categories}>
            {categories.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilter(tag)}
                className={clsx(styles.categoryBtn, {
                  [styles.activeCategory]: activeFilter === tag,
                })}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

   
      <section className={styles.destinationsSection}>
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3 bg-transparent">
          <i className="bi bi-fire text-info fs-5"></i>
          <h2 className="fs-5 fw-bold mb-0 ms-3 text-white bg-transparent text-center">Trending Destinations</h2>
        </div>

        {loading ? (
          <p className="text-secondary text-center py-4">Loading destinations...</p>
        ) :  filteredDestinations.length === 0 ? (
          <div className='text-center py-5'>
            <p classname='text-secondary mb-2'>No destinations</p>
            <button
              className="btn btn-sm btn-outline-info rounded-pill px-3"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
            >
              Clear Filters
            </button>
          </div>
        ):(
          <div className={styles.destinationsList}>
            {filteredDestinations.map((place) => (
              <Destinations
                key={place.id}
                id={place.id}
                title={place.title}
                description={place.description}
                price={place.price}
                rating={place.rating}
                imageUrl={place.image_url}
              />
            ))}
          </div>
        )}
      </section>
      {/* benefits */}
      <section className={styles.benefits}>
        <div className={styles.benefitsItem}>
          <img className={styles.benefitsImg} src="" alt="" />
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>AI Planner</h4>
            <p className={styles.benefitsDescription}>Intelligent algorithms craft routes optimized for time, weather, and crowds.</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <img className={styles.benefitsImg} src="" alt="" />
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>Budgeting</h4>
            <p className={styles.benefitsDescription}>Real-time expense tracking with predictive cost modeling for your journey.</p>
          </div>
        </div>
        <div className={styles.benefitsItem}>
          <img className={styles.benefitsImg} src="" alt="" />
          <div className={styles.benefitsText}>
            <h4 className={styles.benefitsHeading}>Offline Access</h4>
            <p className={styles.benefitsDescription}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis, alias rerum ad doloremque at aspernatur?</p>
          </div>
        </div>
      </section>
    </div>
  );
}