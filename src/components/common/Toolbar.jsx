import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import "../../styles/Toolbar.css";

export const Toolbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <div className="app-toolbar">
      <button 
        type="button" 
        className="toolbar-btn" 
        onClick={toggleTheme}
        title={theme === 'dark' ? t('themeLight') : t('themeDark')}
        aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')}
      >
        {theme === 'dark' ? <FiSun className="toolbar-icon" /> : <FiMoon className="toolbar-icon" />}
        <span>{theme === 'dark' ? t('themeLight') : t('themeDark')}</span>
      </button>

      <button 
        type="button" 
        className="toolbar-btn language-btn" 
        onClick={toggleLanguage}
        title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        aria-label={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        data-current-lang={lang}
      >
        <FiGlobe className="toolbar-icon" />
        <span>{t('langName')}</span>
      </button>
    </div>
  );
};

export default Toolbar;
