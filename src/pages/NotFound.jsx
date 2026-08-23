import React from 'react';
import { Link } from 'react-router-dom';
import { FiCompass } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import styles from '../styles/NotFound.module.css';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <FiCompass className={styles.icon} />
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>{t('pageNotFound')}</h1>
        <p className={styles.description}>{t('pageNotFoundDesc')}</p>
        <Link to="/" className={styles.button}>
          {t('backToHome')}
        </Link>
      </div>
    </main>
  );
}
