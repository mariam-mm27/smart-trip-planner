import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import styles from '../../styles/Navbar.module.css';
import { FiUser, FiLogIn } from 'react-icons/fi';

export default function Navbar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (!user) {
      setAvatarUrl('');
      setFullName('');
      return;
    }

    let isMounted = true;

    async function fetchUserProfile() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (isMounted && data) {
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
          if (data.full_name) setFullName(data.full_name);
        }
      } catch (err) {
        console.error('Error fetching profile for navbar icon:', err);
      }
    }

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = fullName || user?.email?.split('@')[0] || 'Profile';

  return (
    <header className={styles.topRightHeader}>
      <div className={styles.userSection}>
        {user ? (
          <Link
            to="/profile"
            className={styles.profileAvatarBtn}
            title="User Profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className={styles.avatarImage}
              />
            ) : (
              <FiUser className={styles.avatarPlaceholderIcon} />
            )}
            <span>{displayName}</span>
          </Link>
        ) : (
          <Link to="/login" className={styles.loginBtn}>
            <FiLogIn />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
