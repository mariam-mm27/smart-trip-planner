import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(currentUser) {
      if (!currentUser) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    }

    // User and profile are set together so `loading` only clears once the role is known.
    async function syncSession(session) {
      const currentUser = session?.user ?? null;
      const currentProfile = await loadProfile(currentUser);

      if (!isMounted) {
        return;
      }

      setUser(currentUser);
      setProfile(currentProfile);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Deferred: awaiting Supabase calls directly inside this callback can deadlock the client.
      setTimeout(() => syncSession(session), 0);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const role = profile?.role ?? null;

  return (
    <AuthContext.Provider
      value={{ user, profile, role, isAdmin: role === 'admin', loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);