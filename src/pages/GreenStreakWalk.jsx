import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GREEN_STREAK_METRICS } from '../data/greenStreakZones';
import { ChevronLeft, ChevronRight, Camera, X, MapPin } from 'lucide-react';

export const GreenStreakWalk = ({ greenStreakWalk, camera }) => {
  const navigate = useNavigate();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomInput, setRoomInput] = useState('');

  const currentStop = greenStreakWalk.getCurrentStop();
  const currentCheck = greenStreakWalk.getCurrentCheck();
  const progress = greenStreakWalk.getProgress();
  const metric = currentCheck ? GREEN_STREAK_METRICS[currentCheck.metric] : null;

  // Check if we need room selection for this stop
  useEffect(() => {
    if (currentStop?.requiresRoomSelection) {
      const existingSelection = greenStreakWalk.roomSelections[currentStop.id];
      if (!existingSelection && greenStreakWalk.currentCheckIndex === 0) {
        setShowRoomInput(true);
        setRoomInput('');
      }
    }
  }, [currentStop, greenStreakWalk.currentCheckIndex]);

  // Redirect if no walk in progress
  useEffect(() => {
    if (!greenStreakWalk.isInProgress) {
      navigate('/green-streak');
    }
  }, [greenStreakWalk.isInProgress, navigate]);

  if (!currentStop || !currentCheck) {
    return null;
  }

  const handleYes = () => {
    // If there was a previous "No" for this check, remove the issue
    greenStreakWalk.removeIssue(currentCheck.id);
    greenStreakWalk.recordCheckResult(currentCheck.id, true);

    // Check if walk is complete
    if (greenStreakWalk.isWalkComplete()) {
      navigate('/green-streak/summary');
    } else {
      greenStreakWalk.nextCheck();
    }
  };

  const handleNo = () => {
    // Open issue modal
    setCurrentIssue({
      checkId: currentCheck.id,
      question: currentCheck.question,
      metric: currentCheck.metric,
      metricName: metric?.name,
      stopId: currentStop.id,
      stopName: currentStop.name,
      lookingFor: currentCheck.lookingFor
    });
    setIssueDescription('');
    setIssuePhotos([]);
    setShowIssueModal(true);
  };

  const handleSubmitIssue = () => {
    if (!issueDescription.trim()) {
      alert('Please describe the issue');
      return;
    }

    // Record the No answer with issue data
    greenStreakWalk.recordCheckResult(currentCheck.id, false);

    // Add the issue
    greenStreakWalk.addIssue({
      ...currentIssue,
      description: issueDescription.trim(),
      photos: issuePhotos,
      roomSelection: greenStreakWalk.roomSelections[currentStop.id] || null
    });

    setShowIssueModal(false);
    setCurrentIssue(null);

    // Check if walk is complete
    if (greenStreakWalk.isWalkComplete()) {
      navigate('/green-streak/summary');
    } else {
      greenStreakWalk.nextCheck();
    }
  };

  const handleAddPhoto = async () => {
    try {
      const photoData = await camera.openCamera(`Issue photo`);
      if (photoData) {
        setIssuePhotos(prev => [...prev, photoData]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleRemovePhoto = (index) => {
    setIssuePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomSubmit = () => {
    if (!roomInput.trim()) {
      alert('Please enter the room/location you are checking');
      return;
    }
    greenStreakWalk.setRoomSelection(currentStop.id, roomInput.trim());
    setShowRoomInput(false);
  };

  const handleSkip = () => {
    // Skip optional checks
    greenStreakWalk.nextCheck();
  };

  // Room selection modal
  if (showRoomInput) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '20px',
          color: '#fff'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
            Stop {currentStop.order}: {currentStop.name}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            Which {currentStop.id === 'learning' ? 'room' : 'restroom'} are you checking?
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {currentStop.rotationNote && (
            <div style={{
              backgroundColor: 'rgba(194, 236, 253, 0.4)',
              border: '1px solid #47C4E6',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              <strong>Tip:</strong> {currentStop.rotationNote}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              {currentStop.id === 'learning' ? 'Room Name/Number' : 'Restroom Location'}
            </label>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder={currentStop.id === 'learning' ? 'e.g., Room 101, Pod A' : 'e.g., Main hallway, Near gym'}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '17px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <button
            onClick={handleRoomSubmit}
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Progress Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '16px 20px'
      }}>
        {/* Progress bar */}
        <div style={{
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          marginBottom: '12px'
        }}>
          <div style={{
            height: '100%',
            width: `${progress.percentage}%`,
            backgroundColor: '#fff',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Stop {progress.currentStop} of {progress.totalStops}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>
              {currentStop.name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Check</div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>
              {progress.currentCheckInStop}/{progress.totalChecksInStop}
            </div>
          </div>
        </div>

        {/* Room selection display */}
        {currentStop.requiresRoomSelection && greenStreakWalk.roomSelections[currentStop.id] && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <MapPin size={14} />
            Checking: {greenStreakWalk.roomSelections[currentStop.id]}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {/* Metric Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#fff',
          padding: '8px 14px',
          borderRadius: '20px',
          alignSelf: 'flex-start',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: metric?.color || '#666'
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
            {metric?.name || currentCheck.metric}
          </span>
        </div>

        {/* Question */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#092849', lineHeight: 1.4 }}>
            {currentCheck.question}
          </div>

          {currentCheck.lookingFor && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <strong>Looking for:</strong> {currentCheck.lookingFor}
            </div>
          )}

          {currentCheck.optional && (
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#f59e0b',
              fontStyle: 'italic'
            }}>
              Optional: {currentCheck.optionalNote}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Answer Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={handleYes}
            style={{
              flex: 1,
              backgroundColor: '#10b981',
              color: '#fff',
              padding: '20px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '28px' }}>Yes</span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>All good</span>
          </button>

          <button
            onClick={handleNo}
            style={{
              flex: 1,
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '20px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '28px' }}>No</span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>Issue found</span>
          </button>
        </div>

        {/* Skip for optional */}
        {currentCheck.optional && (
          <button
            onClick={handleSkip}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#666',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            Skip (not applicable)
          </button>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => greenStreakWalk.prevCheck()}
            disabled={progress.currentStop === 1 && progress.currentCheckInStop === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: progress.currentStop === 1 && progress.currentCheckInStop === 1 ? '#ccc' : '#666',
              cursor: progress.currentStop === 1 && progress.currentCheckInStop === 1 ? 'not-allowed' : 'pointer',
              fontSize: '15px'
            }}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <button
            onClick={() => {
              if (confirm('Exit without saving? Your progress will be lost.')) {
                greenStreakWalk.resetWalk();
                navigate('/');
              }
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Exit Walk
          </button>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 100
        }}>
          <div style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '24px 24px 0 0',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                  Issue Found
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  {currentIssue?.metricName} - {currentIssue?.stopName}
                </div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            {/* Question Reference */}
            <div style={{
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#991b1b' }}>
                {currentIssue?.question}
              </div>
            </div>

            {/* Description Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                What's the issue? *
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe what you found..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            {/* Photo Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Add Photo (optional)
              </label>

              {/* Photo previews */}
              {issuePhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {issuePhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={photo.url || photo}
                        alt={`Issue photo ${idx + 1}`}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddPhoto}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#f3f4f6',
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '15px'
                }}
              >
                <Camera size={20} />
                {issuePhotos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
              </button>
            </div>

            {/* Escalation Info */}
            <div style={{
              backgroundColor: '#fffbeb',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '13px', color: '#92400e' }}>
                <strong>Escalate to:</strong> {metric?.escalation || 'VP of Ops'}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitIssue}
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Log Issue & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
