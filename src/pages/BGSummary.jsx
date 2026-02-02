import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BG_ZONES, BG_ZONE_ORDER, SLA_TIERS } from '../data/bgZones';
import { createConsolidatedChecklistTask, isCampusWrikeEnabled } from '../services/wrikeService';

export const BGSummary = ({ bgWalkthrough }) => {
  const navigate = useNavigate();

  const {
    campus,
    auditor,
    auditorEmail,
    startTime,
    zoneRatings,
    issues,
    observations,
    completeWalkthrough
  } = bgWalkthrough;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate walkthrough duration
  const walkthroughDuration = useMemo(() => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { total: diffMins, hours, mins };
  }, [startTime]);

  // Calculate final results - memoized to run once
  const campusResult = useMemo(() => {
    return completeWalkthrough();
  }, [completeWalkthrough]);

  const finalRatings = campusResult?.zoneRatings || zoneRatings;
  const campusRating = campusResult?.campusRating;

  // Count zones by rating
  const greenCount = Object.values(finalRatings).filter(r => r === 'GREEN').length;
  const amberCount = Object.values(finalRatings).filter(r => r === 'AMBER').length;
  const redCount = Object.values(finalRatings).filter(r => r === 'RED').length;
  const greenPercentage = Math.round((greenCount / BG_ZONE_ORDER.length) * 100);

  // Group issues by tier
  const tier1Issues = issues.filter(i => i.tier === 1);
  const tier2Issues = issues.filter(i => i.tier === 2);
  const tier3Issues = issues.filter(i => i.tier === 3);
  const tier4Issues = issues.filter(i => i.tier === 4);

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
      case 'GREEN': return '#f0fdf4';
      case 'AMBER': return '#fef3c7';
      case 'RED': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Submit to Wrike as consolidated task
      if (isCampusWrikeEnabled(campus)) {
        try {
          console.log('[B&G Walkthrough] Creating consolidated Wrike task...');
          const formattedIssues = issues.map(issue => ({
            category: issue.tier === 1 ? '🔴 Instant Red' : 'Issue',
            section: `Tier ${issue.tier} - ${issue.zone || 'General'}`,
            check: issue.description || issue.category,
            description: issue.observation || 'Issue found',
            photos: issue.photos || []
          }));
          await createConsolidatedChecklistTask({
            checklistType: 'BG_WALKTHROUGH',
            campusName: campus,
            auditorName: auditor,
            auditorEmail: auditorEmail,
            issues: formattedIssues,
            date: new Date().toLocaleDateString()
          });
          console.log('[B&G Walkthrough] Wrike task created');
        } catch (wrikeError) {
          console.error('[B&G Walkthrough] Wrike error:', wrikeError);
        }
      }
      navigate('/bg/complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: campusRating === 'PASS'
          ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
          : 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
        color: '#fff',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {campusRating === 'PASS' ? '✅' : '❌'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Campus {campusRating || 'Calculating...'}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          {campus} - Weekly B&G Walkthrough
        </p>
        <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
          Completed by {auditor}
        </p>
        {walkthroughDuration && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>⏱️ Walkthrough Time: </span>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>
              {walkthroughDuration.hours > 0
                ? `${walkthroughDuration.hours}h ${walkthroughDuration.mins}m`
                : `${walkthroughDuration.mins} minutes`}
            </span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>
              {greenCount}
            </div>
            <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>GREEN</div>
          </div>
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#d97706' }}>
              {amberCount}
            </div>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>AMBER</div>
          </div>
          <div style={{
            backgroundColor: '#fee2e2',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #ef4444'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
              {redCount}
            </div>
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600' }}>RED</div>
          </div>
        </div>

        {/* Pass/Fail Criteria */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Campus Rating Criteria:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: greenPercentage >= 85 ? '#10b981' : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              {greenPercentage >= 85 ? '✓' : ''}
            </span>
            <span style={{ fontSize: '14px' }}>
              ≥85% zones GREEN ({greenPercentage}% achieved)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: tier1Issues.length === 0 ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              {tier1Issues.length === 0 ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '14px' }}>
              Zero Tier 1 (Safety) issues ({tier1Issues.length} found)
            </span>
          </div>
        </div>

        {/* Zone Ratings */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
            Zone Ratings
          </h3>
          {BG_ZONE_ORDER.map(zoneId => {
            const zone = BG_ZONES[zoneId];
            const rating = finalRatings[zoneId] || 'N/A';
            const zoneIssues = issues.filter(i => i.zoneId === zoneId);

            return (
              <div key={zoneId} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: getRatingBg(rating),
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                    {zone.name}
                  </div>
                  {zoneIssues.length > 0 && (
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                      {zoneIssues.length} issue{zoneIssues.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: getRatingColor(rating),
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {rating}
                </div>
              </div>
            );
          })}
        </div>

        {/* Issues Summary */}
        {issues.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
              Issues by SLA Tier ({issues.length} total)
            </h3>

            {/* Tier 1 - Critical */}
            {tier1Issues.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    TIER 1 - CRITICAL
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {SLA_TIERS[1].resolution}
                  </span>
                </div>
                {tier1Issues.map((issue, idx) => (
                  <div key={idx} style={{
                    padding: '10px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontWeight: '500' }}>{issue.zoneName}</div>
                    <div style={{ color: '#666', fontSize: '13px' }}>{issue.checkText}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tier 2 - High Visibility */}
            {tier2Issues.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    TIER 2 - HIGH-VISIBILITY
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {SLA_TIERS[2].resolution}
                  </span>
                </div>
                {tier2Issues.map((issue, idx) => (
                  <div key={idx} style={{
                    padding: '10px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontWeight: '500' }}>{issue.zoneName}</div>
                    <div style={{ color: '#666', fontSize: '13px' }}>{issue.checkText}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tier 3 & 4 */}
            {(tier3Issues.length > 0 || tier4Issues.length > 0) && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    TIER 3/4 - ROUTINE
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {SLA_TIERS[3].resolution}
                  </span>
                </div>
                {[...tier3Issues, ...tier4Issues].map((issue, idx) => (
                  <div key={idx} style={{
                    padding: '10px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontWeight: '500' }}>{issue.zoneName}</div>
                    <div style={{ color: '#666', fontSize: '13px' }}>{issue.checkText}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Observations */}
        {observations.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
              Observations Routed to Other Pillars ({observations.length})
            </h3>
            {observations.map((obs, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#0369a1' }}>
                    {obs.categoryName}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    → {obs.pillar}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#333', marginTop: '4px' }}>
                  {obs.description}
                </div>
              </div>
            ))}
          </div>
        )}
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
          onClick={handleComplete}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#092849',
            color: '#fff'
          }}
        >
          Submit & Send Report →
        </button>
      </div>
    </div>
  );
};
