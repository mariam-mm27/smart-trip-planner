import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';
import styles from '../../styles/Navbar.module.css';
import { FiUser, FiLogIn, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import { Toolbar } from './Toolbar';

export default function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide auth button on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const avatarUrl = profile?.avatar_url || '';
  const displayName =
    profile?.full_name || user?.email?.split('@')[0] || t('profile');

  const navLinks = [
    { to: '/', label: t('home'), end: true },
    { to: '/explore', label: t('explore') },
    ...(user
      ? [
          { to: '/my-trips', label: t('myTrips') },
          { to: '/favorites', label: t('favorites') },
        ]
      : []),
    ...(isAdmin ? [{ to: '/admin', label: t('adminDashboard') }] : []),
  ];

  const getLinkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header className={styles.navbar}>
      <nav className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <FiMapPin className={styles.brandIcon} />
          <span>{t('appName')}</span>
        </Link>

        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={t('menu')}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div
          id="primary-navigation"
          className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}
        >
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={getLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Toolbar />
            {user ? (
              <Link
                to="/profile"
                className={styles.profileAvatarBtn}
                title={t('profile')}
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
            ) : !isAuthPage ? (
              <Link to="/login" className={styles.loginBtn}>
                <FiLogIn />
                <span>Login / Sign Up</span>
              </Link>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
