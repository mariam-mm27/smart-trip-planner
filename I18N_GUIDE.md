# Internationalization (i18n) Architecture Guide

## Overview

This project implements a **synchronous, state-based internationalization system** for English (EN) and Arabic (AR) languages with automatic DOM direction switching and font family management.

## Core Architecture

### 1. Translation Dictionary (`src/i18n/translations.js`)

All static UI strings are stored in a centralized, in-memory key-value dictionary:

```javascript
export const translations = {
  en: {
    appName: "Smart Trip Planner",
    welcome: "Welcome Back",
    // ... more EN strings
  },
  ar: {
    appName: "مخطط الرحلات الذكي",
    welcome: "مرحباً بعودتك",
    // ... more AR strings
  }
};
```

**Key Points:**
- **Zero async/await**: All translations are resolved instantly from memory
- **Symmetric keys**: English and Arabic share identical keys (e.g., `welcome`)
- **Fallback text support**: `t('key', 'fallback')` returns fallback if key doesn't exist
- **No external API calls**: No Google Translate or third-party translation services

### 2. Language Context (`src/context/LanguageContext.jsx`)

Centralized state management for language switching and DOM updates:

```javascript
const { lang, toggleLanguage, t, dir, isArabic, isEnglish } = useLanguage();
```

**Properties:**
- `lang` - Current language ('en' or 'ar')
- `toggleLanguage()` - Switch between EN and AR
- `t(key, fallback)` - Synchronous translation function
- `dir` - DOM direction ('ltr' or 'rtl')
- `isArabic` - Boolean flag for Arabic
- `isEnglish` - Boolean flag for English

**Automatic Updates:**
- Sets `document.documentElement.dir` to 'rtl' (Arabic) or 'ltr' (English)
- Sets `document.documentElement.lang` appropriately
- Applies font family: **Cairo/Tajawal** for Arabic, **Inter** for English
- Adjusts line-height: **1.6** for Arabic (better spacing), **1.5** for English
- Persists language choice to `localStorage` under key `app_lang`

### 3. Dynamic Data Helper (`src/utils/i18nHelper.js`)

For database records or API responses with bilingual fields:

```javascript
const displayTitle = getLocalized(item, 'title', lang);
```

**Function: `getLocalized(item, field, lang)`**
- Checks for `item.${field}_${lang}` first (e.g., `title_ar`, `title_en`)
- Falls back to `item[field]` if localized version doesn't exist
- Falls back to `item.title` for backward compatibility
- Returns empty string if nothing found
- **Prevents undefined errors** when database doesn't have all localized fields

**Function: `createBilingualField(enText, arText)`**
- Helper to structure new bilingual data objects
- Supports both flat keys (`title_en`, `title_ar`) and nested (`en`, `ar`)

## Integration Pattern for Team Members

### Adding Translation Keys

1. **Add to `src/i18n/translations.js`:**

```javascript
en: {
  myNewButton: "Click Me",
},
ar: {
  myNewButton: "اضغط هنا",
}
```

2. **Use in component:**

```javascript
import { useLanguage } from '../../context/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  
  return <button>{t('myNewButton')}</button>;
}
```

3. **If key doesn't exist yet, use fallback:**

```javascript
<button>{t('myNewButton', 'Click Me')}</button>
```
This renders "Click Me" immediately while someone adds the translation key.

### Integrating Dynamic/Database Data

When displaying data from Supabase or API with bilingual fields:

```javascript
import { getLocalized } from '../../utils/i18nHelper';
import { useLanguage } from '../../context/LanguageContext';

export default function DestinationCard({ destination }) {
  const { lang } = useLanguage();
  
  const title = getLocalized(destination, 'title', lang);
  const description = getLocalized(destination, 'description', lang);
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

**Database Structure Expectation:**
```javascript
{
  id: 1,
  title_en: "Eiffel Tower",
  title_ar: "برج إيفل",
  description_en: "Iconic landmark in Paris",
  description_ar: "معلم سياحي شهير في باريس"
}
```

If your data only has `title` (not `title_en`/`title_ar`), `getLocalized()` still works:
```javascript
// Database has only 'title' field
{
  id: 1,
  title: "Paris"
}

// This still works - graceful fallback
const displayTitle = getLocalized(item, 'title', lang); // Returns "Paris"
```

### Creating New Pages/Components

**Checklist:**
1. ✅ Import `useLanguage` hook
2. ✅ Extract `t` and optionally `lang`, `dir`, `isArabic`
3. ✅ Replace hardcoded English strings with `t('key')`
4. ✅ Add translation keys to `translations.js` for both EN and AR
5. ✅ For database fields, use `getLocalized()` from i18nHelper
6. ✅ Ensure labels, buttons, placeholders, titles all use `t()`

**Example New Component:**

```javascript
import { useLanguage } from '../../context/LanguageContext';
import { getLocalized } from '../../utils/i18nHelper';

