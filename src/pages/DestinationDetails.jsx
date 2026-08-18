import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Share2, 
//   Heart, 
//   MapPin, 
//   Star, 
//   Wifi, 
//   Waves, 
//   UtensilsCrossed, 
//   Dumbbell, 
//   PlusCircle,
//   Home,
//   Compass,
//   Info,
//   Mail
// } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export default function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('places')
          .select('*')
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
  const destination = place || {
    title: 'Neon Oasis Retreat',
    category: 'RESORT',
    rating: 4.9,
    location: 'Cyber-Kyoto, Sector 4',
    description:
      'Experience the pinnacle of synthetic tranquility at the Neon Oasis Retreat. Nestled in the heart of Sector 4, this sanctuary blends traditional zen aesthetics with cutting-edge environmental control systems. Enjoy atmospheric climate regulation, bioluminescent botanical gardens, and fully automated suite customization to ensure your stay is perfectly calibrated to your biological needs.',
    price: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
  };

  // const amenities = [
  //   { icon: Wifi, label: 'Quantum Link' },
  //   { icon: Waves, label: 'Thermal Pool' },
  //   { icon: UtensilsCrossed, label: 'Synth-Dining' },
  //   { icon: Dumbbell, label: 'Grav-Gym' },
  // ];

  return (
    <div>

    </div>
  );
}