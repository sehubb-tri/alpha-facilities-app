import { useNavigate } from 'react-router-dom';

export const ReportComplete = ({ report }) => {
  const navigate = useNavigate();
  const { campus, location, description, isEmergency, resetReport } = report;

  const handleDone = () => {
    resetReport();
    navigate('/');
  };

  const handleViewHistory = () => {
    resetReport();
    navigate('/reports');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isEmergency ? '#dc2626' : '#2B57D0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '96px', marginBottom: '24px' }}>
        {isEmergency ? '🚨' : '✅'}
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px' }}>
        {isEmergency ? 'Emergency Reported!' : 'Report Submitted!'}
      </h1>
      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>
        {isEmergency ? 'Facilities Manager has been alerted' : 'Your report has been received'}
      </p>
      <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '24px' }}>
        Added to recent history
      </p>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '320px',
        textAlign: 'left'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '500',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {description || 'Issue reported'}
        </div>
        <div style={{ fontSize: '15px', opacity: 0.9 }}>
          📍 {campus?.name || 'Campus'}
        </div>
        <div style={{ fontSize: '15px', opacity: 0.9, marginTop: '4px' }}>
          {location}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
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
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Done
        </button>
        <button
          onClick={handleViewHistory}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '14px 40px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          View Recent Reports
        </button>
      </div>
    </div>
  );
};
