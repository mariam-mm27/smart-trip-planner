const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');
const TRANSLATIONS_FILE = path.join(SRC_DIR, 'i18n/translations.js');

function translateToArabic(englishText) {
  const basicTranslations = {
    'welcome': 'مرحباً',
    'Welcome': 'مرحباً',
    'My Favorites': 'المفضلة',
    'my favorites': 'المفضلة',
    'myFavorites': 'المفضلة',
    'favorites': 'المفضلة',
    'Favorites': 'المفضلة',
    'back': 'عودة',
    'login': 'تسجيل الدخول',
    'register': 'إنشاء حساب',
    'logout': 'تسجيل الخروج',
    'save': 'حفظ',
    'delete': 'حذف',
    'edit': 'تعديل',
    'cancel': 'إلغاء',
    'submit': 'إرسال',
    'loading': 'جاري التحميل',
    'error': 'خطأ',
    'success': 'نجح',
    'close': 'إغلاق',
  };
  return basicTranslations[englishText] || `[AR: ${englishText}]`;
}

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  // Match: t('key') or t('key', 'fallback') - key must be 2+ chars, camelCase/snake_case
  const tPattern = /t\(['"]([a-zA-Z_][a-zA-Z0-9_]{1,})['"](?:\s*,\s*['"]([^'"]*?)['"])?\)/g;

  let match;
  while ((match = tPattern.exec(content)) !== null) {
    const key = match[1];
    const fallback = match[2] || '';
    
    if (key) {
      keys.push({
        key,
        fallback: fallback || key.replace(/([A-Z])/g, ' $1').trim(),
        file: filePath,
      });
    }
  }
  return keys;
}

function getAllJSXFiles() {
  const pattern = './src/**/*.{js,jsx}';
  return glob.sync(pattern, {
    ignore: [
      './src/**/node_modules/**',
      './src/**/dist/**',
    ],
    cwd: path.join(__dirname, '..')
  });
}

function loadCurrentTranslations() {
  const content = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  
  const enMatch = content.match(/en:\s*\{([\s\S]*?)\},/);
  const arMatch = content.match(/ar:\s*\{([\s\S]*?)\},?\s*\}/);

  const translations = { en: {}, ar: {} };

  if (enMatch) {
    const enContent = enMatch[1];
    const keyValuePattern = /(\w+):\s*['"`]([^'"`]*?)['"`]/g;
    let match;
    while ((match = keyValuePattern.exec(enContent)) !== null) {
      translations.en[match[1]] = match[2];
    }
  }

  if (arMatch) {
    const arContent = arMatch[1];
    const keyValuePattern = /(\w+):\s*['"`]([^'"`]*?)['"`]/g;
    let match;
    while ((match = keyValuePattern.exec(arContent)) !== null) {
      translations.ar[match[1]] = match[2];
    }
  }

  return translations;
}

function generateTranslationsFile(allTranslations) {
  const enKeys = Object.keys(allTranslations.en).sort();
  
  let enContent = '    ';
  let arContent = '    ';

  enKeys.forEach((key, index) => {
    const enValue = allTranslations.en[key];
    const arValue = allTranslations.ar[key] || '[NEEDS TRANSLATION]';

    enContent += `${key}: "${enValue}"`;
    arContent += `${key}: "${arValue}"`;

    if (index < enKeys.length - 1) {
      enContent += ',\n    ';
      arContent += ',\n    ';
    }
  });

  const fileContent = `export const translations = {
  en: {
${enContent}
  },
  ar: {
${arContent}
  }
};

export const t = (key, lang = 'en') => {
  return translations[lang]?.[key] || key;
};
`;

  return fileContent;
}

function main() {
  console.log('Extracting translation keys from JSX/JS files...\n');

  const jsxFiles = getAllJSXFiles();
  console.log(`Found ${jsxFiles.length} files to scan.\n`);

  const allExtractedKeys = [];
  
  jsxFiles.forEach(file => {
    const keys = extractKeysFromFile(file);
    allExtractedKeys.push(...keys);
  });

  const currentTranslations = loadCurrentTranslations();
  
  let newKeysFound = 0;
  const allTranslations = { en: { ...currentTranslations.en }, ar: { ...currentTranslations.ar } };

  allExtractedKeys.forEach(({ key, fallback }) => {
    if (!allTranslations.en[key]) {
      allTranslations.en[key] = fallback;
      allTranslations.ar[key] = translateToArabic(fallback);
      newKeysFound++;
      console.log(`[NEW] ${key}: "${fallback}" -> "${allTranslations.ar[key]}"`);
    }
  });

  if (newKeysFound > 0) {
    console.log(`\nFound ${newKeysFound} new translation key(s).`);
    console.log('Updating translations.js...\n');

    const updatedContent = generateTranslationsFile(allTranslations);
    fs.writeFileSync(TRANSLATIONS_FILE, updatedContent, 'utf8');

    console.log('✓ translations.js updated successfully.');
    console.log(`✓ Total keys: ${Object.keys(allTranslations.en).length}`);
  } else {
    console.log('✓ All translation keys are up-to-date.');
    console.log(`✓ Total keys: ${Object.keys(allTranslations.en).length}`);
  }
}

main();
