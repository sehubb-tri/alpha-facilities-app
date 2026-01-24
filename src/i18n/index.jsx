import { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import es from './es.json';

const translations = { en, es };

const I18nContext = createContext();

// Get nested value from object using dot notation
// e.g., get(obj, 'audit.setup.title') returns obj.audit.setup.title
const get = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function I18nProvider({ children }) {
  // Check localStorage for saved language, default to 'en'
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-language') || 'en';
    }
    return 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  // Translation function
  // Usage: t('audit.setup.title') returns the translated string
  const t = (key, fallback = key) => {
    const translation = get(translations[language], key);
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      // Try English fallback
      const enFallback = get(translations.en, key);
      return enFallback !== undefined ? enFallback : fallback;
    }
    return translation;
  };

  // Get checklist questions for a zone
  // Usage: getChecklist('restroom') returns array of questions
  const getChecklist = (zoneKey) => {
    const checklist = translations[language]?.checklist?.[zoneKey];
    if (!checklist) {
      console.warn(`Checklist missing for zone: ${zoneKey} in language: ${language}`);
      return translations.en?.checklist?.[zoneKey] || [];
    }
    return checklist;
  };

  // Get zone name
  const getZoneName = (zoneKey) => {
    return t(`zones.names.${zoneKey}`, zoneKey);
  };

  // Get zone description
  const getZoneDescription = (zoneKey) => {
    return t(`zones.descriptions.${zoneKey}`, '');
  };

  const value = {
    language,
    setLanguage,
    t,
    getChecklist,
    getZoneName,
    getZoneDescription,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ]
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Shorthand hook for just the translation function
export function useTranslation() {
  const { t } = useI18n();
  return t;
}

export default I18nContext;
