import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { HEALTH_SAFETY_ZONES, HEALTH_SAFETY_RAG_RULES } from '../data/healthSafetyZones';

const CHECKLIST_TYPES = [
  { id: 'weekly', name: 'Weekly Health & Safety Check', icon: '🏥', color: '#059669' }
];

export const HealthSafetySetup = ({ healthSafetyChecklist }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('weekly'); // Default to weekly since it's the only option
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

  const selectedZone = selectedType ? HEALTH_SAFETY_ZONES[selectedType] : null;

  const handleBegin = () => {
    if (!selectedType) {
      alert('Please select a checklist type');
      return;
    }
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

    const campus = CAMPUSES.find(c => c.name === campusName);

    // Initialize checklist with selected type
    healthSafetyChecklist.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim(), selectedType);

    window.scrollTo(0, 0);
    navigate('/health-safety/checklist');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Health & Safety"
        subtitle="14.03 Quality Bar Checklist"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Checklist Type Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Checklist Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {CHECKLIST_TYPES.map((type) => {
              const zone = HEALTH_SAFETY_ZONES[type.id];
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? `3px solid ${type.color}` : '2px solid #e5e7eb',
                    backgroundColor: isSelected ? `${type.color}10` : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{type.icon}</div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: isSelected ? type.color : '#333'
                  }}>
                    {type.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {zone?.timeNeeded}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Checklist Preview */}
        {selectedZone && (
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
              {selectedZone.name} - What You'll Check
            </div>
            {selectedZone.sections.map((section, idx) => (
              <div key={idx} style={{
                padding: '10px 0',
                borderBottom: idx < selectedZone.sections.length - 1 ? '1px solid rgba(71, 196, 230, 0.3)' : 'none'
              }}>
                <div style={{ fontWeight: '500', fontSize: '15px', color: '#333' }}>
                  {section.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                  {section.checks.length} check{section.checks.length > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

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

        {/* RAG Rating Info */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            Rating System
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              flexShrink: 0,
              marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#059669' }}>{HEALTH_SAFETY_RAG_RULES.green.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>All checks pass</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              flexShrink: 0,
              marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#d97706' }}>{HEALTH_SAFETY_RAG_RULES.amber.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Issues found with compensating controls in place</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              flexShrink: 0,
              marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#dc2626' }}>{HEALTH_SAFETY_RAG_RULES.red.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Life-critical issues need immediate attention</div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div style={{
          backgroundColor: 'rgba(254, 243, 199, 0.5)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            Important - Life-Critical Items [LC]
          </div>
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            Items marked <strong>[LC]</strong> are Life-Critical. If any of these fail, the campus rating is automatically RED until fixed.
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px' }}>
            Per Quality Bar 14.03: Any "No" response requires a named owner, compensating control, and remediation within 30 days.
          </div>
        </div>

        {/* Begin Button */}
        <button
          onClick={handleBegin}
          disabled={!selectedType}
          style={{
            width: '100%',
            backgroundColor: selectedType ? '#092849' : '#9ca3af',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: selectedType ? 'pointer' : 'not-allowed',
            marginTop: '8px'
          }}
        >
          Begin Health & Safety Check
        </button>
      </div>
    </div>
  );
};
