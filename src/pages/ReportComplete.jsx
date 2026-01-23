import { useNavigate } from 'react-router-dom';
import { ISSUE_CATEGORIES } from '../data/issueCategories';

export const ReportComplete = ({ report }) => {
  const navigate = useNavigate();
  const { campus, category, location, resetReport } = report;

  const cat = ISSUE_CATEGORIES.find(c => c.id === category);

  const handleDone = () => {
    resetReport();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#2B57D0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '96px', marginBottom: '24px' }}>✅</div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '10px' }}>Submitted!</h1>
      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '20px' }}>{cat?.team || 'Facilities'} notified</p>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '320px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '28px', marginRight: '10px' }}>{cat?.icon || '📋'}</span>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>{cat?.name || 'Issue'}</span>
        </div>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>{campus?.name || ''}</div>
        <div style={{ fontSize: '16px', opacity: 0.9, marginTop: '4px' }}>{location}</div>
      </div>

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
        Done
      </button>
    </div>
  );
};
