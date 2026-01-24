import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { supabase } from '../supabase/config';
import { ZONES, RESTROOM_TEMPLATE } from '../data/zones';

// Helper to get zone config, handling dynamic restroom zones
const getZoneConfig = (zoneId) => {
  if (ZONES[zoneId]) {
    return ZONES[zoneId];
  }
  // Handle dynamic restroom zones (restroom_1, restroom_2, etc.)
  if (zoneId.startsWith('restroom_')) {
    const num = zoneId.replace('restroom_', '');
    return {
      ...RESTROOM_TEMPLATE,
      name: `Restroom ${num}`
    };
  }
  return null;
};

export const AuditDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [zonePhotos, setZonePhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudit = async () => {
      try {
        // Load audit data
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Debug: log raw data to check structure
        console.log('Raw audit data:', {
          zone_results: data.zone_results,
          condition_alert_details: data.condition_alert_details
        });

        // Debug: Check condition alert photos
        if (data.condition_alert_details) {
          data.condition_alert_details.forEach((alert, idx) => {
            console.log(`Condition Alert ${idx}:`, {
              zoneId: alert.zoneId,
              hasIssue: alert.hasIssue,
              hasPhoto: !!alert.photo,
              photoUrl: alert.photo,
              note: alert.note
            });
          });
        }

        // Map snake_case to camelCase
        setAudit({
          id: data.id,
          date: data.date,
          time: data.time,
          campus: data.campus,
          auditor: data.auditor,
          auditorEmail: data.auditor_email,
          status: data.status,
          defects: data.defects,
          zones: data.zones,
          duration: data.duration,
          tourReady: data.tour_ready,
          conditionAlerts: data.condition_alerts_count,
          zoneResults: data.zone_results || {},
          conditionAlertDetails: data.condition_alert_details || [],
          campusData: data.campus_data,
          createdAt: data.created_at
        });

        // Load zone photos for this audit
        const { data: photos, error: photosError } = await supabase
          .from('zone_photos')
          .select('*')
          .eq('audit_id', id)
          .order('created_at', { ascending: true });

        if (!photosError && photos) {
          setZonePhotos(photos);
        }
      } catch (error) {
        console.error('Error loading audit:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAudit();
  }, [id]);

  const statusColors = {
    GREEN: { bg: '#dcfce7', text: '#166534', emoji: '🟢' },
    AMBER: { bg: '#fef3c7', text: '#92400e', emoji: '🟡' },
    RED: { bg: '#fee2e2', text: '#b91c1c', emoji: '🔴' }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="Audit Report" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="Audit Report" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Audit not found</div>
      </div>
    );
  }

  const statusStyle = statusColors[audit.status] || statusColors.RED;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header title="Audit Report" onBack={() => navigate(-1)} />

      <div style={{ padding: '20px' }}>
        {/* Status Banner */}
        <div style={{
          backgroundColor: statusStyle.bg,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>{statusStyle.emoji}</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: statusStyle.text }}>
            {audit.status}
          </div>
          <div style={{ fontSize: '17px', color: statusStyle.text, marginTop: '8px' }}>
            {audit.defects} defect{audit.defects !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Audit Info Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
            Audit Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Campus</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{audit.campus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Auditor</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{audit.auditor}</span>
            </div>
            {audit.auditorEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Email</span>
                <span style={{ fontWeight: '600', color: '#092849' }}>{audit.auditorEmail}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Date</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{audit.date} at {audit.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Duration</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{audit.duration} min</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Zones Checked</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{audit.zones}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Tour Ready</span>
              <span style={{ fontWeight: '600', color: audit.tourReady ? '#166534' : '#b91c1c' }}>
                {audit.tourReady ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Zone Results */}
        {audit.zoneResults && Object.keys(audit.zoneResults).length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
              Zone Results
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(audit.zoneResults).map(([zoneId, results]) => {
                const zone = getZoneConfig(zoneId);
                const defectCount = Object.values(results).filter(v => v === 'no').length;
                const totalQuestions = Object.keys(results).length;

                return (
                  <div
                    key={zoneId}
                    style={{
                      padding: '14px',
                      backgroundColor: defectCount > 0 ? '#fee2e2' : '#dcfce7',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#092849' }}>
                        {zone?.name || zoneId}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: defectCount > 0 ? '#b91c1c' : '#166534'
                      }}>
                        {defectCount > 0 ? `${defectCount} defect${defectCount > 1 ? 's' : ''}` : 'Passed'}
                      </span>
                    </div>

                    {defectCount > 0 && (
                      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        {Object.entries(results)
                          .filter(([, value]) => value === 'no')
                          .map(([qIndex]) => {
                            const questionText = zone?.cleanliness?.[parseInt(qIndex)] || `Question ${parseInt(qIndex) + 1}`;
                            return (
                              <div key={qIndex} style={{ marginTop: '4px', color: '#b91c1c' }}>
                                • {questionText}
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition Alerts */}
        {audit.conditionAlertDetails && audit.conditionAlertDetails.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
              Condition Alerts ({audit.conditionAlertDetails.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {audit.conditionAlertDetails.map((alert, idx) => {
                const zone = getZoneConfig(alert.zoneId);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
                      {zone?.name || alert.zoneId}
                    </div>
                    {alert.note && (
                      <div style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>
                        {alert.note}
                      </div>
                    )}
                    {/* Support both old single photo and new multiple photos format */}
                    {(alert.photos?.length > 0 || alert.photo) ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: (alert.photos?.length || 1) > 1 ? 'repeat(2, 1fr)' : '1fr',
                        gap: '8px'
                      }}>
                        {(alert.photos || [alert.photo]).filter(Boolean).map((photo, photoIdx) => (
                          <img
                            key={photoIdx}
                            src={photo}
                            alt={`Condition alert ${photoIdx + 1}`}
                            style={{
                              width: '100%',
                              maxHeight: (alert.photos?.length || 1) > 1 ? '150px' : '300px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              backgroundColor: '#f3f4f6'
                            }}
                            onError={(e) => {
                              console.error('Failed to load condition alert photo:', photo);
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#9ca3af',
                        textAlign: 'center'
                      }}>
                        No photo attached
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Zone Photos */}
        {zonePhotos.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
              Zone Photos ({zonePhotos.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Group photos by zone */}
              {Object.entries(
                zonePhotos.reduce((acc, photo) => {
                  const key = photo.zone_id || 'unknown';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(photo);
                  return acc;
                }, {})
              ).map(([zoneId, photos]) => {
                const zone = getZoneConfig(zoneId);
                return (
                  <div
                    key={zoneId}
                    style={{
                      padding: '14px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '12px' }}>
                      {zone?.name || photos[0]?.zone_name || zoneId}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px'
                    }}>
                      {photos.map((photo, idx) => (
                        <img
                          key={photo.id || idx}
                          src={photo.photo_url}
                          alt={`Zone photo ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
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
