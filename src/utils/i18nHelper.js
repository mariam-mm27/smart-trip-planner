export const getLocalized = (item, field, lang) => {
  if (!item || !field) return '';

  const localizedKey = `${field}_${lang}`;
  
  if (item[localizedKey]) {
    return item[localizedKey];
  }

  if (item[field]) {
    return item[field];
  }

  if (item.title && field === 'title') {
    return item.title;
  }

  if (item.description && field === 'description') {
    return item.description;
  }

  if (item.name && field === 'name') {
    return item.name;
  }

  if (item.label && field === 'label') {
    return item.label;
  }

  return '';
};

export const createBilingualField = (enText, arText) => {
  return {
    en: enText,
    ar: arText,
    title_en: enText,
    title_ar: arText,
    description_en: enText,
    description_ar: arText,
  };
};

export const extractLocalizedValue = (item, field, lang, fallback = '') => {
  const value = getLocalized(item, field, lang);
  return value || fallback;
};
