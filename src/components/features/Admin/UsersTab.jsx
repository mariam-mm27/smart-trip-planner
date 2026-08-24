import { useEffect, useMemo, useState } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { getAllUsers } from '../../../services/userService';
import { useLanguage } from '../../../context/LanguageContext';
import Toast from '../../../components/common/Toast';
import styles from './UsersTab.module.css';

export default function UsersTab() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        setError('');

        const data = await getAllUsers();
        // DEBUG: remove after confirming email + total_trips are populated
        console.log('[UsersTab] getAllUsers result:', data);
        setUsers(data || []);
      } catch (loadError) {
        console.error('Failed to load users:', loadError);
        const errorMessage = loadError?.message || t('failedLoadUsers') || 'Failed to load users';
        setError(errorMessage);
        setToast({
          show: true,
          message: errorMessage,
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [t]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return users.filter((user) => {
      const matchEmail =
        query === '' ||
        user.email?.toLowerCase().includes(query) ||
        (user.full_name && user.full_name.toLowerCase().includes(query));

      return matchEmail;
    });
  }, [users, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner animation="border" />
        <p>{t('loadingUsers') || 'Loading users...'}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>{t('userManagement') || 'User Management'}</span>
          <h2 className={styles.title}>{t('registeredUsers') || 'Registered Users'}</h2>
          <p className={styles.subtitle}>
            {t('registeredUsersDescription') ||
              'View and manage all registered users in your platform'}
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '12px', cursor: 'pointer', color: '#ef4444', textDecoration: 'underline', background: 'none', border: 'none', fontWeight: 600 }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder={t('searchUsers') || 'Search by email or name...'}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <p className={styles.count}>
        {filteredUsers.length} / {users.length} {t('users') || 'Users'}
      </p>

      {filteredUsers.length === 0 ? (
        <div className={styles.empty}>
          <h2>{t('noUsersFound') || 'No users found'}</h2>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <Table responsive className={styles.table}>
            <thead>
              <tr>
                <th>{t('fullName') || 'Full Name'}</th>
                <th>{t('emailAddress') || 'Email'}</th>
                <th>{t('totalTrips') || 'Total Trips'}</th>
                <th>{t('joinedDate') || 'Joined Date'}</th>
                <th>{t('status') || 'Role'}</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className={styles.fullName}>
                      {user.full_name || t('notProvided') || 'Not provided'}
                    </span>
                  </td>

                  <td>
                    <span className={styles.email}>{user.email || 'N/A'}</span>
                  </td>

                  <td>
                    <span className={styles.trips}>
                      {user.total_trips || 0}
                    </span>
                  </td>

                  <td>
                    <span className={styles.date}>
                      {formatDate(user.created_at)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        user.role === 'admin'
                          ? styles.badgeAdmin
                          : styles.badgeUser
                      }`}
                    >
                      {user.role === 'admin'
                        ? t('admin') || 'Admin'
                        : t('user') || 'User'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}
