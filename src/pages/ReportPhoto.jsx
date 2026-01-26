import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const ReportPhoto = ({ report, camera }) => {
  const navigate = useNavigate();
  const { campus, photos, addPhoto } = report;

  const handleAddMorePhotos = () => {
    camera.openCamera((imageData) => {
      addPhoto(imageData);
    }, 'Add Another Photo');
  };

  const handleRemovePhoto = (index) => {
    report.removePhoto(index);
  };

  const handleNo = () => {
    navigate('/report/description');
  };

  const handleRetakeFirst = () => {
    report.setPhotos([]);
    camera.openCamera((imageData) => {
      report.addPhoto(imageData);
    }, 'Capture Issue');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="Photos"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {photos.length > 0 ? (
          <>
            {/* Photo Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: photos.length === 1 ? '1fr' : '1fr 1fr',
              gap: '12px'
            }}>
              {photos.map((photo, index) => (
                <div key={index} style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={photo}
                    alt={`Issue photo ${index + 1}`}
                    style={{
                      width: '100%',
                      aspectRatio: photos.length === 1 ? 'auto' : '1',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  {photos.length > 1 && (
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Photo count indicator */}
            <div style={{
              textAlign: 'center',
              fontSize: '15px',
              color: '#666'
            }}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
            </div>

            {/* Question Card */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '24px'
              }}>
                Do you need to add more photos?
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleAddMorePhotos}
                  style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '17px',
                    border: '2px solid #e5e7eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📷</span>
                  Yes
                </button>
                <button
                  onClick={handleNo}
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
                  No, Continue →
                </button>
              </div>
            </div>

            {/* Retake option */}
            <button
              onClick={handleRetakeFirst}
              style={{
                backgroundColor: 'transparent',
                color: '#666',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Start over with new photo
            </button>
          </>
        ) : (
          /* No photos state */
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
              onClick={handleRetakeFirst}
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
