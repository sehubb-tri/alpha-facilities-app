import { useNavigate } from 'react-router-dom';

export const HealthSafetyComplete = ({ healthSafetyChecklist }) => {
  const navigate = useNavigate();

  const { campus, overallRating, issues } = healthSafetyChecklist;
  const instantRedCount = issues.filter(i => i.instantRed).length;

  const handleDone = () => {
    healthSafetyChecklist.resetChecklist();
    navigate('/');
  };

  const handleNewChecklist = () => {
    healthSafetyChecklist.resetChecklist();
    navigate('/health-safety');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px 30px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          {overallRating === 'GREEN' ? '✅' : overallRating === 'AMBER' ? '⚠️' : '🔴'}
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#092849',
          margin: '0 0 12px 0'
        }}>
          Checklist Submitted!
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 24px 0'
        }}>
          {campus} health & safety checklist has been saved.
        </p>

        {/* Rating Badge */}
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: overallRating === 'GREEN' ? '#f0fdf4' :
                          overallRating === 'AMBER' ? '#fef3c7' : '#fee2e2',
          border: `2px solid ${overallRating === 'GREEN' ? '#10b981' :
                               overallRating === 'AMBER' ? '#f59e0b' : '#ef4444'}`
        }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '4px'
          }}>
            Overall Rating
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: overallRating === 'GREEN' ? '#059669' :
                   overallRating === 'AMBER' ? '#d97706' : '#dc2626'
          }}>
            {overallRating}
          </div>
        </div>

        {/* Issues Summary */}
        {issues.length > 0 && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              Issues Reported: {issues.length}
            </div>
            {instantRedCount > 0 && (
              <div style={{ fontSize: '13px', color: '#dc2626' }}>
                • {instantRedCount} Life-Critical [LC] item{instantRedCount > 1 ? 's' : ''}
              </div>
            )}
            {issues.length - instantRedCount > 0 && (
              <div style={{ fontSize: '13px', color: '#d97706' }}>
                • {issues.length - instantRedCount} other issue{issues.length - instantRedCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div style={{
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            Next Steps
          </div>
          <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
            {issues.length > 0
              ? 'Per Quality Bar 14.03: Assign owners and remediation dates to all issues within 30 days. Life-Critical [LC] items require immediate compensating controls.'
              : 'Continue completing weekly checks to maintain World Class status.'}
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleDone}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#092849',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Done
        </button>

        <button
          onClick={handleNewChecklist}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#f3f4f6',
            color: '#333',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Start Another Checklist
        </button>
      </div>
    </div>
  );
};
