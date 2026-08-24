import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import styles from '../../styles/Toast.module.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        {type === 'success' ? (
          <FiCheckCircle className={styles.icon} />
        ) : (
          <FiAlertCircle className={styles.icon} />
        )}
        <span className={styles.text}>{message}</span>
      </div>
      <button className={styles.close} onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
}
