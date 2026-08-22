# Translation Key Extraction System

## Overview

Automated translation key extraction script that scans all JSX/JS files and updates the translation dictionary in real-time.

## Usage

### Manual Extraction

```bash
npm run i18n:extract
```

### Automatic (Before Build)

```bash
npm run build
```

The extraction script runs **before Vite build**, ensuring no missing translation keys reach production.

## How It Works

### 1. File Scanning
- Scans all files in `src/` matching `**/*.{js,jsx}`
- Ignores `node_modules/` and `dist/` directories

### 2. Key Pattern Matching
Detects all `t()` function calls:
```javascript
t('myKey')                    // Matches
t('myKey', 'Default Text')    // Matches with fallback
t("myKey")                    // Double quotes OK
t(`myKey`)                    // Backticks NOT supported (template literals excluded)
```

**Requirements for detection:**
- Key must be 2+ characters long
- Key must start with letter or underscore
- Key must contain only alphanumeric characters or underscores
- Must be valid JavaScript identifier

### 3. Translation Addition
When a new key is detected:

1. **English text** is extracted from fallback parameter or key name:
   ```javascript
   t('myButton', 'Click Here')  → 'myButton': 'Click Here'
   t('myButton')                → 'myButton': 'My Button' (camelCase → Title Case)
   ```

2. **Arabic translation** is generated from basic translation map in `scripts/extract-translations.js`

3. **Dictionary updated** in `src/i18n/translations.js` automatically

### 4. Basic Translator

The script includes a basic English→Arabic translator for common UI terms:

```javascript
const basicTranslations = {
  'save': 'حفظ',
  'delete': 'حذف',
  'edit': 'تعديل',
  'My Favorites': 'المفضلة',
  // ... more mappings
};
```

**For unmapped terms**, the script marks with placeholder: `"[AR: Unmapped Text]"`

## Adding Translation Mappings

To expand the basic translator, edit `scripts/extract-translations.js`:

```javascript
function translateToArabic(englishText) {
  const basicTranslations = {
    'your new term': 'الترجمة العربية',
    'another term': 'ترجمة أخرى',
    // Add more mappings here
  };
  return basicTranslations[englishText] || `[AR: ${englishText}]`;
}
```

## Workflow Example

### Step 1: Add Translation Key to Component

```javascript
import { useLanguage } from '../../context/LanguageContext';

export default function NewComponent() {
  const { t } = useLanguage();
  
  return <button>{t('newFeature', 'New Feature Button')}</button>;
}
```

### Step 2: Run Extraction

```bash
npm run i18n:extract
```

**Output:**
```
Extracting translation keys from JSX/JS files...

Found 32 files to scan.

[NEW] newFeature: "New Feature Button" -> "ميزة جديدة"

Found 1 new translation key(s).
Updating translations.js...

✓ translations.js updated successfully.
✓ Total keys: 115
```

### Step 3: Dictionary Automatically Updated

`src/i18n/translations.js` now contains:

```javascript
en: {
  newFeature: "New Feature Button",
  // ... other keys
},
ar: {
  newFeature: "ميزة جديدة",  // Auto-translated!
  // ... other keys
}
```

### Step 4: Component Instantly Supports EN/AR

- English mode: Renders "New Feature Button"
- Arabic mode: Renders "ميزة جديدة"
- No manual editing needed

## Pre-Build Validation

The build process automatically runs extraction:

```bash
npm run build
```

Equivalent to:

```bash
node scripts/extract-translations.js && vite build
```

This ensures:
- ✅ All `t()` calls have dictionary entries
- ✅ No production builds with missing keys
- ✅ Arabic translations auto-generated for new keys
- ✅ Team members never manually edit `translations.js`

## File Changes Log

When extraction runs, it prints detected changes:

```
[NEW] featureName: "Feature Name" -> "اسم الميزة"
[NEW] anotherKey: "Another Key" -> "[AR: Another Key]"
```

For unmapped keys marked `[AR: ...]`, manually edit the Arabic translation afterward.

## Best Practices

1. **Always use fallback text**:
   ```javascript
   t('myKey', 'My English Text')  // Good - extraction uses 'My English Text'
   t('myKey')                     // Works but generates title case version
   ```

2. **Use camelCase for keys**:
   ```javascript
   t('featureName')   // Good
   t('Feature Name')  // Not recommended - key should be camelCase
   ```

3. **Verify extracted translations**:
   - Check `src/i18n/translations.js` after extraction
   - Replace `[AR: ...]` placeholders with proper Arabic translations

4. **Run before commits**:
   ```bash
   npm run i18n:extract
   git add src/i18n/translations.js
   git commit -m "Update translation keys"
   ```

## Troubleshooting

### Keys not detected

**Check:**
- Key must be 2+ characters
- Key must use valid JavaScript identifier characters (a-z, A-Z, 0-9, _)
- Pattern must be `t('key')` or `t('key', 'fallback')`
- No template literals: `t(\`key\`)` won't match

**Example:**
```javascript
t('x')                           // ❌ Too short
t('my-key')                      // ❌ Contains hyphen
t(`dynamicKey`)                  // ❌ Template literal
t('validKey', 'Default')         // ✅ Detected
```

### Arabic translation shows `[AR: ...]`

The term isn't in the basic translation map. Edit `scripts/extract-translations.js` to add it:

```javascript
const basicTranslations = {
  'Your Unmapped Term': 'الترجمة الصحيحة',
};
```

Then re-run:
```bash
npm run i18n:extract
```

### Build fails during extraction

Check for syntax errors in `src/i18n/translations.js`. The extraction script validates the file structure.

## Performance

- **Extraction time**: < 500ms for 32 files
- **No runtime overhead**: Extraction is build-time only
- **No component changes needed**: Works with existing `useLanguage()` hook
- **Backward compatible**: Existing translation keys unchanged

## Limitations

- **Basic translator**: Only maps common UI terms. Complex or domain-specific text needs manual translation
- **No smart context**: Cannot infer meaning from surrounding code
- **Manual review required**: Always review extracted Arabic translations for accuracy

## Future Enhancements

- Integration with translation APIs (Google Translate, DeepL) for better Arabic
- UI dashboard to manage translations without editing files
- Translation statistics and coverage reporting
- Export/import translations for external translator teams
