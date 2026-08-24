import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch all favorites for current user
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('place_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Store as Set for O(1) lookup time
      const favoriteIds = new Set(data?.map(fav => fav.place_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch on user change
  useEffect(() => {
    fetchFavorites();
  }, [user, fetchFavorites]);

  // Check if a place is favorited
  const isFavorited = useCallback((placeId) => {
    return favorites.has(placeId);
  }, [favorites]);

  // Add to favorites
  const addFavorite = useCallback(async (placeId) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          place_id: placeId
        });

      if (error) throw error;

      setFavorites(prev => new Set([...prev, placeId]));
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }, [user]);

  // Remove from favorites
  const removeFavorite = useCallback(async (placeId) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) throw error;

      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(placeId);
        return newSet;
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }, [user]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (placeId) => {
    if (isFavorited(placeId)) {
      return removeFavorite(placeId);
    } else {
      return addFavorite(placeId);
    }
  }, [isFavorited, addFavorite, removeFavorite]);

  const value = {
    favorites,
    loading,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
