import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../utils/translator';

export function useAutoText(text) {
  const { lang, t } = useLanguage();

  const getInitial = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val !== null) {
      return val[lang] || val.en || val.ar || '';
    }
    const dict = t(val);
    return dict !== val ? dict : val;
  };

  const [displayText, setDisplayText] = useState(() => getInitial(text));

  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    if (typeof text === 'object' && text !== null) {
      setDisplayText(text[lang] || text.en || text.ar || '');
      return;
    }

    // 1. If English or dict match found, return dictionary result immediately
    const dictMatch = t(text);
    if (lang === 'en' || dictMatch !== text) {
      setDisplayText(dictMatch);
      return;
    }

    // 2. Otherwise auto-translate dynamic content to Arabic asynchronously
    let isMounted = true;
    translateText(text, 'ar').then((translated) => {
      if (isMounted && translated) {
        setDisplayText(translated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, lang, t]);

  return displayText;
}

export default useAutoText;
