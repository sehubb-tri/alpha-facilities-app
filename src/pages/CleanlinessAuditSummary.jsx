import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLEANLINESS_ZONES, CLEANLINESS_RAG_RULES, SLA_TIERS } from '../data/cleanlinessZones';
import { saveCleanlinessAudit } from '../supabase/cleanlinessAuditService';
import { createConsolidatedChecklistTask, isCampusWrikeEnabled } from '../services/wrikeService';

export const CleanlinessAuditSummary = ({ cleanlinessAudit }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    campus,
    auditor,
    auditorEmail,
    startTime,
    checklistType,
    weekNumber,
    assignedRooms,
    issues,
    completeChecklist
  } = cleanlinessAudit;

  const currentZone = CLEANLINESS_ZONES[checklistType];

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

  const finalResult = useMemo(() => {
    return completeChecklist();
  }, [completeChecklist]);

  const rating = finalResult?.rating;

  const instantRedIssues = issues.filter(i => i.instantRed);
  const otherIssues = issues.filter(i => !i.instantRed);

  // Group issues by SLA tier for cleanliness
  const tier1Issues = issues.filter(i => i.slaTier === 1);
  const tier2Issues = issues.filter(i => i.slaTier === 2);

  const getRatingColor = (r) => {
    switch (r) {
      case 'GREEN': return '#10b981';
      case 'AMBER': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const auditData = cleanlinessAudit.getChecklistData();
      await saveCleanlinessAudit(auditData);

      // Submit to Wrike
      if (isCampusWrikeEnabled(campus)) {
        try {
          console.log('[CleanlinessAuditSummary] Creating consolidated Wrike task...');
          const formattedIssues = issues.map(issue => ({
            category: issue.instantRed ? '🔴 Instant Red' : `T${issue.slaTier || 3} Issue`,
            section: issue.section,
            check: issue.checkText,
            description: issue.explanation || 'Issue found',
            photos: issue.photos || [],
            roomName: issue.roomName || null,
            slaTier: issue.slaTier || null
          }));
          await createConsolidatedChecklistTask({
            checklistType: `Cleanliness ${checklistType === 'weekly' ? 'Weekly Audit' : 'Monthly Deep Dive'}`,
            campusName: campus,
            auditorName: auditor,
            auditorEmail: auditorEmail,
            issues: formattedIssues,
            date: new Date().toLocaleDateString()
          });
          console.log('[CleanlinessAuditSummary] Wrike task created');
        } catch (wrikeError) {
          console.error('[CleanlinessAuditSummary] Wrike error:', wrikeError);
        }
      }

      navigate('/cleanliness/complete');
    } catch (error) {
      console.error('Error saving cleanliness audit:', error);
      alert('Error saving audit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: rating === 'GREEN'
          ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
          : rating === 'AMBER'
          ? 'linear-gradient(180deg, #d97706 0%, #b45309 100%)'
          : 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
        color: '#fff',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {rating === 'GREEN' ? '\u2705' : rating === 'AMBER' ? '\u26A0\uFE0F' : '\u274C'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
          {rating === 'GREEN'
            ? CLEANLINESS_RAG_RULES.green.description
            : rating === 'AMBER'
            ? CLEANLINESS_RAG_RULES.amber.description
            : CLEANLINESS_RAG_RULES.red.description}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          {currentZone?.name || checklistType}
          {checklistType === 'weekly' && weekNumber ? ` - Week ${weekNumber}` : ''}
        </p>
        <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
          {campus} - Completed by {auditor}
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
        {/* Rating Badge */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: `2px solid ${getRatingColor(rating)}`,
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: '8px',
            backgroundColor: getRatingColor(rating),
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {rating}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
            {issues.length === 0
              ? 'All checks passed! Campus is tour ready.'
              : `${issues.length} issue${issues.length > 1 ? 's' : ''} found`}
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
              width: '20px', height: '20px', borderRadius: '50%',
              backgroundColor: instantRedIssues.length === 0 ? '#10b981' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px'
            }}>
              {instantRedIssues.length === 0 ? '\u2713' : '\u2717'}
            </span>
            <span style={{ fontSize: '14px' }}>
              No Instant RED items failed ({instantRedIssues.length} found)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              backgroundColor: issues.length <= CLEANLINESS_RAG_RULES.amber.maxOpenIssues ? '#10b981' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px'
            }}>
              {issues.length <= CLEANLINESS_RAG_RULES.amber.maxOpenIssues ? '\u2713' : '\u2717'}
            </span>
            <span style={{ fontSize: '14px' }}>
              Amber allows max {CLEANLINESS_RAG_RULES.amber.maxOpenIssues} defect ({issues.length} total)
            </span>
          </div>
        </div>

        {/* Assigned Rooms Summary (weekly only) */}
        {checklistType === 'weekly' && assignedRooms && assignedRooms.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#092849', marginBottom: '8px' }}>
              Rooms Audited (Week {weekNumber})
            </div>
            {assignedRooms.map((room, idx) => (
              <div key={idx} style={{
                fontSize: '13px', color: '#666',
                padding: '4px 0',
                borderBottom: idx < assignedRooms.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                {room.name}
              </div>
            ))}
          </div>
        )}

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
              Instant RED Issues ({instantRedIssues.length})
            </h3>
            <div style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '12px' }}>
              These issues prevent passing until fixed. Restroom and safety defects cannot be Amber.
            </div>
            {instantRedIssues.map((issue, idx) => (
              <div key={idx} style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#b91c1c' }}>
                    {issue.section}
                  </div>
                  {issue.slaTier && (
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      backgroundColor: '#dc2626', color: '#fff',
                      padding: '2px 8px', borderRadius: '4px'
                    }}>
                      T{issue.slaTier} - {SLA_TIERS[`tier${issue.slaTier}`]?.resolution || ''}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#333', marginTop: '4px' }}>
                  {issue.checkText}
                </div>
                {issue.roomName && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Room: {issue.roomName}
                  </div>
                )}
                {issue.explanation && (
                  <div style={{
                    fontSize: '13px', color: '#666', marginTop: '8px',
                    padding: '8px', backgroundColor: '#fff', borderRadius: '4px'
                  }}>
                    <strong>Explanation:</strong> {issue.explanation}
                  </div>
                )}
                {issue.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {issue.photos.map((photo, pIdx) => (
                      <img key={pIdx} src={photo} alt={`Issue ${pIdx + 1}`}
                        style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', color: '#92400e' }}>
                    {issue.section}
                  </div>
                  {issue.slaTier && (
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      backgroundColor: '#d97706', color: '#fff',
                      padding: '2px 8px', borderRadius: '4px'
                    }}>
                      T{issue.slaTier} - {SLA_TIERS[`tier${issue.slaTier}`]?.resolution || ''}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#333', marginTop: '4px' }}>
                  {issue.checkText}
                </div>
                {issue.roomName && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    Room: {issue.roomName}
                  </div>
                )}
                {issue.explanation && (
                  <div style={{
                    fontSize: '13px', color: '#666', marginTop: '8px',
                    padding: '8px', backgroundColor: '#fff', borderRadius: '4px'
                  }}>
                    <strong>Explanation:</strong> {issue.explanation}
                  </div>
                )}
                {issue.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {issue.photos.map((photo, pIdx) => (
                      <img key={pIdx} src={photo} alt={`Issue ${pIdx + 1}`}
                        style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
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
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>&#127881;</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>
              No Issues Found!
            </div>
            <div style={{ fontSize: '14px', color: '#065f46', marginTop: '4px' }}>
              All cleanliness checks passed. Campus is tour ready.
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
          {isSubmitting ? 'Submitting...' : 'Submit Report \u2192'}
        </button>
      </div>
    </div>
  );
};
