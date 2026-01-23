import { useNavigate } from 'react-router-dom';

export const AuditZone = ({ audit }) => {
  const navigate = useNavigate();
  const {
    currentZoneIndex,
    currentZone,
    currentZoneId,
    allZones,
    zoneResults,
    setResponse,
    isZoneComplete
  } = audit;

  const results = zoneResults[currentZoneId] || {};
  const answeredCount = Object.keys(results).length;
  const totalQuestions = currentZone?.cleanliness?.length || 0;
  const complete = isZoneComplete(currentZoneId);

  const handleComplete = () => {
    if (complete) {
      navigate('/audit/condition');
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
          disabled={!complete}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: complete ? 'pointer' : 'not-allowed',
            backgroundColor: complete ? '#092849' : '#d1d5db',
            color: complete ? '#fff' : '#9ca3af'
          }}
        >
          {complete
            ? 'Complete Zone →'
            : `Answer all (${answeredCount}/${totalQuestions})`}
        </button>
      </div>
    </div>
  );
};
