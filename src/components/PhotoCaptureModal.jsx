import { useState, useRef, useCallback } from 'react';

export const PhotoCaptureModal = ({
  isOpen,
  onClose,
  onSave,
  zoneName,
  campusName,
  maxPhotos = 5
}) => {
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (photos.length >= maxPhotos) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => {
          if (prev.length >= maxPhotos) return prev;
          return [...prev, event.target.result];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photos.length, maxPhotos]);

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (photos.length === 0) return;
    setSaving(true);
    try {
      await onSave(photos);
      setPhotos([]);
      onClose();
    } catch (error) {
      console.error('Error saving photos:', error);
      alert('Failed to save photos. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setPhotos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hidden file input for camera - photo mode, not video */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#092849',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleClose}
          style={{
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
            fontSize: '20px'
          }}
        >
          ✕
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Report with Photo</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>{zoneName} • {campusName}</div>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      {/* Photo counter */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#141685',
        color: '#fff',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        📷 {photos.length} of {maxPhotos} photos taken
      </div>

      {/* Photo grid */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#1a1a1a'
      }}>
        {photos.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
            textAlign: 'center',
            padding: '40px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>No photos yet</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>
              Tap the button below to take photos of issues
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {photos.map((photo, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '2px solid #333'
                  }}
                />
                <button
                  onClick={() => removePhoto(index)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '12px'
      }}>
        {photos.length < maxPhotos && (
          <button
            onClick={openCamera}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #2B57D0',
              backgroundColor: '#fff',
              color: '#2B57D0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📷 Take Photo
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={photos.length === 0 || saving}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            backgroundColor: photos.length > 0 && !saving ? '#092849' : '#d1d5db',
            color: photos.length > 0 && !saving ? '#fff' : '#9ca3af',
            cursor: photos.length > 0 && !saving ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {saving ? 'Saving...' : `Save ${photos.length} Photo${photos.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};
