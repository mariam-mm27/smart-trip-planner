import { useEffect, useMemo, useState } from 'react';
import { Button, Spinner, Table } from 'react-bootstrap';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deletePlace, getAllPlaces } from '../../services/placeService';
import { useLanguage } from '../../context/LanguageContext';
import AutoText from '../../components/common/AutoText';
import PlaceForm, {
  PLACE_CATEGORIES,
} from '../../components/features/Admin/PlaceForm';
import UsersTab from '../../components/features/Admin/UsersTab';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('places');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  useEffect(() => {
    // Only load places when switching to places tab
    if (activeTab === 'places') {
      async function loadPlaces() {
        try {
          setIsLoading(true);
          setError('');

          const data = await getAllPlaces();

          setPlaces(data || []);
        } catch (loadError) {
          console.error('Failed to load places:', loadError);
          setError(t('failedLoadPlaces'));
        } finally {
          setIsLoading(false);
        }
      }

      loadPlaces();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, t]);

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return places.filter((place) => {
      const matchedSearch =
        query === '' ||
        place.title?.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query);

      const matchedCategory =
        activeCategory === 'All' ||
        place.category?.toLowerCase().trim() === activeCategory.toLowerCase();

      return matchedSearch && matchedCategory;
    });
  }, [places, searchQuery, activeCategory]);

  function handleCreateClick() {
    setEditingPlace(null);
    setFeedback('');
    setIsFormOpen(true);
  }

  function handleEditClick(place) {
    setEditingPlace(place);
    setFeedback('');
    setIsFormOpen(true);
  }

  function handleSaved(savedPlace, wasEdit) {
    setPlaces((current) =>
      wasEdit
        ? current.map((place) =>
            place.id === savedPlace.id ? savedPlace : place,
          )
        : [savedPlace, ...current],
    );

    setIsFormOpen(false);
    setEditingPlace(null);
    setFeedback(wasEdit ? t('placeUpdated') : t('placeCreated'));
  }

  async function handleDelete(place) {
    const confirmed = window.confirm(t('confirmDeletePlace'));

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deletePlace(place.id);

      setPlaces((current) => current.filter((item) => item.id !== place.id));
      setFeedback(t('placeDeleted'));
    } catch (deleteError) {
      console.error('Failed to delete place:', deleteError);
      setError(t('failedDeletePlace'));
    }
  }

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner animation="border" />
        <p>{t('loadingPlaces')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'places' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('places')}
        >
          <FiPlus size={16} />
          {t('places') || 'Places'}
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          {t('users') || 'Users'}
        </button>
      </div>

      {/* Places Tab */}
      {activeTab === 'places' && (
        <>
          <div className={styles.header}>
            <div>
              <span className={styles.eyebrow}>{t('adminDashboard')}</span>
              <h1 className={styles.title}>{t('managePlaces')}</h1>
              <p className={styles.subtitle}>{t('managePlacesDescription')}</p>
            </div>

            <Button className={styles.addBtn} onClick={handleCreateClick}>
              <FiPlus /> {t('addNewPlace')}
            </Button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {feedback && <p className={styles.success}>{feedback}</p>}

          <div className={styles.toolbar}>
            <input
              type="search"
              className={styles.search}
              placeholder={t('searchPlaces')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <div className={styles.filters}>
              {['All', ...PLACE_CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    activeCategory === category
                      ? `${styles.filterBtn} ${styles.filterBtnActive}`
                      : styles.filterBtn
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {t(category.toLowerCase())}
                </button>
              ))}
            </div>
          </div>

          <p className={styles.count}>
            {filteredPlaces.length} / {places.length}
          </p>

          {filteredPlaces.length === 0 ? (
            <div className={styles.empty}>
              <h2>{t('noPlacesFound')}</h2>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <Table responsive className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>{t('placeTitle')}</th>
                    <th>{t('placeCategory')}</th>
                    <th>{t('placeRating')}</th>
                    <th>{t('placePrice')}</th>
                    <th className={styles.actionsCol}>{t('actions')}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlaces.map((place) => (
                    <tr key={place.id}>
                      <td>
                        {place.image_url ? (
                          <img
                            src={place.image_url}
                            alt=""
                            className={styles.thumb}
                          />
                        ) : (
                          <div className={styles.thumbFallback} />
                        )}
                      </td>

                      <td>
                        <span className={styles.placeTitle}>
                          <AutoText text={place.title} />
                        </span>
                        <span className={styles.placeDescription}>
                          <AutoText text={place.description} />
                        </span>
                      </td>

                      <td>
                        <span className={styles.badge}>
                          {place.category ? t(place.category.toLowerCase()) : '—'}
                        </span>
                      </td>

                      <td>{place.rating}</td>
                      <td>{place.price}</td>

                      <td className={styles.actionsCol}>
                        <div className={styles.rowActions}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(place)}
                            title={t('editPlace')}
                          >
                            <FiEdit2 />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(place)}
                            title={t('deletePlace')}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {isLoading && (
            <div className={styles.center}>
              <Spinner animation="border" />
              <p>{t('loadingPlaces')}</p>
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && <UsersTab />}

      <PlaceForm
        show={isFormOpen}
        place={editingPlace}
        onHide={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}
