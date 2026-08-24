import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import styles from '../../styles/Toast.module.css';

export default function Toast({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000,
  title = null 
}) {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  // Determine title based on type and message content
  let displayTitle = title;
  if (!displayTitle) {
    if (type === 'success') {
      if (message.toLowerCase().includes('favorite')) {
        displayTitle = message.includes('Removed') ? 'Removed from Favorites' : 'Added to My Favorites';
      } else {
        displayTitle = 'Success';
      }
    } else if (type === 'error') {
      displayTitle = 'Error';
    }
  }

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          {type === 'success' ? (
            <FiCheckCircle className={styles.icon} />
          ) : (
            <FiAlertCircle className={styles.icon} />
          )}
        </div>
        <div className={styles.textContent}>
          {displayTitle && <div className={styles.toastTitle}>{displayTitle}</div>}
          <span className={styles.text}>{message}</span>
        </div>
      </div>
      <button className={styles.close} onClick={onClose} aria-label="Close notification">
        <FiX />
      </button>
    </div>
  );
}
