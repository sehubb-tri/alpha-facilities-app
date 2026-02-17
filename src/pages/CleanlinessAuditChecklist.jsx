import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isCleanlinessInstantRed, isCleanlinessPhotoRequired } from '../data/cleanlinessZones';

export const CleanlinessAuditChecklist = ({ cleanlinessAudit, camera }) => {
  const navigate = useNavigate();
  const [localResults, setLocalResults] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  const {
    checklistType,
    checkResults,
    issues,
    campus,
    weekNumber,
    assignedRooms,
    recordZoneResults,
    addIssue,
    updateIssue,
    addPhotoToIssue,
    getCurrentZone
  } = cleanlinessAudit;

  const currentZone = getCurrentZone();

  // Initialize local state from saved results
  useEffect(() => {
    if (checkResults) {
      setLocalResults(() => checkResults);
    }

    if (currentZone?.sections) {
      const sections = {};
      currentZone.sections.forEach(section => {
        sections[section.name] = true;
      });
      setExpandedSections(() => sections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistType]);

  // Redirect if not initialized
  useEffect(() => {
    if (!cleanlinessAudit.startTime || !checklistType) {
      navigate('/cleanliness');
    }
  }, [cleanlinessAudit.startTime, checklistType, navigate]);

  const handleResponse = (checkId, value) => {
    setLocalResults(prev => ({
      ...prev,
      [checkId]: value
    }));
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getTotalChecks = () => {
    return currentZone?.sections?.reduce((acc, section) => acc + section.checks.length, 0) || 0;
  };

  const getAnsweredCount = () => {
    return Object.keys(localResults).filter(k => localResults[k] !== undefined).length;
  };

  const isComplete = getAnsweredCount() === getTotalChecks();

  const getFailedChecks = () => {
    const failed = [];
    currentZone?.sections?.forEach(section => {
      section.checks.forEach(check => {
        if (localResults[check.id] === false) {
          failed.push({
            ...check,
            section: section.name
          });
        }
      });
    });
    return failed;
  };

  const failedChecks = getFailedChecks();

  const allIssuesDocumented = failedChecks.every(check => {
    const issue = issues.find(i => i.checkId === check.id);
    if (!issue) return false;
    if (!issue.explanation || issue.explanation.trim() === '') return false;
    if (isCleanlinessPhotoRequired(check.id) && (!issue.photos || issue.photos.length === 0)) return false;
    return true;
  });

  const isGreen = failedChecks.length === 0 && isComplete;
  const canProceed = isComplete && (isGreen || allIssuesDocumented);

  const handleTakeIssuePhoto = (check) => {
    let existingIssue = issues.find(i => i.checkId === check.id);
    let issueId = existingIssue?.id;

    if (!existingIssue) {
      const newIssue = {
        checklistType,
        checklistName: currentZone.name,
        checkId: check.id,
        checkText: check.text,
        section: check.section,
        roomName: check.roomName || null,
        roomType: check.roomType || null,
        instantRed: isCleanlinessInstantRed(check.id),
        photoRequired: isCleanlinessPhotoRequired(check.id),
        slaTier: check.slaTier || null,
        photos: [],
        explanation: ''
      };
      issueId = addIssue(newIssue);
    }

    camera.openCamera((imageData) => {
      if (imageData && issueId) {
        addPhotoToIssue(issueId, imageData);
      }
    });
  };

  const handleRemoveIssuePhoto = (issueId, photoIndex) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const newPhotos = issue.photos.filter((_, i) => i !== photoIndex);
      updateIssue(issueId, { photos: newPhotos });
    }
  };

  const handleExplanationChange = (checkId, explanation) => {
    let existingIssue = issues.find(i => i.checkId === checkId);

    if (existingIssue) {
      updateIssue(existingIssue.id, { explanation: explanation.slice(0, 500) });
    } else {
      const check = failedChecks.find(c => c.id === checkId);
      if (check) {
        addIssue({
          checklistType,
          checklistName: currentZone.name,
          checkId: check.id,
          checkText: check.text,
          section: check.section,
          roomName: check.roomName || null,
          roomType: check.roomType || null,
          instantRed: isCleanlinessInstantRed(check.id),
          photoRequired: isCleanlinessPhotoRequired(check.id),
          slaTier: check.slaTier || null,
          photos: [],
          explanation: explanation.slice(0, 500)
        });
      }
    }
  };

  const handleComplete = () => {
    recordZoneResults(checklistType, localResults);

    failedChecks.forEach(check => {
      const existingIssue = issues.find(i => i.checkId === check.id);
      if (!existingIssue) {
        addIssue({
          checklistType,
          checklistName: currentZone.name,
          checkId: check.id,
          checkText: check.text,
          section: check.section,
          roomName: check.roomName || null,
          roomType: check.roomType || null,
          instantRed: isCleanlinessInstantRed(check.id),
          photoRequired: isCleanlinessPhotoRequired(check.id),
          slaTier: check.slaTier || null,
          photos: [],
          explanation: ''
        });
      }
    });

    navigate('/cleanliness/summary');
  };

  const handleBack = () => {
    navigate('/cleanliness');
  };

  if (!currentZone) {
    return null;
  }

  // Count section completion
  const getSectionProgress = (section) => {
    const total = section.checks.length;
    const answered = section.checks.filter(c => localResults[c.id] !== undefined).length;
    const failed = section.checks.filter(c => localResults[c.id] === false).length;
    return { total, answered, failed, complete: answered === total };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleBack}
            style={{
              fontSize: '24px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            &#8592;
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {currentZone.name}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
              {campus}
              {checklistType === 'weekly' && weekNumber ? ` - Week ${weekNumber}` : ''}
            </p>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: '#fff',
        padding: '12px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Progress</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#092849' }}>
            {getAnsweredCount()} / {getTotalChecks()}
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
            width: `${(getAnsweredCount() / getTotalChecks()) * 100}%`,
            backgroundColor: isComplete ? '#10b981' : '#2563eb',
            borderRadius: '4px',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Zone Description */}
      <div style={{
        backgroundColor: 'rgba(194, 236, 253, 0.5)',
        borderLeft: '4px solid #2B57D0',
        padding: '14px 16px',
        margin: '16px 20px',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '14px', color: '#141685' }}>
          {currentZone.description}
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
          Estimated time: {currentZone.timeNeeded}
        </div>
      </div>

      {/* Weekly Room Assignment Info */}
      {checklistType === 'weekly' && assignedRooms.length > 0 && (
        <div style={{
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #2563eb',
          padding: '14px 16px',
          margin: '0 20px 16px',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
            Week {weekNumber} Assigned Rooms: {assignedRooms.length}
          </div>
          <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '4px' }}>
            {assignedRooms.map(r => r.name).join(', ')}
          </div>
        </div>
      )}

      {/* Sections and Checks */}
      <div style={{ padding: '0 20px' }}>
        {currentZone.sections?.map((section) => {
          const progress = getSectionProgress(section);
          return (
            <div key={section.name} style={{ marginBottom: '16px' }}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.name)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: section.isAssignedRoom ? '#1e40af' : '#092849',
                  color: '#fff',
                  borderRadius: expandedSections[section.name] ? '12px 12px 0 0' : '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <span>{section.name}</span>
                  {progress.answered > 0 && (
                    <span style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginLeft: '8px'
                    }}>
                      {progress.answered}/{progress.total}
                      {progress.failed > 0 ? ` (${progress.failed} failed)` : ''}
                    </span>
                  )}
                </div>
                <span style={{ transform: expandedSections[section.name] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  &#9660;
                </span>
              </button>

              {/* Section Description */}
              {expandedSections[section.name] && section.description && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '12px 16px',
                  borderLeft: '1px solid #e5e7eb',
                  borderRight: '1px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {section.description}
                </div>
              )}

              {/* Section Checks */}
              {expandedSections[section.name] && (
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '0 0 12px 12px',
                  border: '1px solid #e5e7eb',
                  borderTop: section.description ? 'none' : '1px solid #e5e7eb'
                }}>
                  {section.checks.map((check, checkIndex) => {
                    const result = localResults[check.id];
                    const issue = issues.find(i => i.checkId === check.id);
                    const instantRedItem = check.instantRed || isCleanlinessInstantRed(check.id);
                    const photoReq = check.photoRequired || isCleanlinessPhotoRequired(check.id);

                    return (
                      <div key={check.id} style={{
                        padding: '16px',
                        borderBottom: checkIndex < section.checks.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}>
                        {/* Check Text */}
                        <div style={{ fontSize: '15px', marginBottom: '8px', color: '#333', lineHeight: '1.4' }}>
                          {check.text}
                        </div>

                        {/* Help Text */}
                        {check.helpText && (
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px', fontStyle: 'italic' }}>
                            {check.helpText}
                          </div>
                        )}

                        {/* Yes/No Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleResponse(check.id, true)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              fontSize: '15px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: result === true ? '#10b981' : '#f3f4f6',
                              color: result === true ? '#fff' : '#333'
                            }}
                          >
                            &#10003; Yes
                          </button>
                          <button
                            onClick={() => handleResponse(check.id, false)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              fontSize: '15px',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: result === false ? '#ef4444' : '#f3f4f6',
                              color: result === false ? '#fff' : '#333'
                            }}
                          >
                            &#10007; No
                          </button>
                        </div>

                        {/* Issue Documentation */}
                        {result === false && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            border: '1px solid #fecaca'
                          }}>
                            <div style={{ marginBottom: photoReq ? '12px' : '0' }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#b91c1c', marginBottom: '6px' }}>
                                Explanation Required *
                              </div>
                              <textarea
                                value={issue?.explanation || ''}
                                onChange={(e) => handleExplanationChange(check.id, e.target.value)}
                                placeholder="Describe what was found and why it failed..."
                                maxLength={500}
                                style={{
                                  width: '100%',
                                  padding: '10px',
                                  borderRadius: '6px',
                                  border: '1px solid #fca5a5',
                                  fontSize: '14px',
                                  resize: 'none',
                                  minHeight: '70px',
                                  fontFamily: 'inherit',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>

                            {photoReq && (
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#b91c1c', marginBottom: '6px' }}>
                                  Photo Required *
                                </div>

                                {issue?.photos?.length > 0 && (
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                    marginBottom: '8px'
                                  }}>
                                    {issue.photos.map((photo, idx) => (
                                      <div key={idx} style={{ position: 'relative' }}>
                                        <img
                                          src={photo}
                                          alt={`Issue ${idx + 1}`}
                                          style={{
                                            width: '100%',
                                            height: '80px',
                                            borderRadius: '6px',
                                            objectFit: 'cover'
                                          }}
                                        />
                                        <button
                                          onClick={() => handleRemoveIssuePhoto(issue.id, idx)}
                                          style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            backgroundColor: '#ef4444',
                                            color: '#fff',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                          }}
                                        >
                                          &#215;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleTakeIssuePhoto({ ...check, section: section.name })}
                                  style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px dashed #fca5a5',
                                    borderRadius: '6px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                  }}
                                >
                                  <span>&#128247;</span>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c' }}>
                                    {issue?.photos?.length > 0 ? 'Add Another Photo' : 'Take Photo'}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Green Success */}
        {isComplete && isGreen && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
              All checks passed! Campus is tour ready.
            </div>
          </div>
        )}

        {/* Issues Warning */}
        {isComplete && !isGreen && !allIssuesDocumented && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '2px solid #f59e0b'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#d97706' }}>
              Please complete all issue documentation
            </div>
            <div style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
              Every "No" answer needs an explanation{failedChecks.some(c => isCleanlinessPhotoRequired(c.id)) ? ' and photo where required' : ''}.
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
          onClick={handleComplete}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            backgroundColor: canProceed ? '#092849' : '#d1d5db',
            color: canProceed ? '#fff' : '#9ca3af'
          }}
        >
          {!isComplete
            ? `Answer All Questions (${getAnsweredCount()}/${getTotalChecks()})`
            : !allIssuesDocumented && !isGreen
            ? 'Complete All Issue Documentation'
            : 'Submit Report \u2192'}
        </button>
      </div>
    </div>
  );
};
