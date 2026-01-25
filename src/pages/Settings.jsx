import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { hasOpenAIKey } from '../services/openai';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const Settings = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    setAiEnabled(hasOpenAIKey());
  }, []);

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

        {/* AI Analysis Status */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                AI Photo Analysis
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Automatically identifies issue types from photos
              </div>
            </div>
            <span style={{
              backgroundColor: aiEnabled ? '#d1fae5' : '#fef2f2',
              color: aiEnabled ? '#059669' : '#dc2626',
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px 12px',
              borderRadius: '12px'
            }}>
              {aiEnabled ? '✓ Enabled' : '✗ Not configured'}
            </span>
          </div>

          {!aiEnabled && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#92400e'
            }}>
              AI analysis is not available. Please contact your administrator.
            </div>
          )}
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
              AI-powered analysis automatically identifies the type of issue in your photo to speed up reporting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
