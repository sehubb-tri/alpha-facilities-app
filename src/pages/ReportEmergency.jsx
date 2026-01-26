import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { saveReport } from '../supabase/services';

export const ReportEmergency = ({ report }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { campus, photos, description, location, setIsEmergency } = report;

  const handleSubmit = async (emergency) => {
    setIsEmergency(emergency);
    setSubmitting(true);

    try {
      await saveReport({
        timestamp: new Date().toLocaleString(),
        campus: campus?.name || '',
        photo: photos[0] || null, // Primary photo
        photos: photos, // All photos
        category: 'other', // Generic category for manual reports
        location,
        note: description,
        urgent: emergency,
        team: emergency ? 'Facilities Manager' : 'Facilities',
        status: 'open',
        campusData: campus,
        isEmergency: emergency
      });
      navigate('/report/complete');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="One Last Question"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report/description')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Summary Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {photos[0] && (
              <img
                src={photos[0]}
                alt="Issue"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '15px',
                color: '#333',
                fontWeight: '500',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {description}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                📍 {location}
              </div>
              {photos.length > 1 && (
                <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                  +{photos.length - 1} more photo{photos.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Question */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
          <div style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '8px'
          }}>
            Is this an emergency?
          </div>
          <div style={{
            fontSize: '15px',
            color: '#666',
            marginBottom: '28px'
          }}>
            Emergencies include safety hazards, flooding, or anything requiring immediate attention
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: submitting ? '#fca5a5' : '#dc2626',
                color: '#fff',
                padding: '18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '18px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '22px' }}>🚨</span>
              {submitting ? 'Submitting...' : 'Yes, Emergency'}
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: submitting ? '#d1d5db' : '#092849',
                color: '#fff',
                padding: '18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '18px',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'No, Not an Emergency'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
