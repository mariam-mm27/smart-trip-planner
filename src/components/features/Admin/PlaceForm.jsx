import { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { createPlace, updatePlace } from '../../../services/placeService';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './PlaceForm.module.css';

export const PLACE_CATEGORIES = ['Beaches', 'Historical', 'Hiking', 'Food'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  rating: '',
  price: '',
  imageUrl: '',
  location: '',
};

// Blocks javascript:/data: URIs from reaching an <img src> or a link href.
function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export default function PlaceForm({ show, onHide, place, onSaved }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isEditMode = Boolean(place);

  useEffect(() => {
    if (!show) {
      return;
    }

    setErrors({});
    setSaveError('');
    setFormData(
      place
        ? {
            title: place.title ?? '',
            description: place.description ?? '',
            category: place.category ?? '',
            rating: place.rating ?? '',
            price: place.price ?? '',
            imageUrl: place.image_url ?? place.imageUrl ?? place.image ?? '',
            location: place.Location ?? place.location ?? place.location_url ?? '',
          }
        : EMPTY_FORM,
    );
  }, [show, place]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('titleRequired');
    }

    if (!formData.category) {
      newErrors.category = t('categoryRequired');
    }

    const rating = Number(formData.rating);
    if (formData.rating === '' || Number.isNaN(rating) || rating < 0 || rating > 5) {
      newErrors.rating = t('ratingRange');
    }

    const price = Number(formData.price);
    if (formData.price === '' || Number.isNaN(price) || price < 0) {
      newErrors.price = t('pricePositive');
    }

    if (formData.imageUrl.trim() && !isHttpsUrl(formData.imageUrl.trim())) {
      newErrors.imageUrl = t('invalidUrl');
    }

    if (formData.location.trim() && !isHttpsUrl(formData.location.trim())) {
      newErrors.location = t('invalidUrl');
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim(),
        location: formData.location.trim(),
      };

      const saved = isEditMode
        ? await updatePlace(place.id, payload)
        : await createPlace(payload);

      onSaved(saved, isEditMode);
    } catch (error) {
      console.error('Failed to save place:', error);
      setSaveError(t('failedSavePlace'));
    } finally {
      setIsSaving(false);
    }
  }

  const previewUrl = formData.imageUrl.trim();
  const showPreview = previewUrl && isHttpsUrl(previewUrl);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      contentClassName={styles.modalContent}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            {isEditMode ? t('editPlace') : t('addNewPlace')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          {saveError && <p className={styles.error}>{saveError}</p>}

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>{t('placeTitle')}</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
              className={styles.input}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>
              {t('placeDescription')}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.input}
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.label}>
                  {t('placeCategory')}
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  isInvalid={!!errors.category}
                  className={styles.input}
                >
                  <option value="">{t('selectCategory')}</option>
                  {PLACE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(category.toLowerCase())}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.label}>
                  {t('placeRating')}
                </Form.Label>
                <Form.Control
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  isInvalid={!!errors.rating}
                  className={styles.input}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.rating}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.label}>
                  {t('placePrice')}
                </Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  isInvalid={!!errors.price}
                  className={styles.input}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>{t('imageUrl')}</Form.Label>
            <Form.Control
              type="url"
              name="imageUrl"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={handleChange}
              isInvalid={!!errors.imageUrl}
              className={styles.input}
            />
            <Form.Control.Feedback type="invalid">
              {errors.imageUrl}
            </Form.Control.Feedback>
          </Form.Group>

          {showPreview && (
            <img src={previewUrl} alt="" className={styles.preview} />
          )}

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>{t('locationUrl')}</Form.Label>
            <Form.Control
              type="url"
              name="location"
              placeholder="https://maps.google.com/..."
              value={formData.location}
              onChange={handleChange}
              isInvalid={!!errors.location}
              className={styles.input}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className={styles.modalFooter}>
          <Button variant="secondary" onClick={onHide} disabled={isSaving}>
            {t('cancel')}
          </Button>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner animation="border" size="sm" /> {t('saving')}
              </>
            ) : (
              t('save')
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