export default function NewFeature({ data }) {
  const { t, lang } = useLanguage();
  
  return (
    <section>
      <h2>{t('newFeatureTitle')}</h2>
      <p>{t('newFeatureDescription')}</p>
      
      {data.map(item => (
        <div key={item.id}>
          <h3>{getLocalized(item, 'name', lang)}</h3>
          <button>{t('viewDetails')}</button>
        </div>
      ))}
    </section>
  );
}
```

**Then add to `translations.js`:**

```javascript
en: {
  newFeatureTitle: "New Feature",
  newFeatureDescription: "This is my new feature",
  // ... existing keys
},
ar: {
  newFeatureTitle: "ميزة جديدة",
  newFeatureDescription: "هذه ميزة جديدة",
  // ... existing keys
}
```

## Common Patterns

### Pattern 1: Form Labels & Inputs

```javascript
<label>{t('fullName')}</label>
<input placeholder={t('enterName')} />
```

### Pattern 2: Buttons with Action

```javascript
<button>{t('saveName')}</button>
<button>{t('updatePassword')}</button>
```

### Pattern 3: Error/Success Messages

```javascript
setMessage({ type: 'success', text: t('tripSavedSuccessfully') });
setMessage({ type: 'error', text: t('failedSaveTrip') });
```

### Pattern 4: Conditional Text

```javascript
const buttonLabel = activeTab === 'login' ? t('login') : t('register');
```

### Pattern 5: Dynamic Data with Fallback

```javascript
const name = getLocalized(profile, 'full_name', lang);
// Falls back to profile.full_name if full_name_en/full_name_ar don't exist
```

## RTL (Right-to-Left) Handling

### Automatic (Already Handled)

- ✅ `document.dir` set to 'rtl' automatically
- ✅ Global font family switched to Arabic-optimized fonts
- ✅ Line-height adjusted for Arabic readability
- ✅ Letter-spacing disabled for Arabic to prevent character disconnection

### Manual CSS Adjustments (If Needed)

```css
/* Arabic-specific styling */
[dir="rtl"] {
  letter-spacing: normal; /* Prevents Arabic letters from disconnecting */
  text-align: right;      /* Auto-applied but explicit for clarity */
}

/* LTR-specific styling */
[dir="ltr"] {
  text-align: left;
}
```

## Testing i18n

### Manual Testing Checklist

1. **Initial Load:**
   - Open app in browser
   - Verify language defaults to 'en'
   - Verify all UI text is in English

2. **Language Toggle:**
   - Click language button (top toolbar)
   - Verify all text instantly changes to Arabic
   - Verify page direction changes to RTL
   - Verify font changes to Cairo/Tajawal

3. **Re-toggle:**
   - Click language button again
   - Verify all text returns to English
   - Verify direction returns to LTR
   - Verify font returns to Inter

4. **Persistence:**
   - Toggle to Arabic
   - Refresh page
   - Verify language remains Arabic
   - Refresh again and toggle to English
   - Refresh once more
   - Verify language remains English

5. **Dynamic Content:**
   - Navigate to pages with database-driven content
   - Verify titles/descriptions display correctly in EN
   - Toggle to AR
   - Verify titles/descriptions update instantly
   - Verify no placeholder text appears

## Troubleshooting

### Issue: Text not translating

**Check:**
- Does the component import `useLanguage`?
- Is the key in `translations.js` for both `en` and `ar`?
- Is the component inside `<LanguageProvider>`?

**Debug:**
```javascript
const { t, lang } = useLanguage();
console.log('Current language:', lang);
console.log('Translation for key:', t('myKey'));
```

### Issue: Database text not showing in Arabic

**Check:**
- Is the component using `getLocalized()` helper?
- Does the database have `title_ar` and `title_en` fields?
- Is the language state being passed to the component?

**Debug:**
```javascript
const { lang } = useLanguage();
console.log('Current language:', lang);
const title = getLocalized(item, 'title', lang);
console.log('Localized title:', title);
```

### Issue: RTL layout broken

**Check:**
- Verify `document.documentElement.dir` is set to 'rtl'
- Check CSS for hard-coded `text-align: left` or `margin-left` that need RTL versions
- Use CSS logical properties or `[dir="rtl"]` selectors

## File Reference

- **Translations:** `src/i18n/translations.js`
- **Language Context:** `src/context/LanguageContext.jsx`
- **i18n Helper:** `src/utils/i18nHelper.js`
- **Example Integration:** `src/components/common/Destinations.jsx`, `src/pages/Profile/Profile.jsx`

## Performance Notes

- ✅ **Synchronous:** All translations resolve instantly (< 1ms)
- ✅ **Cached:** In-memory dictionary, zero network calls
- ✅ **Efficient:** No re-renders for untranslated text, only for keys that change
- ✅ **Scalable:** Can handle thousands of translation keys without performance impact

## Future Enhancements

- [ ] Add German, French, Spanish language support
- [ ] Implement translation key validation tool
- [ ] Create translation management UI
- [ ] Add number/date formatting for locale-specific display
- [ ] Support plural forms and gender-specific translations
