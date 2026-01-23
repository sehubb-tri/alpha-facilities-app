import { useNavigate } from 'react-router-dom';

export const AuditCondition = ({ audit, camera }) => {
  const navigate = useNavigate();
  const {
    currentZoneIndex,
    currentZone,
    currentZoneId,
    allZones,
    setConditionAlert,
    updateConditionAlertPhoto,
    updateConditionAlertNote,
    canCompleteCondition,
    getConditionAlert,
    setCurrentZoneIndex
  } = audit;

  const alert = getConditionAlert(currentZoneId);
  const canContinue = canCompleteCondition(currentZoneId);

  const handleTakePhoto = () => {
    camera.openCamera((imageData) => {
      updateConditionAlertPhoto(currentZoneId, imageData);
    }, 'B&G Issue');
  };

  const handleFinish = () => {
    if (!canContinue) return;

    if (currentZoneIndex < allZones.length - 1) {
      setCurrentZoneIndex(currentZoneIndex + 1);
      navigate('/audit/zone');
    } else {
      navigate('/audit/overview');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2B57D0', color: '#fff', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/audit/zone')}
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
              color: '#fff',
              marginRight: '14px'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Building Check</h1>
            <p style={{ fontSize: '15px', color: '#C2ECFD', margin: '4px 0 0 0' }}>{currentZone?.name}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main Question Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#092849' }}>
            Any building issues to flag for B&G?
          </div>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px' }}>
            Examples: holes in walls, broken fixtures, damaged flooring, water damage
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setConditionAlert(currentZoneId, false)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: alert?.hasIssue === false ? '2px solid #47C4E6' : '2px solid #e5e7eb',
                backgroundColor: alert?.hasIssue === false ? 'rgba(194, 236, 253, 0.3)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '14px' }}>✓</span>
              <div style={{ fontWeight: '600', fontSize: '17px' }}>No issues</div>
            </button>

            <button
              onClick={() => setConditionAlert(currentZoneId, true)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: alert?.hasIssue === true ? '2px solid #2B57D0' : '2px solid #e5e7eb',
                backgroundColor: alert?.hasIssue === true ? 'rgba(194, 236, 253, 0.3)' : '#fff',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '14px' }}>🔧</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '17px' }}>Yes — flag for B&G</div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                  Photo + description required
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Photo and Note Section */}
        {alert?.hasIssue === true && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              {alert.photo ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={alert.photo}
                    alt="Issue"
                    style={{ width: '100%', borderRadius: '12px' }}
                  />
                  <button
                    onClick={handleTakePhoto}
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: '#fff',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Retake
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTakePhoto}
                  style={{
                    width: '100%',
                    border: '2px dashed #ccc',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                  <div style={{ fontWeight: '600', fontSize: '17px' }}>Tap to Take Photo</div>
                </button>
              )}
            </div>

            <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
              Describe the issue *
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g., Hole in drywall near door"
              style={{
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '14px 16px',
                fontSize: '17px',
                boxSizing: 'border-box'
              }}
              value={alert.note || ''}
              onChange={(e) =>
                updateConditionAlertNote(currentZoneId, e.target.value)
              }
            />
            <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px', textAlign: 'right' }}>
              {(alert.note || '').length}/100
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div style={{
          backgroundColor: 'rgba(194, 236, 253, 0.3)',
          border: '1px solid #47C4E6',
          borderRadius: '12px',
          padding: '14px 16px'
        }}>
          <div style={{ fontSize: '15px', color: '#141685' }}>
            B&G alerts are separate from cleanliness and do NOT affect your score.
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
          onClick={handleFinish}
          disabled={!canContinue}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            backgroundColor: canContinue ? '#092849' : '#d1d5db',
            color: canContinue ? '#fff' : '#9ca3af'
          }}
        >
          {currentZoneIndex < allZones.length - 1
            ? 'Next Zone →'
            : 'Finish Zones →'}
        </button>
      </div>
    </div>
  );
};
