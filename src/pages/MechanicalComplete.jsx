import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MECHANICAL_SECTIONS_SUMMARY } from '../data/mechanicalZones';

export const MechanicalComplete = ({ mechanicalChecklist }) => {
  const navigate = useNavigate();
  const { getChecklistData, resetChecklist } = mechanicalChecklist;

  const data = getChecklistData();

  // Redirect if no completed checklist
  useEffect(() => {
    if (!data.rating) {
      navigate('/mechanical');
    }
  }, [data.rating, navigate]);

  if (!data.rating) {
    return null;
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'GREEN': return '#10b981';
      case 'AMBER': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRatingBg = (rating) => {
    switch (rating) {
      case 'GREEN': return '#d1fae5';
      case 'AMBER': return '#fef3c7';
      case 'RED': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const getRatingEmoji = (rating) => {
    switch (rating) {
      case 'GREEN': return '✅';
      case 'AMBER': return '⚠️';
      case 'RED': return '🔴';
      default: return '📋';
    }
  };

  const handleDone = () => {
    resetChecklist();
    navigate('/');
  };

  const handleStartNew = () => {
    resetChecklist();
    navigate('/mechanical');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px'
    }}>
      {/* Success Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <span style={{ fontSize: '40px' }}>⚙️</span>
      </div>

      <h1 style={{
        color: '#fff',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Mechanical Check Complete!
      </h1>

      <p style={{
        color: '#C2ECFD',
        fontSize: '16px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        {data.campus} - {data.date}
      </p>

      {/* Rating Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '24px',
        width: '100%',
        maxWidth: '360px',
        marginBottom: '24px'
      }}>
        {/* Rating */}
        <div style={{
          backgroundColor: getRatingBg(data.rating),
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>
            {getRatingEmoji(data.rating)}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: getRatingColor(data.rating)
          }}>
            {data.rating}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {data.rating === 'GREEN' && 'All systems operating properly'}
            {data.rating === 'AMBER' && 'Minor issues - follow up required'}
            {data.rating === 'RED' && 'Critical issues - immediate action needed'}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#092849' }}>
              {Object.values(data.checkResults).filter(v => v === true).length}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Passed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
              {data.totalIssues}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Issues</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#092849' }}>
              {data.duration || '--'}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Minutes</div>
          </div>
        </div>

        {/* Section Summary Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          {MECHANICAL_SECTIONS_SUMMARY.slice(0, 4).map((section) => (
            <div key={section.id} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>{section.icon}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{section.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Red Warning */}
      {data.instantRedIssues > 0 && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '16px',
          width: '100%',
          maxWidth: '360px',
          marginBottom: '24px'
        }}>
          <div style={{ fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
            ⚠️ {data.instantRedIssues} Instant Red Issue{data.instantRedIssues > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '14px', color: '#991b1b' }}>
            These safety/compliance issues require immediate attention and resolution.
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '16px',
        width: '100%',
        maxWidth: '360px',
        marginBottom: '32px'
      }}>
        <div style={{ color: '#C2ECFD', fontSize: '14px' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Auditor:</strong> {data.auditor}
          </div>
          <div>
            <strong>Time:</strong> {data.time}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <button
          onClick={handleDone}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            backgroundColor: '#fff',
            color: '#092849',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Done
        </button>

        <button
          onClick={handleStartNew}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: '2px solid rgba(255,255,255,0.3)',
            backgroundColor: 'transparent',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Start New Check
        </button>
      </div>
    </div>
  );
};
