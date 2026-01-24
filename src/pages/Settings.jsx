import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { hasOpenAIKey, setOpenAIKey } from '../services/openai';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const Settings = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHasKey(hasOpenAIKey());
    // Don't show the actual key for security
    if (hasOpenAIKey()) {
      setApiKey('••••••••••••••••••••••••••••••••');
    }
  }, []);

  const handleSave = () => {
    if (apiKey && !apiKey.startsWith('••')) {
      setOpenAIKey(apiKey);
      setHasKey(true);
      setSaved(true);
      setApiKey('••••••••••••••••••••••••••••••••');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setHasKey(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title={t('settings.title')}
        subtitle=""
        variant="red"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Language Selection */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🌐</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                {t('settings.language')}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('common.english')} / {t('common.spanish')}
              </div>
            </div>
          </div>
          <LanguageSwitcher style="buttons" />
        </div>

        {/* OpenAI API Key Section */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                {t('settings.apiKey')}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {t('settings.apiKeyDescription')}
              </div>
            </div>
            {hasKey && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: '#d1fae5',
                color: '#059669',
                fontSize: '13px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                ✓ Configured
              </span>
            )}
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '16px',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              marginBottom: '12px',
              fontFamily: 'monospace'
            }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={!apiKey || apiKey.startsWith('••')}
              style={{
                flex: 1,
                backgroundColor: (!apiKey || apiKey.startsWith('••')) ? '#d1d5db' : '#092849',
                color: (!apiKey || apiKey.startsWith('••')) ? '#9ca3af' : '#fff',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '16px',
                border: 'none',
                cursor: (!apiKey || apiKey.startsWith('••')) ? 'not-allowed' : 'pointer'
              }}
            >
              {saved ? `✓ ${t('settings.saved')}` : t('settings.saveSettings')}
            </button>
            {hasKey && (
              <button
                onClick={handleClear}
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            <strong>How to get an API key:</strong>
            <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Go to <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1' }}>platform.openai.com</a></li>
              <li>Sign in or create an account</li>
              <li>Go to API Keys section</li>
              <li>Create a new secret key</li>
              <li>Copy and paste it above</li>
            </ol>
          </div>
        </div>

        {/* App Info */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
            About This App
          </div>
          <div style={{ fontSize: '15px', color: '#666', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>See It, Report It</strong> allows you to quickly report facility issues by taking a photo.
            </p>
            <p style={{ margin: '0' }}>
              When configured with an OpenAI API key, the app uses AI to automatically identify the type of issue in your photo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
