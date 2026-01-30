import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GREEN_STREAK_METRICS, calculateOverallStatus } from '../data/greenStreakZones';
import { CheckCircle, AlertTriangle, ArrowRight, Camera } from 'lucide-react';

export const GreenStreakSummary = ({ greenStreakWalk }) => {
  const navigate = useNavigate();

  // Redirect if no walk in progress
  useEffect(() => {
    if (!greenStreakWalk.isInProgress) {
      navigate('/green-streak');
    }
  }, [greenStreakWalk.isInProgress, navigate]);

  const status = calculateOverallStatus(greenStreakWalk.checkResults);
  const issues = greenStreakWalk.issues || [];

  const handleComplete = () => {
    greenStreakWalk.completeWalk();
    navigate('/green-streak/complete');
  };

  const streakMetrics = Object.values(GREEN_STREAK_METRICS).filter(m => !m.isVendorQC);
  const cleanlinessMetric = GREEN_STREAK_METRICS.CLEANLINESS;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div style={{
        background: status.overall === 'GREEN'
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        padding: '24px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>
          {status.overall === 'GREEN' ? '🟢' : '🔴'}
        </div>
        <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
          {status.overall === 'GREEN' ? 'All Green!' : 'Issues Found'}
        </div>
        <div style={{ fontSize: '16px', opacity: 0.9 }}>
          {status.overall === 'GREEN'
            ? 'Green Streak intact'
            : `${issues.length} issue${issues.length !== 1 ? 's' : ''} need attention`}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Metric Status Cards */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#092849' }}>
            Green Streak Metrics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {streakMetrics.map(metric => {
              const metricStatus = status.metricStatuses[metric.id];
              const isGreen = metricStatus === 'GREEN';
              const metricIssues = issues.filter(i => i.metric === Object.keys(GREEN_STREAK_METRICS).find(k => GREEN_STREAK_METRICS[k].id === metric.id));

              return (
                <div
                  key={metric.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 16px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: `2px solid ${isGreen ? '#10b981' : '#ef4444'}`
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isGreen ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    {isGreen ? (
                      <CheckCircle size={20} color="#fff" />
                    ) : (
                      <AlertTriangle size={20} color="#fff" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#333' }}>{metric.name}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{metric.principle}</div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: isGreen ? '#dcfce7' : '#fee2e2',
                    color: isGreen ? '#166534' : '#991b1b',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {isGreen ? 'GREEN' : `${metricIssues.length} issue${metricIssues.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cleanliness Status (Vendor QC) */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#092849' }}>
            Cleanliness (Vendor QC)
          </h3>

          {(() => {
            const cleanStatus = status.metricStatuses[cleanlinessMetric.id];
            const isGood = cleanStatus === 'GREEN';
            const cleanIssues = issues.filter(i => i.metric === 'CLEANLINESS');

            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: `2px solid ${isGood ? '#10b981' : '#f59e0b'}`
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isGood ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  {isGood ? (
                    <CheckCircle size={20} color="#fff" />
                  ) : (
                    <AlertTriangle size={20} color="#fff" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333' }}>Tour Ready</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Vendor spot-check</div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: isGood ? '#dcfce7' : '#fef3c7',
                  color: isGood ? '#166534' : '#92400e',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {isGood ? 'GOOD' : `${cleanIssues.length} flag${cleanIssues.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            );
          })()}

          <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
            Cleanliness issues don't break the Green Streak but should be escalated to vendors.
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#092849' }}>
              Issues to Escalate ({issues.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {issues.map((issue, idx) => {
                const metric = GREEN_STREAK_METRICS[issue.metric];
                return (
                  <div
                    key={issue.id || idx}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: `4px solid ${metric?.color || '#666'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: metric?.color || '#666',
                        textTransform: 'uppercase'
                      }}>
                        {metric?.name || issue.metric}
                      </div>
                      {issue.photos && issue.photos.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }}>
                          <Camera size={14} />
                          {issue.photos.length}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                      {issue.question}
                    </div>

                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {issue.description}
                    </div>

                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {issue.stopName}
                      {issue.roomSelection && ` - ${issue.roomSelection}`}
                    </div>

                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #f3f4f6',
                      fontSize: '12px',
                      color: '#dc2626'
                    }}>
                      <strong>Escalate to:</strong> {metric?.escalation || 'VP of Ops'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Walk Info */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Campus</div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>{greenStreakWalk.campus}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Coordinator</div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>{greenStreakWalk.coordinator}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Date</div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>
                {new Date(greenStreakWalk.startTime).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Time</div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>
                {new Date(greenStreakWalk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          style={{
            width: '100%',
            background: status.overall === 'GREEN'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Complete Walk
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
