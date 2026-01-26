import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { SECURITY_ZONES, SECURITY_ZONE_ORDER, SECURITY_RAG_RULES } from '../data/securityZones';

export const SecuritySetup = ({ securityChecklist }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

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

    const campus = CAMPUSES.find(c => c.name === campusName);

    // Initialize checklist
    securityChecklist.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim());

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

        {/* Security Zones Overview */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Check Frequency ({SECURITY_ZONE_ORDER.length} sections)
          </label>
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            {SECURITY_ZONE_ORDER.map((zoneId, index) => {
              const zone = SECURITY_ZONES[zoneId];
              return (
                <div
                  key={zoneId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index !== SECURITY_ZONE_ORDER.length - 1 ? '1px solid rgba(71, 196, 230, 0.3)' : 'none'
                  }}
                >
                  <span style={{
                    backgroundColor: '#092849',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '17px', fontWeight: '500' }}>{zone.name}</span>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                      {zone.description} ({zone.timeNeeded})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

          {/* GREEN */}
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
              <div style={{ fontSize: '13px', color: '#666' }}>All checks pass, no open issues</div>
            </div>
          </div>

          {/* AMBER */}
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
              <div style={{ fontSize: '13px', color: '#666' }}>
                Up to {SECURITY_RAG_RULES.amber.maxOpenIssues} issues, each with owner and fix date within {SECURITY_RAG_RULES.amber.maxDaysToFix} days
              </div>
            </div>
          </div>

          {/* RED */}
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
              <div style={{ fontSize: '13px', color: '#666' }}>
                Any instant-red item failed, or issues exceed limits
              </div>
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
            Some items are marked as <strong>INSTANT RED</strong>. If any of these fail, the campus cannot be Amber or Green until fixed.
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px' }}>
            Every "No" answer requires an explanation.
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
          Begin Security Checklist
        </button>
      </div>
    </div>
  );
};
