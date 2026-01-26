import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const ReportDescription = ({ report }) => {
  const navigate = useNavigate();
  const { campus, photos, description, location, setDescription, setLocation } = report;

  const canContinue = description.trim() && location.trim();

  const handleContinue = () => {
    if (canContinue) {
      navigate('/report/emergency');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title="Describe the Problem"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report/photo')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              />
            ))}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#666',
              paddingLeft: '8px'
            }}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Description Input */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
          }}>
            What's the problem?
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you see or what needs attention..."
            rows={4}
            style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fafafa',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Location Input */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
          }}>
            Where is it located?
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., 2nd floor restroom, Room 204, Main lobby"
            style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fafafa'
            }}
          />
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
          onClick={handleContinue}
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
          Continue →
        </button>
      </div>
    </div>
  );
};
