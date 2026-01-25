import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { BG_ZONES, BG_ZONE_ORDER } from '../data/bgZones';

export const BGSetup = ({ bgWalkthrough }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

  // Interior rooms - user will select these
  const [classrooms, setClassrooms] = useState(['', '', '']);
  const [bathrooms, setBathrooms] = useState(['', '']);

  const handleClassroomChange = (index, value) => {
    const newClassrooms = [...classrooms];
    newClassrooms[index] = value;
    setClassrooms(newClassrooms);
  };

  const handleBathroomChange = (index, value) => {
    const newBathrooms = [...bathrooms];
    newBathrooms[index] = value;
    setBathrooms(newBathrooms);
  };

  const addBathroom = () => {
    setBathrooms([...bathrooms, '']);
  };

  const removeBathroom = (index) => {
    if (bathrooms.length > 2) {
      setBathrooms(bathrooms.filter((_, i) => i !== index));
    }
  };

  const handleBegin = () => {
    // Validation
    if (!campusName) {
      alert('Please select a campus');
      return;
    }
    if (!auditorName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!auditorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auditorEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate rooms
    const filledClassrooms = classrooms.filter(c => c.trim());
    const filledBathrooms = bathrooms.filter(b => b.trim());

    if (filledClassrooms.length < 3) {
      alert('Please enter names/numbers for at least 3 classrooms');
      return;
    }
    if (filledBathrooms.length < 2) {
      alert('Please enter names/numbers for at least 2 bathrooms');
      return;
    }

    const campus = CAMPUSES.find(c => c.name === campusName);

    // Initialize walkthrough
    bgWalkthrough.initWalkthrough(campusName, campus, auditorName.trim(), auditorEmail.trim());
    bgWalkthrough.setSelectedRooms(filledClassrooms, filledBathrooms);

    window.scrollTo(0, 0);
    navigate('/bg/zone');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Weekly B&G Walkthrough"
        subtitle="Building & Grounds Quality Control"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Campus Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} placeholder="Select campus..." />
        </div>

        {/* Name Input */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Your Name *
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={auditorName}
            onChange={(e) => setAuditorName(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fff'
            }}
          />
        </div>

        {/* Email Input */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Your Email *
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={auditorEmail}
            onChange={(e) => setAuditorEmail(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fff'
            }}
          />
        </div>

        {/* B&G Zones Overview */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Inspection Zones ({BG_ZONE_ORDER.length})
          </label>
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            {BG_ZONE_ORDER.map((zoneId, index) => {
              const zone = BG_ZONES[zoneId];
              return (
                <div
                  key={zoneId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index !== BG_ZONE_ORDER.length - 1 ? '1px solid rgba(71, 196, 230, 0.3)' : 'none'
                  }}
                >
                  <span style={{ color: '#2B57D0', marginRight: '12px', fontSize: '20px' }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '17px', fontWeight: '500' }}>{zone.name}</span>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{zone.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interior Rooms Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Interior Rooms to Inspect *
          </label>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            Select 3 classrooms and at least 2 bathrooms to walk during the Interior Building Condition zone.
          </div>

          {/* Classrooms */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', color: '#092849' }}>
              Classrooms (3 required)
            </div>
            {classrooms.map((classroom, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder={`Classroom ${index + 1} (e.g., Room 101, K-1, etc.)`}
                  value={classroom}
                  onChange={(e) => handleClassroomChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bathrooms */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '12px', color: '#092849', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bathrooms (2+ required)</span>
              <button
                onClick={addBathroom}
                style={{
                  backgroundColor: '#47C4E6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                + Add
              </button>
            </div>
            {bathrooms.map((bathroom, index) => (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={`Bathroom ${index + 1} (e.g., Main Hall, Boys K-2, etc.)`}
                  value={bathroom}
                  onChange={(e) => handleBathroomChange(index, e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                />
                {bathrooms.length > 2 && (
                  <button
                    onClick={() => removeBathroom(index)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      border: 'none',
                      borderRadius: '8px',
                      width: '44px',
                      fontSize: '18px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quality Bar Reference */}
        <div style={{
          backgroundColor: 'rgba(254, 243, 199, 0.5)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            The Standard
          </div>
          <div style={{ fontSize: '15px', color: '#78350f', fontStyle: 'italic' }}>
            "If you wouldn't accept this at a Ritz-Carlton, report it."
          </div>
          <div style={{ fontSize: '13px', color: '#92400e', marginTop: '8px' }}>
            Would this pass the 47-second arrival decision?
          </div>
        </div>

        {/* Begin Button */}
        <button
          onClick={handleBegin}
          style={{
            width: '100%',
            backgroundColor: '#092849',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Begin B&G Walkthrough
        </button>
      </div>
    </div>
  );
};
