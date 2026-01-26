import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SECURITY_ZONES, SECURITY_ZONE_ORDER, SECURITY_RAG_RULES } from '../data/securityZones';
import { saveSecurityAudit } from '../supabase/securityService';

export const SecuritySummary = ({ securityChecklist }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    campus,
    auditor,
    startTime,
    zoneRatings,
    issues,
    completeChecklist
  } = securityChecklist;

  // Calculate checklist duration
  const checklistDuration = useMemo(() => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { total: diffMins, hours, mins };
  }, [startTime]);

  // Calculate final results
  const finalResult = useMemo(() => {
    return completeChecklist();
  }, [completeChecklist]);

  const finalRatings = finalResult?.zoneRatings || zoneRatings;
  const overallRating = finalResult?.overallRating;

  // Count zones by rating
  const greenCount = Object.values(finalRatings).filter(r => r === 'GREEN').length;
  const amberCount = Object.values(finalRatings).filter(r => r === 'AMBER').length;
  const redCount = Object.values(finalRatings).filter(r => r === 'RED').length;

  // Group issues
  const instantRedIssues = issues.filter(i => i.instantRed);
  const otherIssues = issues.filter(i => !i.instantRed);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const auditData = securityChecklist.getChecklistData();
      await saveSecurityAudit(auditData);
      navigate('/security/complete');
    } catch (error) {
      console.error('Error saving security audit:', error);
      alert('Error saving audit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: overallRating === 'GREEN'
          ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
          : overallRating === 'AMBER'
          ? 'linear-gradient(180deg, #d97706 0%, #b45309 100%)'
          : 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
        color: '#fff',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {overallRating === 'GREEN' ? '✅' : overallRating === 'AMBER' ? '⚠️' : '❌'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
          {overallRating === 'GREEN'
            ? SECURITY_RAG_RULES.green.description
            : overallRating === 'AMBER'
            ? SECURITY_RAG_RULES.amber.description
            : SECURITY_RAG_RULES.red.description}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          {campus} - Security Compliance
        </p>
        <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
          Completed by {auditor}
        </p>
        {checklistDuration && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>Duration: </span>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>
              {checklistDuration.hours > 0
                ? `${checklistDuration.hours}h ${checklistDuration.mins}m`
                : `${checklistDuration.mins} minutes`}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Stats Overview */}
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

        {/* Rating Criteria */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            Rating Breakdown:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: instantRedIssues.length === 0 ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              {instantRedIssues.length === 0 ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '14px' }}>
              No Instant RED items failed ({instantRedIssues.length} found)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: issues.length <= SECURITY_RAG_RULES.amber.maxOpenIssues ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              {issues.length <= SECURITY_RAG_RULES.amber.maxOpenIssues ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '14px' }}>
              ≤{SECURITY_RAG_RULES.amber.maxOpenIssues} open issues ({issues.length} total)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              ✓
            </span>
            <span style={{ fontSize: '14px' }}>
              Each issue needs owner + fix date within 45 days
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
            Section Ratings
          </h3>
          {SECURITY_ZONE_ORDER.map(zoneId => {
            const zone = SECURITY_ZONES[zoneId];
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

        {/* Instant RED Issues */}
        {instantRedIssues.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '2px solid #ef4444'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#dc2626' }}>
              ⚠️ Instant RED Issues ({instantRedIssues.length})
            </h3>
            <div style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '12px' }}>
              These issues prevent the campus from achieving Amber or Green status.
            </div>
            {instantRedIssues.map((issue, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#b91c1c' }}>
                  {issue.zoneName} - {issue.section}
                </div>
                <div style={{ fontSize: '14px', color: '#333', marginTop: '4px' }}>
                  {issue.checkText}
                </div>
                {issue.explanation && (
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px'
                  }}>
                    <strong>Explanation:</strong> {issue.explanation}
                  </div>
                )}
                {issue.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {issue.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt={`Issue ${pIdx + 1}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '6px',
                          objectFit: 'cover'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Other Issues */}
        {otherIssues.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
              Other Issues ({otherIssues.length})
            </h3>
            {otherIssues.map((issue, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#92400e' }}>
                  {issue.zoneName} - {issue.section}
                </div>
                <div style={{ fontSize: '14px', color: '#333', marginTop: '4px' }}>
                  {issue.checkText}
                </div>
                {issue.explanation && (
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px'
                  }}>
                    <strong>Explanation:</strong> {issue.explanation}
                  </div>
                )}
                {issue.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {issue.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt={`Issue ${pIdx + 1}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '6px',
                          objectFit: 'cover'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Issues */}
        {issues.length === 0 && (
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '2px solid #10b981',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>
              No Issues Found!
            </div>
            <div style={{ fontSize: '14px', color: '#065f46', marginTop: '4px' }}>
              All security checks passed.
            </div>
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            backgroundColor: isSubmitting ? '#9ca3af' : '#092849',
            color: '#fff'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Security Checklist →'}
        </button>
      </div>
    </div>
  );
};
