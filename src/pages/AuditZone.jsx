import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

export const AuditZone = ({ audit, camera }) => {
  const navigate = useNavigate();
  const { t, getChecklist, getZoneName } = useI18n();

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
    addConditionAlertPhoto,
    removeConditionAlertPhoto
  } = audit;

  const results = zoneResults[currentZoneId] || {};
  const answeredCount = Object.keys(results).length;

  // Get translated checklist questions for current zone
  const zoneType = currentZone?.type === 'restroom' ? 'restroom' : currentZoneId;
  const translatedQuestions = getChecklist(zoneType);
  const totalQuestions = translatedQuestions?.length || currentZone?.cleanliness?.length || 0;
  const complete = isZoneComplete(currentZoneId);

  // B&G condition alert state
  const alert = getConditionAlert(currentZoneId);
  const hasBGSelection = alert?.hasIssue !== undefined;
  const alertPhotos = alert?.photos || [];
  // B&G is complete if: no issue, OR has issue with at least one photo AND note
  const bgComplete = alert?.hasIssue === false || (alert?.hasIssue === true && alertPhotos.length > 0 && alert?.note?.length > 0);

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

  // Handle taking photo for B&G condition alert (supports multiple)
  const handleTakeConditionPhoto = () => {
    const zoneIdAtCapture = currentZoneId;
    console.log('[AuditZone] Taking condition photo for zone:', zoneIdAtCapture);

    camera.openCamera((imageData) => {
      console.log('[AuditZone] Condition photo received, length:', imageData?.length);
      if (imageData) {
        addConditionAlertPhoto(zoneIdAtCapture, imageData);
      }
    });
  };

  // Handle removing a condition alert photo
  const handleRemoveConditionPhoto = (photoIndex) => {
    removeConditionAlertPhoto(currentZoneId, photoIndex);
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
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {currentZone?.type === 'restroom' ? currentZone?.name : getZoneName(currentZoneId)}
            </h1>
            <p style={{ fontSize: '15px', opacity: 0.8, margin: '4px 0 0 0' }}>
              {t('audit.walkthrough.zone')} {currentZoneIndex + 1} {t('audit.walkthrough.of')} {allZones.length}
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
            ⚠️ {t('audit.bg.anyDefectRed')}
          </div>
        </div>
      )}

      {/* Questions */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {translatedQuestions?.map((question, idx) => (
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
                  ✓ {t('common.yes')}
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
                  ✗ {t('common.no')}
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
            {t('audit.bg.title')}
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

          {/* Photo and text input when Yes is selected */}
          {alert?.hasIssue === true && (
            <div style={{ marginTop: '12px' }}>
              {/* Condition Alert Photos - Multiple */}
              <div style={{ marginBottom: '12px' }}>
                {/* Photo Grid */}
                {alertPhotos.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    {alertPhotos.map((photo, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={photo}
                          alt={`B&G Issue ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          onClick={() => handleRemoveConditionPhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '4px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Photo Button */}
                <button
                  onClick={handleTakeConditionPhoto}
                  style={{
                    width: '100%',
                    padding: alertPhotos.length > 0 ? '12px' : '20px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: alertPhotos.length > 0 ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: alertPhotos.length > 0 ? '20px' : '28px' }}>📷</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {alertPhotos.length > 0 ? t('audit.bg.addAnotherPhoto') : t('audit.bg.takePhotoOfIssue')}
                  </span>
                  {alertPhotos.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {t('audit.bg.requiredForAlerts')}
                    </span>
                  )}
                </button>
              </div>

              {/* Description textarea */}
              <textarea
                value={alert?.note || ''}
                onChange={handleNoteChange}
                placeholder={t('audit.bg.describeIssue')}
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
            ? `${t('audit.bg.answerAll')} (${answeredCount}/${totalQuestions})`
            : !hasBGSelection
            ? t('audit.bg.selectBGStatus')
            : alert?.hasIssue && alertPhotos.length === 0
            ? t('audit.bg.addBGPhoto')
            : alert?.hasIssue && !alert?.note?.length
            ? t('audit.bg.describeBGIssue')
            : `${t('audit.bg.completeZone')} →`}
        </button>
      </div>
    </div>
  );
};
