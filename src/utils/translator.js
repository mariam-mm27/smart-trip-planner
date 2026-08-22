const translationCache = {};

/**
 * Automatically translates text to targetLang via Google Translate public API with local memory cache.
 */
export async function translateText(text, targetLang = 'ar') {
  if (!text || typeof text !== 'string') return text;
  if (targetLang === 'en') return text;
  
  const cacheKey = `${targetLang}:${text.trim()}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    if (data && data[0]) {
      const translated = data[0].map((item) => item[0]).join('');
      if (translated) {
        translationCache[cacheKey] = translated;
        return translated;
      }
    }
  } catch (err) {
    console.warn('Auto translation helper fallback error:', err);
  }

  return text;
}
