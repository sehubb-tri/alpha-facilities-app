import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

export const AuditComplete = ({ audit }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { campus, calculateStatus, resetAudit } = audit;

  const status = calculateStatus();

  const statusColors = {
    GREEN: '#47C4E6',
    AMBER: '#2B57D0',
    RED: '#141685'
  };

  const handleDone = () => {
    resetAudit();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: statusColors[status],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '96px', marginBottom: '24px' }}>✅</div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{t('audit.complete.submitted')}</h1>
      <div style={{ fontSize: '56px', fontWeight: '700', margin: '16px 0' }}>{t(`audit.status.${status}`)}</div>
      <p style={{ opacity: 0.9, marginBottom: '32px', fontSize: '18px' }}>{campus?.name || ''}</p>
      <button
        onClick={handleDone}
        style={{
          backgroundColor: '#fff',
          color: '#092849',
          padding: '16px 40px',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {t('audit.complete.done')}
      </button>
    </div>
  );
};
