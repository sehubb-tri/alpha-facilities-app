import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const FurnitureComplete = ({ furnitureChecklist }) => {
  const navigate = useNavigate();
  const { rating, campus, checklistType, resetChecklist } = furnitureChecklist;

  // Auto-redirect if no rating (came here directly)
  useEffect(() => {
    if (!rating) {
      navigate('/furniture');
    }
  }, [rating, navigate]);

  const handleNewChecklist = () => {
    resetChecklist();
    navigate('/furniture');
  };

  const handleGoHome = () => {
    resetChecklist();
    navigate('/');
  };

  const getChecklistTypeName = () => {
    switch (checklistType) {
      case 'weekly': return 'Weekly Pulse Check';
      case 'monthly': return 'Monthly Condition Scan';
      case 'quarterly': return 'Quarterly Deep Review';
      case 'annual': return 'Annual Comprehensive Review';
      default: return checklistType;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px 24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {rating === 'GREEN' ? '🎉' : rating === 'AMBER' ? '📋' : '🔧'}
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#092849',
          margin: '0 0 8px 0'
        }}>
          Report Submitted!
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 24px 0'
        }}>
          Your {getChecklistTypeName()} for {campus} has been recorded.
        </p>

        {/* Rating Badge */}
        <div style={{
          display: 'inline-block',
          padding: '12px 32px',
          borderRadius: '8px',
          backgroundColor: rating === 'GREEN' ? '#10b981' : rating === 'AMBER' ? '#f59e0b' : '#ef4444',
          color: '#fff',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '32px'
        }}>
          {rating}
        </div>

        {/* Next Steps */}
        {rating !== 'GREEN' && (
          <div style={{
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#92400e',
            textAlign: 'left'
          }}>
            <strong>Next Steps:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Review issues with your facilities team</li>
              <li>Assign owners to each issue</li>
              <li>Set fix dates within 45 days</li>
              {rating === 'RED' && <li>Address Instant RED items immediately</li>}
            </ul>
          </div>
        )}

        {/* Pillar Owners */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#0369a1'
        }}>
          <strong>Pillar Owners:</strong> Taraya Voelker, Austin Ray
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleNewChecklist}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#092849',
              color: '#fff'
            }}
          >
            Start Another Checklist
          </button>

          <button
            onClick={handleGoHome}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #092849',
              cursor: 'pointer',
              backgroundColor: '#fff',
              color: '#092849'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
