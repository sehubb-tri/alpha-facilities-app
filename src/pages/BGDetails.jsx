import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { getBGWalkthroughById } from '../supabase/services';

export const BGDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [walkthrough, setWalkthrough] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalkthrough = async () => {
      try {
        const data = await getBGWalkthroughById(id);
        setWalkthrough(data);
      } catch (error) {
        console.error('Error loading B&G walkthrough:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWalkthrough();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="B&G Walkthrough" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  if (!walkthrough) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="B&G Walkthrough" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Walkthrough not found</div>
      </div>
    );
  }

  const isPassing = walkthrough.campusRating === 'PASS';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header title="B&G Walkthrough" onBack={() => navigate(-1)} />

      <div style={{ padding: '20px' }}>
        {/* Status Banner */}
        <div style={{
          backgroundColor: isPassing ? '#dcfce7' : '#fee2e2',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>
            {isPassing ? '✅' : '⚠️'}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: isPassing ? '#166534' : '#b91c1c'
          }}>
            {walkthrough.campusRating || 'N/A'}
          </div>
          <div style={{
            fontSize: '17px',
            color: isPassing ? '#166534' : '#b91c1c',
            marginTop: '8px'
          }}>
            {walkthrough.totalIssues || 0} issue{walkthrough.totalIssues !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Walkthrough Info Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
            Walkthrough Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Campus</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{walkthrough.campus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Auditor</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{walkthrough.auditor}</span>
            </div>
            {walkthrough.auditorEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Email</span>
                <span style={{ fontWeight: '600', color: '#092849' }}>{walkthrough.auditorEmail}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Date</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{walkthrough.date} at {walkthrough.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Duration</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{walkthrough.duration || 'N/A'} min</span>
            </div>
          </div>
        </div>

        {/* Zone Summary */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
            Zone Summary
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#166534' }}>
                {walkthrough.greenZones || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#166534' }}>Green</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                {walkthrough.amberZones || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#92400e' }}>Amber</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#b91c1c' }}>
                {walkthrough.redZones || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#b91c1c' }}>Red</div>
            </div>
          </div>

          {/* Zone Ratings */}
          {walkthrough.zoneRatings && Object.keys(walkthrough.zoneRatings).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(walkthrough.zoneRatings).map(([zoneId, rating]) => (
                <div
                  key={zoneId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: rating === 'GREEN' ? '#dcfce7' : rating === 'AMBER' ? '#fef3c7' : '#fee2e2',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ fontWeight: '500', color: '#092849' }}>{zoneId}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: rating === 'GREEN' ? '#166534' : rating === 'AMBER' ? '#92400e' : '#b91c1c'
                  }}>
                    {rating}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issues */}
        {walkthrough.issues && walkthrough.issues.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
              Issues ({walkthrough.issues.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {walkthrough.issues.map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    backgroundColor: issue.tier === 1 ? '#fee2e2' : issue.tier === 2 ? '#fef3c7' : '#f3f4f6',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#092849' }}>
                      {issue.zoneName || issue.zoneId}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: issue.tier === 1 ? '#b91c1c' : issue.tier === 2 ? '#92400e' : '#666',
                      color: '#fff',
                      fontWeight: '600'
                    }}>
                      Tier {issue.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', color: '#333', marginBottom: '8px' }}>
                    {issue.checkText}
                  </div>
                  {issue.notes && (
                    <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                      Note: {issue.notes}
                    </div>
                  )}
                  {issue.photos && issue.photos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: issue.photos.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      {issue.photos.filter(Boolean).map((photo, photoIdx) => (
                        <img
                          key={photoIdx}
                          src={photo}
                          alt={`Issue photo ${photoIdx + 1}`}
                          style={{
                            width: '100%',
                            maxHeight: issue.photos.length > 1 ? '150px' : '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {walkthrough.observations && walkthrough.observations.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
              Observations ({walkthrough.observations.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {walkthrough.observations.map((obs, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#092849' }}>
                      {obs.categoryName || 'Observation'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#0369a1',
                      color: '#fff'
                    }}>
                      {obs.pillar || 'General'}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', color: '#333' }}>
                    {obs.description}
                  </div>
                  {obs.photos && obs.photos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: obs.photos.length > 1 ? 'repeat(2, 1fr)' : '1fr',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      {obs.photos.filter(Boolean).map((photo, photoIdx) => (
                        <img
                          key={photoIdx}
                          src={photo}
                          alt={`Observation photo ${photoIdx + 1}`}
                          style={{
                            width: '100%',
                            maxHeight: obs.photos.length > 1 ? '150px' : '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '100%',
            backgroundColor: '#092849',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Back to History
        </button>
      </div>
    </div>
  );
};
