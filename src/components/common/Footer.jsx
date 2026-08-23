import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const quickLinks = [
    { to: '/', label: t('home') },
    { to: '/explore', label: t('explore') },
    ...(user ? [{ to: '/my-trips', label: t('myTrips') }] : []),
  ];

  const resourceLinks = [
    { to: '/about', label: t('aboutUs') },
    { to: '/contact', label: t('contactUs') },
  ];

  const socials = [
    { href: 'https://github.com', label: 'GitHub', Icon: FiGithub },
    { href: 'https://twitter.com', label: 'Twitter', Icon: FiTwitter },
    { href: 'https://instagram.com', label: 'Instagram', Icon: FiInstagram },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandColumn}>
          <Link to="/" className={styles.brand}>
            <FiMapPin className={styles.brandIcon} />
            <span>{t('appName')}</span>
          </Link>
          <p className={styles.tagline}>{t('footerTagline')}</p>
          <div className={styles.socials}>
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <nav className={styles.column}>
          <h2 className={styles.columnTitle}>{t('quickLinks')}</h2>
          <ul className={styles.list}>
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.column}>
          <h2 className={styles.columnTitle}>{t('resources')}</h2>
          <ul className={styles.list}>
            {resourceLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="mailto:support@smarttripplanner.com" className={styles.link}>
                <FiMail className={styles.linkIcon} />
                support@smarttripplanner.com
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} {t('appName')} — {t('allRightsReserved')}
        </p>
      </div>
    </footer>
  );
}
