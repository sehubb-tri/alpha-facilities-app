import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BG_ZONES, BG_ZONE_ORDER } from '../data/bgZones';
import { ROUTING_RULES, BG_ISSUE_CATEGORIES } from '../data/bgCategories';

export const BGObservations = ({ bgWalkthrough, camera }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObservation, setNewObservation] = useState({
    description: '',
    photos: []
  });

  const {
    currentZoneIndex,
    observations,
    addObservation,
    removeObservation,
    nextZone,
    goToZone
  } = bgWalkthrough;

  const currentZoneId = BG_ZONE_ORDER[currentZoneIndex];
  const currentZone = BG_ZONES[currentZoneId];
  const totalZones = BG_ZONE_ORDER.length;

  // Routing categories (non-B&G owned)
  const routingCategories = currentZone?.routingCategories || [];

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setShowAddForm(true);
    setNewObservation({ description: '', photos: [] });
  };

  const handleTakePhoto = () => {
    camera.openCamera((imageData) => {
      if (imageData) {
        setNewObservation(prev => ({
          ...prev,
          photos: [...prev.photos, imageData]
        }));
      }
    });
  };

  const handleRemovePhoto = (index) => {
    setNewObservation(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSaveObservation = () => {
    if (!selectedCategory || !newObservation.description.trim()) {
      alert('Please select a category and describe the issue');
      return;
    }
    if (newObservation.photos.length === 0) {
      alert('Please take at least one photo');
      return;
    }

    addObservation({
      category: selectedCategory.id,
      categoryName: selectedCategory.name,
      pillar: selectedCategory.pillar,
      tier: selectedCategory.tier,
      description: newObservation.description.trim(),
      photos: newObservation.photos,
      examples: selectedCategory.items
    });

    setShowAddForm(false);
    setSelectedCategory(null);
    setNewObservation({ description: '', photos: [] });
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setSelectedCategory(null);
    setNewObservation({ description: '', photos: [] });
  };

  const handleDeleteObservation = (obsId) => {
    if (window.confirm('Delete this observation?')) {
      removeObservation(obsId);
    }
  };

  const handleComplete = () => {
    if (currentZoneIndex < totalZones - 1) {
      nextZone();
      window.scrollTo(0, 0);
      navigate('/bg/zone');
    } else {
      navigate('/bg/summary');
    }
  };

  const handleBack = () => {
    if (currentZoneIndex > 0) {
      goToZone(currentZoneIndex - 1);
      navigate('/bg/zone');
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
            onClick={handleBack}
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
              {currentZone?.name}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
              Zone {currentZoneIndex + 1} of {totalZones}
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
            width: `${((currentZoneIndex + 1) / totalZones) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: 'rgba(194, 236, 253, 0.5)',
        borderLeft: '4px solid #2B57D0',
        padding: '14px 16px',
        margin: '16px 20px',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#141685', marginBottom: '4px' }}>
          Observation & Routing
        </div>
        <div style={{ fontSize: '14px', color: '#1e3a5f' }}>
          Report issues that belong to other pillars. B&G observes, the owning pillar sets the standard.
        </div>
      </div>

      {/* Add Form */}
      {showAddForm ? (
        <div style={{ padding: '0 20px' }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#092849' }}>
                New {selectedCategory?.name} Observation
              </h3>
              <button
                onClick={handleCancelAdd}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Routing Info */}
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '13px', color: '#0369a1' }}>
                <strong>Routes to:</strong> {selectedCategory?.pillar}
              </div>
              <div style={{ fontSize: '13px', color: '#0369a1', marginTop: '4px' }}>
                <strong>SLA Tier:</strong> {selectedCategory?.tier}
              </div>
            </div>

            {/* Example Issues */}
            {selectedCategory?.items && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Example Issues:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
                  {selectedCategory.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Photos */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Photos *
              </div>
              {newObservation.photos.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  {newObservation.photos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          borderRadius: '6px',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleTakePhoto}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>📷</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {newObservation.photos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
                </span>
              </button>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Description *
              </div>
              <textarea
                value={newObservation.description}
                onChange={(e) => setNewObservation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue you observed..."
                maxLength={300}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '15px',
                  resize: 'none',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right', marginTop: '4px' }}>
                {newObservation.description.length}/300
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveObservation}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#092849',
                color: '#fff'
              }}
            >
              Save Observation
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Category Selection */}
          <div style={{ padding: '0 20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
              Select Issue Category:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {routingCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: category.tier === 1 ? '#fee2e2' : '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '14px',
                    fontSize: '20px'
                  }}>
                    {category.id === 'security' && '🔒'}
                    {category.id === 'outdoor_rec' && '🎮'}
                    {category.id === 'fire_life_safety' && '🔥'}
                    {category.id === 'mechanical' && '⚙️'}
                    {category.id === 'cleanliness' && '🧹'}
                    {category.id === 'structural_capital' && '🏗️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#092849' }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                      → {category.pillar}
                    </div>
                  </div>
                  {category.tier === 1 && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      TIER 1
                    </span>
                  )}
                  <span style={{ color: '#9ca3af', fontSize: '20px', marginLeft: '8px' }}>+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Observations */}
          {observations.length > 0 && (
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                Recorded Observations ({observations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {observations.map(obs => (
                  <div
                    key={obs.id}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#092849' }}>
                          {obs.categoryName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          → {obs.pillar} • Tier {obs.tier}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteObservation(obs.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
                      {obs.description}
                    </div>
                    {obs.photos?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {obs.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Observation ${idx + 1}`}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '6px',
                              objectFit: 'cover'
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
        </>
      )}

      {/* Fixed Bottom Button */}
      {!showAddForm && (
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
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#092849',
              color: '#fff'
            }}
          >
            {observations.length === 0
              ? 'No Observations - Continue →'
              : `${observations.length} Observation${observations.length > 1 ? 's' : ''} Recorded - Continue →`}
          </button>
        </div>
      )}
    </div>
  );
};
