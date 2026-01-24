import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoCaptureModal } from '../components/PhotoCaptureModal';
import { saveZonePhotos } from '../supabase/services';

export const AuditZone = ({ audit, camera }) => {
  const navigate = useNavigate();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);

  const {
    currentZoneIndex,
    currentZone,
    currentZoneId,
    allZones,
    zoneResults,
    setResponse,
    isZoneComplete,
    setConditionAlert,
    getConditionAlert,
    setCurrentZoneIndex,
    campus,
    auditorName,
    addZonePhotos,
    getZonePhotos
  } = audit;

  // Get photos already taken for this zone
  const currentZonePhotos = getZonePhotos(currentZoneId);

  const results = zoneResults[currentZoneId] || {};
  const answeredCount = Object.keys(results).length;
  const totalQuestions = currentZone?.cleanliness?.length || 0;
  const complete = isZoneComplete(currentZoneId);

  // B&G condition alert state
  const alert = getConditionAlert(currentZoneId);
  const hasBGSelection = alert?.hasIssue !== undefined;
  const bgComplete = alert?.hasIssue === false || (alert?.hasIssue === true && alert?.note?.length > 0);

  const handleComplete = () => {
    if (complete && bgComplete) {
      // Skip the condition page, go directly to next zone or tour-ready
      if (currentZoneIndex < allZones.length - 1) {
        setCurrentZoneIndex(currentZoneIndex + 1);
        window.scrollTo(0, 0);
        navigate('/audit/zone');
      } else {
        window.scrollTo(0, 0);
        navigate('/audit/tour-ready');
      }
    }
  };

  const handleNoteChange = (e) => {
    const note = e.target.value.slice(0, 100);
    audit.updateConditionAlertNote(currentZoneId, note);
  };

  const handleReportIssue = () => {
    // Open the photo capture modal instead of navigating away
    setShowPhotoModal(true);
  };

  const handleSavePhotos = async (photos) => {
    setSavingPhotos(true);
    try {
      // Save photos to database with zone and campus tagging
      await saveZonePhotos({
        photos,
        campus: campus?.name || '',
        zoneId: currentZoneId,
        zoneName: currentZone?.name || '',
        auditor: auditorName,
        campusData: campus
      });

      // Also store in local state for the audit
      addZonePhotos(currentZoneId, photos);
    } catch (error) {
      console.error('Error saving photos:', error);
      throw error;
    } finally {
      setSavingPhotos(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/audit/overview')}
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
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{currentZone?.name}</h1>
            <p style={{ fontSize: '15px', opacity: 0.8, margin: '4px 0 0 0' }}>
              Zone {currentZoneIndex + 1} of {allZones.length}
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
            width: `${((currentZoneIndex + 1) / allZones.length) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Warning Banner */}
      {!currentZone?.amberEligible && (
        <div style={{
          backgroundColor: 'rgba(194, 236, 253, 0.5)',
          borderLeft: '4px solid #2B57D0',
          padding: '14px 16px',
          margin: '16px 20px',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: '600', color: '#141685', fontSize: '15px' }}>
            ⚠️ Any defect = RED status
          </div>
        </div>
      )}

      {/* Questions */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {currentZone?.cleanliness?.map((question, idx) => (
            <div key={idx} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '14px', color: '#333', lineHeight: '1.4' }}>
                {idx + 1}. {question}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setResponse(currentZoneId, idx, 'yes')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: results[idx] === 'yes' ? '#47C4E6' : '#f3f4f6',
                    color: results[idx] === 'yes' ? '#fff' : '#333'
                  }}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setResponse(currentZoneId, idx, 'no')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: results[idx] === 'no' ? '#141685' : '#f3f4f6',
                    color: results[idx] === 'no' ? '#fff' : '#333'
                  }}
                >
                  ✗ No
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* B&G Question - Inline */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginTop: '20px',
          borderLeft: '4px solid #2B57D0'
        }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            Any building issues to flag for B&G?
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setConditionAlert(currentZoneId, false)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: alert?.hasIssue === false ? '#47C4E6' : '#f3f4f6',
                color: alert?.hasIssue === false ? '#fff' : '#333'
              }}
            >
              ✓ No
            </button>
            <button
              onClick={() => setConditionAlert(currentZoneId, true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: alert?.hasIssue === true ? '#2B57D0' : '#f3f4f6',
                color: alert?.hasIssue === true ? '#fff' : '#333'
              }}
            >
              🔧 Yes
            </button>
          </div>

          {/* Text input when Yes is selected */}
          {alert?.hasIssue === true && (
            <div style={{ marginTop: '12px' }}>
              <textarea
                value={alert?.note || ''}
                onChange={handleNoteChange}
                placeholder="Describe the issue (required)..."
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  resize: 'none',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'right',
                marginTop: '4px'
              }}>
                {alert?.note?.length || 0}/100
              </div>
            </div>
          )}

          {/* Report with Photo Button */}
          <button
            onClick={handleReportIssue}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '14px 20px',
              backgroundColor: currentZonePhotos.length > 0 ? '#1a5f2a' : '#2B57D0',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            📸 {currentZonePhotos.length > 0 ? `${currentZonePhotos.length} Photo${currentZonePhotos.length !== 1 ? 's' : ''} Added` : 'Report with Photo'}
          </button>
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
          onClick={handleComplete}
          disabled={!complete || !bgComplete}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: (complete && bgComplete) ? 'pointer' : 'not-allowed',
            backgroundColor: (complete && bgComplete) ? '#092849' : '#d1d5db',
            color: (complete && bgComplete) ? '#fff' : '#9ca3af'
          }}
        >
          {!complete
            ? `Answer all (${answeredCount}/${totalQuestions})`
            : !hasBGSelection
            ? 'Select B&G status'
            : alert?.hasIssue && !alert?.note?.length
            ? 'Describe B&G issue'
            : 'Complete Zone →'}
        </button>
      </div>

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSave={handleSavePhotos}
        zoneName={currentZone?.name || ''}
        campusName={campus?.name || ''}
        maxPhotos={5}
      />
    </div>
  );
};
