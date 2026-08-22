import { createContext, useContext, useState, useLayoutEffect } from 'react';
import { t as getTranslation } from '../i18n/translations';

const LanguageContext = createContext();

const initializeLang = () => {
  const saved = localStorage.getItem('app_lang') || 'en';
  setDocumentLanguage(saved);
  return saved;
};

const setDocumentLanguage = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const fontFamily = lang === 'ar' 
    ? "'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    : "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.style.direction = dir;
  document.documentElement.style.fontFamily = fontFamily;
  document.documentElement.style.lineHeight = lang === 'ar' ? '1.6' : '1.5';
  document.dir = dir;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => initializeLang());

  useLayoutEffect(() => {
    localStorage.setItem('app_lang', lang);
    setDocumentLanguage(lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key, fallback = '') => {
    const translated = getTranslation(key, lang);
    return translated === key ? (fallback || key) : translated;
  };

  const value = {
    lang,
    toggleLanguage,
    t,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    isArabic: lang === 'ar',
    isEnglish: lang === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
