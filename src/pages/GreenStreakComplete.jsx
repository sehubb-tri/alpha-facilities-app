import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Home, RotateCcw, Share2 } from 'lucide-react';
// import { saveGreenStreakWalk } from '../supabase/services';

export const GreenStreakComplete = ({ greenStreakWalk }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const walkData = greenStreakWalk.getWalkData();
  const isGreen = walkData.overallStatus === 'GREEN';

  // Save to database on mount
  useEffect(() => {
    const saveWalk = async () => {
      if (saved || saving) return;

      setSaving(true);
      try {
        // TODO: Implement saveGreenStreakWalk in supabase/services
        // await saveGreenStreakWalk(walkData);
        console.log('Walk data to save:', walkData);
        setSaved(true);
      } catch (error) {
        console.error('Error saving walk:', error);
      } finally {
        setSaving(false);
      }
    };

    saveWalk();
  }, []);

  const handleNewWalk = () => {
    greenStreakWalk.resetWalk();
    navigate('/green-streak');
  };

  const handleGoHome = () => {
    greenStreakWalk.resetWalk();
    navigate('/');
  };

  // Calculate duration
  const duration = walkData.startTime && walkData.endTime
    ? Math.round((new Date(walkData.endTime) - new Date(walkData.startTime)) / 60000)
    : null;

  return (
    <div className="min-h-screen" style={{
      background: isGreen
        ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      color: '#fff'
    }}>
      {/* Success Animation */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <Zap size={64} color="#fff" />
      </div>

      {/* Status */}
      <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        {isGreen ? 'Green Streak Intact!' : 'Walk Complete'}
      </div>

      <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
        {isGreen
          ? 'All systems are GO'
          : `${walkData.totalIssues} issue${walkData.totalIssues !== 1 ? 's' : ''} logged for escalation`}
      </div>

      {/* Stats */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>{duration || '-'}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>minutes</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {Object.keys(walkData.checkResults).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>checks</div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: '16px',
          paddingTop: '16px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Campus</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{walkData.campus}</div>
        </div>
      </div>

      {/* Metric Summary */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {Object.entries(walkData.metricStatuses || {}).map(([metricId, status]) => (
          <div
            key={metricId}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: status === 'GREEN' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {status === 'GREEN' ? '✓' : '!'} {metricId.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <button
          onClick={handleGoHome}
          style={{
            width: '100%',
            backgroundColor: '#fff',
            color: isGreen ? '#059669' : '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Home size={20} />
          Back to Home
        </button>

        <button
          onClick={handleNewWalk}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <RotateCcw size={20} />
          Start New Walk
        </button>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div style={{ marginTop: '24px', fontSize: '14px', opacity: 0.8 }}>
          Saving walk data...
        </div>
      )}

      {/* Timestamp */}
      <div style={{ marginTop: '32px', fontSize: '13px', opacity: 0.6 }}>
        Completed {new Date(walkData.endTime || Date.now()).toLocaleString()}
      </div>
    </div>
  );
};
