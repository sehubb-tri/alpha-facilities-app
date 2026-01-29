import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { PhotoCaptureModal } from '../components/PhotoCaptureModal';
import { FURNITURE_ZONES, isInstantRed, isPhotoRequired } from '../data/furnitureZones';

export const FurnitureChecklist = ({ furnitureChecklist, camera }) => {
  const navigate = useNavigate();
  const {
    campus,
    checklistType,
    checkResults,
    issues,
    recordZoneResults,
    addIssue,
    updateIssue,
    addPhotoToIssue,
    removeIssue,
    getZoneCompletionStatus
  } = furnitureChecklist;

  const currentZone = FURNITURE_ZONES[checklistType];

  // Local state for current answers
  const [localResults, setLocalResults] = useState({});
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTargetIssue, setPhotoTargetIssue] = useState(null);

  // Initialize local results from saved state
  useEffect(() => {
    if (checkResults) {
      setLocalResults(checkResults);
    }
  }, [checkResults]);

  // Redirect if no checklist type selected
  useEffect(() => {
    if (!checklistType) {
      navigate('/furniture');
    }
  }, [checklistType, navigate]);

  if (!currentZone) {
    return null;
  }

  // Get all checks for this zone
  const allChecks = currentZone.sections.flatMap(section =>
    section.checks.map(check => ({ ...check, sectionName: section.name }))
  );

  // Calculate progress
  const totalChecks = allChecks.length;
  const answeredChecks = Object.keys(localResults).filter(k =>
    allChecks.some(c => c.id === k)
  ).length;
  const progressPercent = totalChecks > 0 ? Math.round((answeredChecks / totalChecks) * 100) : 0;

  const handleAnswer = (checkId, answer, check, sectionName) => {
    setLocalResults(prev => ({
      ...prev,
      [checkId]: answer
    }));

    if (answer === false) {
      // Create issue for NO answer
      const existingIssue = issues.find(i => i.checkId === checkId);
      if (!existingIssue) {
        const newIssueId = addIssue({
          checkId,
          checkText: check.text,
          section: sectionName,
          instantRed: isInstantRed(checkId),
          photoRequired: isPhotoRequired(checkId)
        });
        setExpandedIssue(newIssueId);
      }
    } else {
      // Remove issue if changing to YES
      const existingIssue = issues.find(i => i.checkId === checkId);
      if (existingIssue) {
        removeIssue(existingIssue.id);
        if (expandedIssue === existingIssue.id) {
          setExpandedIssue(null);
        }
      }
    }
  };

  const handleExplanationChange = (issueId, explanation) => {
    updateIssue(issueId, { explanation });
  };

  const handleTakePhoto = (issueId) => {
    setPhotoTargetIssue(issueId);
    setShowPhotoModal(true);
  };

  const handlePhotoCapture = async (photoData) => {
    if (photoTargetIssue && photoData) {
      addPhotoToIssue(photoTargetIssue, photoData);
    }
    setShowPhotoModal(false);
    setPhotoTargetIssue(null);
  };

  const handleComplete = () => {
    // Save results
    recordZoneResults(checklistType, localResults);

    // Check if all issues have required info
    const incompleteIssues = issues.filter(issue => {
      if (!issue.explanation || issue.explanation.trim() === '') return true;
      if (issue.photoRequired && (!issue.photos || issue.photos.length === 0)) return true;
      return false;
    });

    if (incompleteIssues.length > 0) {
      alert('Please complete all issue explanations and required photos before submitting.');
      // Expand first incomplete issue
      setExpandedIssue(incompleteIssues[0].id);
      return;
    }

    // Navigate to summary
    navigate('/furniture/summary');
  };

  const allAnswered = answeredChecks === totalChecks;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title={currentZone.name}
        subtitle={campus}
        onBack={() => {
          if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
            navigate('/furniture');
          }
        }}
      />

      {/* Progress Bar */}
      <div style={{ padding: '16px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Progress</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#092849' }}>
            {answeredChecks} / {totalChecks} checks
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: progressPercent === 100 ? '#10b981' : '#2563eb',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {currentZone.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} style={{ marginBottom: '24px' }}>
            {/* Section Header */}
            <div style={{
              backgroundColor: '#092849',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '10px 10px 0 0',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              {section.name}
            </div>
            {section.description && (
              <div style={{
                backgroundColor: 'rgba(194, 236, 253, 0.4)',
                padding: '10px 16px',
                fontSize: '14px',
                color: '#092849'
              }}>
                {section.description}
              </div>
            )}

            {/* Checks */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '0 0 10px 10px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              borderTop: 'none'
            }}>
              {section.checks.map((check, checkIdx) => {
                const answer = localResults[check.id];
                const issue = issues.find(i => i.checkId === check.id);
                const isExpanded = expandedIssue === issue?.id;
                const checkIsInstantRed = isInstantRed(check.id);

                return (
                  <div key={check.id}>
                    <div style={{
                      padding: '16px',
                      borderBottom: checkIdx < section.checks.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: answer === false ? '#fef2f2' : '#fff'
                    }}>
                      {/* Instant Red Badge */}
                      {checkIsInstantRed && (
                        <div style={{
                          display: 'inline-block',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          INSTANT RED
                        </div>
                      )}

                      {/* Check Text */}
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        {check.text}
                      </div>

                      {check.helpText && (
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '12px'
                        }}>
                          {check.helpText}
                        </div>
                      )}

                      {/* Answer Buttons */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleAnswer(check.id, true, check, section.name)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: answer === true ? '2px solid #10b981' : '2px solid #e5e7eb',
                            backgroundColor: answer === true ? '#d1fae5' : '#fff',
                            color: answer === true ? '#065f46' : '#333',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswer(check.id, false, check, section.name)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: answer === false ? '2px solid #ef4444' : '2px solid #e5e7eb',
                            backgroundColor: answer === false ? '#fee2e2' : '#fff',
                            color: answer === false ? '#991b1b' : '#333',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          No
                        </button>
                      </div>

                      {/* Issue Details (if NO) */}
                      {issue && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #fca5a5'
                        }}>
                          <button
                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
                              Issue Details {issue.photoRequired && !issue.photos?.length ? '(Photo Required)' : ''}
                            </span>
                            <span style={{ fontSize: '18px', color: '#666' }}>
                              {isExpanded ? '−' : '+'}
                            </span>
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: '12px' }}>
                              {/* Explanation */}
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                  display: 'block',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#dc2626',
                                  marginBottom: '6px'
                                }}>
                                  Explanation Required *
                                </label>
                                <textarea
                                  value={issue.explanation || ''}
                                  onChange={(e) => handleExplanationChange(issue.id, e.target.value)}
                                  placeholder="Please describe the issue and what was observed..."
                                  style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: (!issue.explanation || issue.explanation.trim() === '') ? '2px solid #ef4444' : '1px solid #ccc',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    backgroundColor: (!issue.explanation || issue.explanation.trim() === '') ? '#fef2f2' : '#fff'
                                  }}
                                />
                              </div>

                              {/* Photos */}
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#333',
                                  marginBottom: '6px'
                                }}>
                                  Photos {issue.photoRequired ? '*' : '(Optional)'}
                                </label>

                                {issue.photos && issue.photos.length > 0 && (
                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    {issue.photos.map((photo, idx) => (
                                      <img
                                        key={idx}
                                        src={photo}
                                        alt={`Issue photo ${idx + 1}`}
                                        style={{
                                          width: '60px',
                                          height: '60px',
                                          objectFit: 'cover',
                                          borderRadius: '6px',
                                          border: '1px solid #ccc'
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleTakePhoto(issue.id)}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #ccc',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <span>📷</span> Add Photo
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
          disabled={!allAnswered}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
            backgroundColor: allAnswered ? '#092849' : '#9ca3af',
            color: '#fff'
          }}
        >
          {allAnswered ? 'Submit Report →' : `Answer All Checks (${answeredChecks}/${totalChecks})`}
        </button>
      </div>

      {/* Photo Capture Modal */}
      {showPhotoModal && (
        <PhotoCaptureModal
          isOpen={showPhotoModal}
          onClose={() => {
            setShowPhotoModal(false);
            setPhotoTargetIssue(null);
          }}
          onCapture={handlePhotoCapture}
          camera={camera}
        />
      )}
    </div>
  );
};
