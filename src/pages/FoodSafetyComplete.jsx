import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const FoodSafetyComplete = ({ foodSafetyChecklist }) => {
  const navigate = useNavigate();
  const { rating, campus, checklistType, foodVendor, resetChecklist } = foodSafetyChecklist;

  // Auto-redirect if no rating (came here directly)
  useEffect(() => {
    if (!rating) {
      navigate('/food-safety');
    }
  }, [rating, navigate]);

  const handleNewChecklist = () => {
    resetChecklist();
    navigate('/food-safety');
  };

  const handleGoHome = () => {
    resetChecklist();
    navigate('/');
  };

  const getChecklistTypeName = () => {
    switch (checklistType) {
      case 'monthly': return 'Monthly Quality Check';
      case 'spot_check': return 'Management Spot Check';
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

        {/* Vendor Info */}
        {foodVendor && (
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 16px 0'
          }}>
            Vendor: {foodVendor}
          </p>
        )}

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
              <li>Review issues with food service vendor</li>
              <li>Document vendor response</li>
              <li>Set corrective action plan within 45 days</li>
              {rating === 'RED' && <li>Address temperature/sanitation issues immediately</li>}
            </ul>
          </div>
        )}

        {/* Survey Reminder */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#0369a1',
          textAlign: 'left'
        }}>
          <strong>Survey Reminder:</strong>
          <div style={{ marginTop: '4px' }}>
            Ensure student surveys (10+) and staff surveys (3+) are completed for comprehensive feedback.
          </div>
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
            Start Another Check
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
