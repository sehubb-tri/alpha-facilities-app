import { useI18n } from '../i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ style = 'dropdown' }) {
  const { language, setLanguage, languages, t } = useI18n();

  if (style === 'buttons') {
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <Globe size={18} style={{ color: '#666' }} />
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: language === lang.code ? '2px solid #2B57D0' : '1px solid #ddd',
              backgroundColor: language === lang.code ? '#EEF2FF' : '#fff',
              color: language === lang.code ? '#2B57D0' : '#333',
              fontWeight: language === lang.code ? '600' : '400',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown style
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Globe size={18} style={{ color: '#666' }} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          fontSize: '15px',
          color: '#333',
          cursor: 'pointer',
          minWidth: '120px'
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
