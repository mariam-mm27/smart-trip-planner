import { NavLink, Outlet } from 'react-router-dom';
import { FiMail, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import AdminNavbar from './AdminNavbar';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { t } = useLanguage();

  const tabClass = ({ isActive }) =>
    isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab;

  return (
    <div className={styles.shell}>
      <AdminNavbar />

      <main className={styles.main}>
        <nav className={styles.tabs}>
          <NavLink to="/admin" end className={tabClass}>
            <FiMapPin /> {t('places')}
          </NavLink>

          <NavLink to="/admin/messages" className={tabClass}>
            <FiMail /> {t('messages')}
          </NavLink>
        </nav>

        <Outlet />
      </main>
    </div>
  );
}
