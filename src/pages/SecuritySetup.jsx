import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { SECURITY_ZONES, SECURITY_RAG_RULES } from '../data/securityZones';

const CHECKLIST_TYPES = [
  { id: 'daily', name: 'Daily Security Check', icon: '📋', color: '#2563eb' },
  { id: 'weekly', name: 'Weekly Security Check', icon: '📅', color: '#7c3aed' },
  { id: 'monthly', name: 'Monthly Security Check', icon: '📆', color: '#059669' },
  { id: 'annual', name: 'Annual Security Check', icon: '📊', color: '#dc2626' }
];

export const SecuritySetup = ({ securityChecklist }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

  const selectedZone = selectedType ? SECURITY_ZONES[selectedType] : null;

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
    securityChecklist.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim(), selectedType);

    window.scrollTo(0, 0);
    navigate('/security/checklist');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Security Compliance"
        subtitle="2B/2C Sustain Checklist"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Checklist Type Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            What are you checking today? *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {CHECKLIST_TYPES.map((type) => {
              const zone = SECURITY_ZONES[type.id];
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
              <div style={{ fontWeight: '600', color: '#059669' }}>{SECURITY_RAG_RULES.green.description}</div>
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
              <div style={{ fontWeight: '600', color: '#d97706' }}>{SECURITY_RAG_RULES.amber.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Some issues found, being addressed</div>
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
              <div style={{ fontWeight: '600', color: '#dc2626' }}>{SECURITY_RAG_RULES.red.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Critical issues need immediate attention</div>
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
            Important
          </div>
          <div style={{ fontSize: '14px', color: '#78350f' }}>
            Some items are marked as <strong>INSTANT RED</strong>. If any of these fail, the campus cannot pass until fixed.
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px' }}>
            Every "No" answer requires an explanation.
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
          {selectedType
            ? `Begin ${CHECKLIST_TYPES.find(t => t.id === selectedType)?.name}`
            : 'Select a Checklist Type'}
        </button>
      </div>
    </div>
  );
};
