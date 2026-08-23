import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { FiClock, FiMail } from 'react-icons/fi';
import { getContactMessages } from '../../services/contactService';
import { useLanguage } from '../../context/LanguageContext';
import styles from './AdminMessages.module.css';

export default function AdminMessages() {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        const data = await getContactMessages();
        if (isMounted) setMessages(data);
      } catch (loadError) {
        console.error('Failed to load contact messages:', loadError);
        if (isMounted) setError(t('failedLoadMessages'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner animation="border" />
        <p>{t('loadingMessages')}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <span className={styles.eyebrow}>{t('adminDashboard')}</span>
        <h1 className={styles.title}>{t('contactMessages')}</h1>
        <p className={styles.subtitle}>{t('manageMessagesDescription')}</p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {messages.length === 0 ? (
        <div className={styles.empty}>
          <FiMail className={styles.emptyIcon} />
          <h2>{t('noMessages')}</h2>
        </div>
      ) : (
        <div className={styles.list}>
          {messages.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <span className={styles.sender}>{item.name}</span>
                  <a href={`mailto:${item.email}`} className={styles.email}>
                    {item.email}
                  </a>
                </div>

                {item.created_at && (
                  <time className={styles.date} dateTime={item.created_at}>
                    <FiClock />
                    {t('receivedOn')} {formatDate(item.created_at)}
                  </time>
                )}
              </div>

              {item.subject && <p className={styles.subject}>{item.subject}</p>}

              <p className={styles.body}>{item.message}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
