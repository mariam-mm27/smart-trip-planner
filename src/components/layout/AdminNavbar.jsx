import { Link } from 'react-router-dom';
import { FiMapPin, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Toolbar } from '../common/Toolbar';
import navStyles from '../../styles/Navbar.module.css';
import styles from './AdminLayout.module.css';

export default function AdminNavbar() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const displayName =
    profile?.full_name || user?.email?.split('@')[0] || t('profile');

  return (
    <header className={navStyles.navbar}>
      <nav className={navStyles.inner}>
        <Link to="/" className={navStyles.brand}>
          <FiMapPin className={navStyles.brandIcon} />
          <span>{t('appName')}</span>
        </Link>

        <div className={styles.adminActions}>
          <Toolbar />

          <Link
            to="/profile"
            className={navStyles.profileAvatarBtn}
            title={t('profile')}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className={navStyles.avatarImage}
              />
            ) : (
              <FiUser className={navStyles.avatarPlaceholderIcon} />
            )}
            <span className={styles.adminUserName}>{displayName}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
