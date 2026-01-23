import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const ReportPhoto = ({ report, camera }) => {
  const navigate = useNavigate();
  const { campus, photo } = report;

  const handleRetake = () => {
    camera.openCamera((imageData) => {
      report.setPhoto(imageData);
    }, 'Capture Issue');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="Review Photo"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {photo ? (
          <>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <img
                src={photo}
                alt="Issue photo"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRetake}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '17px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔄 Retake
              </button>
              <button
                onClick={() => navigate('/report/details')}
                style={{
                  flex: 1,
                  backgroundColor: '#092849',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '17px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Continue →
              </button>
            </div>
          </>
        ) : (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>No photo captured</p>
            <button
              onClick={handleRetake}
              style={{
                backgroundColor: '#092849',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '17px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Take Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
