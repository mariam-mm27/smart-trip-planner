import React,{useState,useEffect,useMemo} from 'react'
import styles from '../styles/Explore.module.css'
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Destinations from '../components/common/Destinations';
import { supabase } from '../services/supabaseClient';

const categories = ['All', 'Beaches', 'Historical', 'Hiking', 'Food'];
export default function ExploreDestinations() {
    
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
    <div className={styles.pageWrapper}>
      
        <section className={styles.searchCard}>
          <div className="input-group mb-2 rounded-3 border border-secondary border-opacity-25" style={{ backgroundColor: '#0d1527' }}>
            <span className="input-group-text bg-transparent border-0 text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 text-white shadow-none"
              placeholder="Search Destinations..."
              value={searchQuery}
              onChange={(e)=>{setSearchQuery(e.target.value)}}
            />
          </div>

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
        </section>

        <section className={styles.productGrid}>
        {loading?(<div>
            Loading...
        </div>):filteredDestinations.length === 0?(
            <div>
                <p>No Destinations match title or category</p>
            </div>
        ):
        (<div className={styles.destinationsList}>
        {filteredDestinations.map((place)=>
        (
            <Destinations
             key={place.id}
            id={place.id}
            title={place.title}
            description={place.description}
            price={place.price}
            rating={place.rating}
            imageUrl={place.imageUrl}
             />
        ))}
            </div>)
            }
        </section>
    </div>
  )
}
