import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useI18n } from '../i18n';

export const AuditTourReady = ({ audit }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { tourReady, setTourReady } = audit;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title={t('audit.tourReady.title')}
        onBack={() => navigate('/audit/overview')}
      />

      <div style={{ padding: '20px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#092849' }}>
            {t('audit.tourReady.question')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setTourReady('yes')}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '12px',
                border: tourReady === 'yes' ? '2px solid #47C4E6' : '2px solid #e5e7eb',
                backgroundColor: tourReady === 'yes' ? 'rgba(194, 236, 253, 0.3)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '28px', marginRight: '16px' }}>✓</span>
              <div style={{ fontWeight: '600', fontSize: '18px' }}>{t('audit.tourReady.yesTourReady')}</div>
            </button>

            <button
              onClick={() => setTourReady('no')}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '12px',
                border: tourReady === 'no' ? '2px solid #2B57D0' : '2px solid #e5e7eb',
                backgroundColor: tourReady === 'no' ? 'rgba(194, 236, 253, 0.3)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '28px', marginRight: '16px' }}>✗</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '18px' }}>{t('audit.tourReady.noNotTourReady')}</div>
                <div style={{ fontSize: '15px', color: '#141685', marginTop: '4px' }}>⚠️ {t('audit.tourReady.automaticRed')}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <button
          onClick={() => navigate('/audit/summary')}
          disabled={tourReady === null}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: tourReady !== null ? 'pointer' : 'not-allowed',
            backgroundColor: tourReady !== null ? '#092849' : '#d1d5db',
            color: tourReady !== null ? '#fff' : '#9ca3af'
          }}
        >
          {t('audit.tourReady.reviewSummary')} →
        </button>
      </div>
    </div>
  );
};
