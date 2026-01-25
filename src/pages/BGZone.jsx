import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BG_ZONES, BG_ZONE_ORDER, SLA_TIERS } from '../data/bgZones';

export const BGZone = ({ bgWalkthrough, camera }) => {
  const navigate = useNavigate();
  const [localResults, setLocalResults] = useState({});
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  const {
    currentZoneIndex,
    zoneResults,
    roomResults,
    selectedRooms,
    issues,
    exitPhotos,
    recordZoneResults,
    addIssue,
    updateIssue,
    removeIssue,
    addExitPhoto,
    nextZone,
    goToZone,
    calculateAndSetZoneRating
  } = bgWalkthrough;

  const currentZoneId = BG_ZONE_ORDER[currentZoneIndex];
  const currentZone = BG_ZONES[currentZoneId];
  const totalZones = BG_ZONE_ORDER.length;

  // Handle special zones
  const isObservationZone = currentZone?.isObservationZone;
  const isGovernanceZone = currentZone?.isGovernanceZone;
  const isRoomBased = currentZone?.isRoomBased;

  // For room-based zones, get the current room
  const allRooms = isRoomBased ? [
    ...selectedRooms.classrooms.map(name => ({ name, type: 'classroom' })),
    ...selectedRooms.bathrooms.map(name => ({ name, type: 'bathroom' }))
  ] : [];
  const currentRoom = allRooms[currentRoomIndex];
  const totalRooms = allRooms.length;

  // Get the right results object
  const getResultsKey = () => {
    if (isRoomBased && currentRoom) {
      return `${currentRoom.type}_${currentRoom.name}`;
    }
    return currentZoneId;
  };

  const resultsKey = getResultsKey();
  const existingResults = isRoomBased
    ? (roomResults[resultsKey] || {})
    : (zoneResults[currentZoneId] || {});

  // Initialize local results from existing
  useEffect(() => {
    setLocalResults(existingResults);
    // Expand all sections by default
    const sections = {};
    currentZone?.sections?.forEach(section => {
      sections[section.name] = true;
    });
    setExpandedSections(sections);
  }, [currentZoneId, currentRoomIndex]);

  // Redirect to special pages for observation and governance zones
  useEffect(() => {
    if (isObservationZone) {
      navigate('/bg/observations');
    } else if (isGovernanceZone) {
      navigate('/bg/governance');
    }
  }, [currentZoneId, isObservationZone, isGovernanceZone, navigate]);

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

  // Count answered questions
  const getTotalChecks = () => {
    return currentZone?.sections?.reduce((acc, section) => acc + section.checks.length, 0) || 0;
  };

  const getAnsweredCount = () => {
    return Object.keys(localResults).filter(k => localResults[k] !== undefined).length;
  };

  const isComplete = getAnsweredCount() === getTotalChecks();

  // Get failed checks for creating issues
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

  // Check if we need photos for failed items
  const failedChecks = getFailedChecks();
  const needsIssuePhotos = failedChecks.length > 0;

  // Get issues for current zone/room
  const currentIssues = issues.filter(issue => {
    if (isRoomBased) {
      return issue.roomId === resultsKey;
    }
    return issue.zoneId === currentZoneId;
  });

  // Check if all failed items have photos
  const allIssuesHavePhotos = failedChecks.every(check => {
    const issue = currentIssues.find(i => i.checkId === check.id);
    return issue && issue.photos && issue.photos.length > 0;
  });

  // Check if green zone needs exit photo
  const isGreen = failedChecks.length === 0 && isComplete;
  const hasExitPhoto = exitPhotos[isRoomBased ? resultsKey : currentZoneId];
  const needsExitPhoto = isGreen && !hasExitPhoto;

  const canProceed = isComplete && (
    (isGreen && hasExitPhoto) ||
    (!isGreen && allIssuesHavePhotos)
  );

  const handleTakeIssuePhoto = (check) => {
    // Find or create issue for this check
    let issue = currentIssues.find(i => i.checkId === check.id);

    if (!issue) {
      // Create issue first
      const newIssue = {
        zoneId: currentZoneId,
        zoneName: currentZone.name,
        checkId: check.id,
        checkText: check.text,
        section: check.section,
        tier: check.tier,
        amberEligible: check.amberEligible || false,
        amberIneligible: check.amberIneligible || false,
        roomId: isRoomBased ? resultsKey : null,
        roomName: isRoomBased ? currentRoom?.name : null,
        photos: [],
        notes: ''
      };
      addIssue(newIssue);
      issue = newIssue;
    }

    const issueId = currentIssues.find(i => i.checkId === check.id)?.id || issue.id;

    camera.openCamera((imageData) => {
      if (imageData && issueId) {
        const existingIssue = issues.find(i => i.id === issueId);
        if (existingIssue) {
          updateIssue(issueId, {
            photos: [...(existingIssue.photos || []), imageData]
          });
        }
      }
    });
  };

  const handleTakeExitPhoto = () => {
    const key = isRoomBased ? resultsKey : currentZoneId;
    camera.openCamera((imageData) => {
      if (imageData) {
        addExitPhoto(key, imageData);
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

  const handleIssueNoteChange = (issueId, note) => {
    updateIssue(issueId, { notes: note.slice(0, 200) });
  };

  const handleComplete = () => {
    // Save results
    if (isRoomBased) {
      recordZoneResults(currentZoneId, localResults, resultsKey);
    } else {
      recordZoneResults(currentZoneId, localResults);
    }

    // Create issues for any failed checks that don't have issues yet
    failedChecks.forEach(check => {
      const existingIssue = currentIssues.find(i => i.checkId === check.id);
      if (!existingIssue) {
        addIssue({
          zoneId: currentZoneId,
          zoneName: currentZone.name,
          checkId: check.id,
          checkText: check.text,
          section: check.section,
          tier: check.tier,
          amberEligible: check.amberEligible || false,
          amberIneligible: check.amberIneligible || false,
          roomId: isRoomBased ? resultsKey : null,
          roomName: isRoomBased ? currentRoom?.name : null,
          photos: [],
          notes: ''
        });
      }
    });

    // Move to next room or zone
    if (isRoomBased && currentRoomIndex < totalRooms - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
      setLocalResults({});
      window.scrollTo(0, 0);
    } else {
      // Calculate zone rating before moving on
      calculateAndSetZoneRating(currentZoneId);

      if (currentZoneIndex < totalZones - 1) {
        nextZone();
        setCurrentRoomIndex(0);
        setLocalResults({});
        window.scrollTo(0, 0);
      } else {
        // All zones complete
        navigate('/bg/summary');
      }
    }
  };

  const handleBack = () => {
    if (isRoomBased && currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1);
      setLocalResults({});
    } else if (currentZoneIndex > 0) {
      goToZone(currentZoneIndex - 1);
      // If going back to room-based zone, go to last room
      const prevZoneId = BG_ZONE_ORDER[currentZoneIndex - 1];
      const prevZone = BG_ZONES[prevZoneId];
      if (prevZone.isRoomBased) {
        const prevRooms = [...selectedRooms.classrooms, ...selectedRooms.bathrooms];
        setCurrentRoomIndex(prevRooms.length - 1);
      } else {
        setCurrentRoomIndex(0);
      }
    } else {
      navigate('/bg/setup');
    }
  };

  if (!currentZone || isObservationZone || isGovernanceZone) {
    return null;
  }

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
            ←
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {currentZone.name}
            </h1>
            {isRoomBased && currentRoom && (
              <p style={{ fontSize: '16px', margin: '4px 0 0 0', color: '#C2ECFD' }}>
                {currentRoom.type === 'classroom' ? '📚' : '🚽'} {currentRoom.name}
              </p>
            )}
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
              Zone {currentZoneIndex + 1} of {totalZones}
              {isRoomBased && ` • Room ${currentRoomIndex + 1} of ${totalRooms}`}
            </p>
          </div>
          <div style={{ width: '40px' }} />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', backgroundColor: '#e5e7eb' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#092849',
            width: `${((currentZoneIndex + 1) / totalZones) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
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
      </div>

      {/* Sections and Checks */}
      <div style={{ padding: '0 20px' }}>
        {currentZone.sections?.map((section, sectionIndex) => (
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
                backgroundColor: '#092849',
                color: '#fff',
                borderRadius: expandedSections[section.name] ? '12px 12px 0 0' : '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <span>{section.name}</span>
              <span style={{ transform: expandedSections[section.name] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {/* Section Checks */}
            {expandedSections[section.name] && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '0 0 12px 12px',
                border: '1px solid #e5e7eb',
                borderTop: 'none'
              }}>
                {section.checks.map((check, checkIndex) => {
                  const result = localResults[check.id];
                  const issue = currentIssues.find(i => i.checkId === check.id);

                  return (
                    <div key={check.id} style={{
                      padding: '16px',
                      borderBottom: checkIndex < section.checks.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      {/* Check Text */}
                      <div style={{ fontSize: '15px', marginBottom: '12px', color: '#333', lineHeight: '1.4' }}>
                        {check.text}
                        {check.tier === 1 && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            TIER 1
                          </span>
                        )}
                        {check.amberEligible && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            Amber OK
                          </span>
                        )}
                      </div>

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
                          ✓ Yes
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
                          ✗ No
                        </button>
                      </div>

                      {/* Issue Documentation (shown when NO is selected) */}
                      {result === false && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          border: '1px solid #fecaca'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#b91c1c', marginBottom: '8px' }}>
                            📸 Photo Required - Tier {check.tier} Issue
                          </div>

                          {/* Photo Grid */}
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
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Photo Button */}
                          <button
                            onClick={() => handleTakeIssuePhoto(check)}
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
                              gap: '8px',
                              marginBottom: '8px'
                            }}
                          >
                            <span>📷</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c' }}>
                              {issue?.photos?.length > 0 ? 'Add Another Photo' : 'Take Photo'}
                            </span>
                          </button>

                          {/* Notes */}
                          <textarea
                            value={issue?.notes || ''}
                            onChange={(e) => issue && handleIssueNoteChange(issue.id, e.target.value)}
                            placeholder="Describe the issue (optional)..."
                            maxLength={200}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '6px',
                              border: '1px solid #fca5a5',
                              fontSize: '14px',
                              resize: 'none',
                              minHeight: '50px',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Exit Photo for Green Zone */}
        {isComplete && isGreen && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '12px' }}>
              ✅ All checks passed - Exit Photo Required
            </div>

            {hasExitPhoto ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={exitPhotos[isRoomBased ? resultsKey : currentZoneId]}
                  alt="Exit photo"
                  style={{
                    width: '100%',
                    maxWidth: '200px',
                    borderRadius: '8px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Exit Photo ✓
                </div>
              </div>
            ) : (
              <button
                onClick={handleTakeExitPhoto}
                style={{
                  width: '100%',
                  padding: '20px',
                  border: '2px dashed #10b981',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '32px' }}>📸</span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#059669' }}>
                  Take Exit Photo
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Proof of presence for Green zone
                </span>
              </button>
            )}
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
            : needsExitPhoto
            ? 'Take Exit Photo to Continue'
            : !allIssuesHavePhotos
            ? 'Add Photos for All Issues'
            : isRoomBased && currentRoomIndex < totalRooms - 1
            ? `Next Room →`
            : currentZoneIndex < totalZones - 1
            ? `Next Zone →`
            : 'View Summary →'}
        </button>
      </div>
    </div>
  );
};
