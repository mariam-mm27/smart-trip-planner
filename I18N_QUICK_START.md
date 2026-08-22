# i18n Quick Start for Developers

## TL;DR - Get Started in 30 Seconds

### 1. Import the hook in your component:
```javascript
import { useLanguage } from '../../context/LanguageContext';
```

### 2. Use the hook:
```javascript
const { t, lang } = useLanguage();
```

### 3. Replace English strings with translations:
```javascript
// Before
<h1>Welcome</h1>
<button>Save</button>

// After
<h1>{t('welcome')}</h1>
<button>{t('save')}</button>
```

### 4. Add translations to `src/i18n/translations.js`:
```javascript
en: {
  // ... existing keys
  welcome: "Welcome",
  save: "Save",
},
ar: {
  // ... existing keys
  welcome: "مرحباً",
  save: "حفظ",
}
```

**Done.** Your component now supports English/Arabic toggling.

---

## Common Patterns

### Form Labels
```javascript
<label>{t('fullName')}</label>
<input placeholder={t('enterName')} />
```

### Buttons
```javascript
<button>{t('save')}</button>
<button>{t('delete')}</button>
```

### Error Messages
```javascript
if (error) {
  setError(t('failedSaveTrip'));
}
```

### Database-Driven Content
```javascript
import { getLocalized } from '../../utils/i18nHelper';

const title = getLocalized(destination, 'title', lang);
```

---

## Fallback for Missing Keys

If you forget to add a translation, use fallback:

```javascript
// This won't break - returns default text
<button>{t('myNewButton', 'Click Me')}</button>
```

---

## Checking Language

```javascript
const { lang, isArabic, isEnglish, dir } = useLanguage();

{isArabic && <p>Content in Arabic</p>}
{isEnglish && <p>Content in English</p>}
```

---

## File Locations

- **Translations:** `src/i18n/translations.js`
- **Language Hook:** `src/context/LanguageContext.jsx`
- **Database Helper:** `src/utils/i18nHelper.js`
- **Full Guide:** `I18N_GUIDE.md`
- **Verification:** `I18N_VERIFICATION.md`

---

## That's It!

For more details, see `I18N_GUIDE.md`.
