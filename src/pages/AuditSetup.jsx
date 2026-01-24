import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { ZONES, MANDATORY_ZONE_IDS, OPTIONAL_ZONE_IDS } from '../data/zones';

export const AuditSetup = ({ audit }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [selectedOptional, setSelectedOptional] = useState([]);

  const handleOptionalToggle = (zoneId) => {
    setSelectedOptional(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleBegin = () => {
    if (!campusName || !auditorName || !auditorEmail) {
      alert('Please select campus, enter name and email');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auditorEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    const campus = CAMPUSES.find(c => c.name === campusName);
    audit.beginAudit(campus, auditorName, auditorEmail, selectedOptional);
    audit.setCurrentZoneIndex(0);
    window.scrollTo(0, 0);
    navigate('/audit/zone');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Daily QC Setup"
        subtitle="Select campus and zones"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Campus Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} />
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
            Email for Report *
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
          <p style={{ fontSize: '14px', color: '#666', marginTop: '6px' }}>
            A summary report will be sent to this email when the checklist is complete
          </p>
        </div>

        {/* Mandatory Zones */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Mandatory Zones (5)
          </label>
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            {MANDATORY_ZONE_IDS.map((id, index) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index !== MANDATORY_ZONE_IDS.length - 1 ? '1px solid rgba(71, 196, 230, 0.3)' : 'none'
                }}
              >
                <span style={{ color: '#2B57D0', marginRight: '12px', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '17px', flex: 1 }}>{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span style={{
                    fontSize: '13px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    ⚠️ RED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Zones */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Optional Zones
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {OPTIONAL_ZONE_IDS.map(id => (
              <label
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                  minHeight: '56px'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedOptional.includes(id)}
                  onChange={() => handleOptionalToggle(id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '14px',
                    accentColor: '#2B57D0'
                  }}
                />
                <span style={{ flex: 1, fontSize: '17px' }}>{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span style={{
                    fontSize: '13px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    ⚠️
                  </span>
                )}
              </label>
            ))}
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
          Begin Walkthrough
        </button>
      </div>
    </div>
  );
};
