import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { MECHANICAL_ZONES, MECHANICAL_SECTIONS_SUMMARY, calculateZoneRating } from '../data/mechanicalZones';

export const MechanicalSummary = ({ mechanicalChecklist }) => {
  const navigate = useNavigate();
  const {
    campus,
    auditor,
    checklistType,
    checkResults,
    issues,
    completeChecklist
  } = mechanicalChecklist;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentZone = MECHANICAL_ZONES[checklistType];

  // Redirect if no checklist in progress
  useEffect(() => {
    if (!checklistType || !checkResults || Object.keys(checkResults).length === 0) {
      navigate('/mechanical');
    }
  }, [checklistType, checkResults, navigate]);

  if (!currentZone) {
    return null;
  }

  // Calculate rating preview
  const previewRating = calculateZoneRating(checklistType, checkResults, issues);

  // Count results by section
  const getSectionStats = (sectionName) => {
    const section = currentZone.sections.find(s => s.name === sectionName);
    if (!section) return { passed: 0, failed: 0, total: 0 };

    let passed = 0;
    let failed = 0;

    section.checks.forEach(check => {
      if (checkResults[check.id] === true) passed++;
      if (checkResults[check.id] === false) failed++;
    });

    return { passed, failed, total: section.checks.length };
  };

  // Total stats
  const totalPassed = Object.values(checkResults).filter(v => v === true).length;
  const totalFailed = Object.values(checkResults).filter(v => v === false).length;
  const totalChecks = Object.keys(checkResults).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Complete the checklist and get the rating
      const { rating } = completeChecklist();

      // Navigate to complete page
      navigate('/mechanical/complete');
    } catch (error) {
      console.error('Error submitting mechanical checklist:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title="Review & Submit"
        subtitle={campus}
        onBack={() => navigate('/mechanical/checklist')}
      />

      <div style={{ padding: '20px' }}>
        {/* Rating Preview */}
        <div style={{
          backgroundColor: getRatingBg(previewRating),
          border: `2px solid ${getRatingColor(previewRating)}`,
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Projected Rating
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: getRatingColor(previewRating)
          }}>
            {previewRating}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            {previewRating === 'GREEN' && 'All systems operating properly'}
            {previewRating === 'AMBER' && 'Minor issues identified - action required'}
            {previewRating === 'RED' && 'Critical issues need immediate attention'}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            Summary
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{totalPassed}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Passed</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{totalFailed}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Issues</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#092849' }}>{totalChecks}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Total</div>
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            By Section
          </div>
          {currentZone.sections.map((section, idx) => {
            const stats = getSectionStats(section.name);
            const sectionInfo = MECHANICAL_SECTIONS_SUMMARY.find(s =>
              section.name.toLowerCase().includes(s.name.toLowerCase())
            );

            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: idx < currentZone.sections.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <span style={{ fontSize: '24px', marginRight: '12px' }}>
                  {sectionInfo?.icon || '📋'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {sectionInfo?.name || section.name.split(' - ')[0]}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {stats.passed} passed, {stats.failed} issues
                  </div>
                </div>
                {stats.failed > 0 ? (
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {stats.failed} issue{stats.failed > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ✓ Pass
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
              Issues Found ({issues.length})
            </div>
            {issues.map((issue, idx) => (
              <div key={issue.id} style={{
                padding: '12px',
                backgroundColor: issue.instantRed ? '#fef2f2' : '#f9fafb',
                borderRadius: '8px',
                marginBottom: idx < issues.length - 1 ? '8px' : 0
              }}>
                {issue.instantRed && (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '6px'
                  }}>
                    INSTANT RED
                  </span>
                )}
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                  {issue.checkText}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {issue.explanation}
                </div>
                {issue.photos && issue.photos.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {issue.photos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt={`Issue photo ${pIdx + 1}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auditor Info */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '8px' }}>
            Audit Details
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div>Campus: {campus}</div>
            <div>Auditor: {auditor}</div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
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
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
};
