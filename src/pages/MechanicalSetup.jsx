import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { MECHANICAL_ZONES, MECHANICAL_RAG_RULES, MECHANICAL_SECTIONS_SUMMARY } from '../data/mechanicalZones';

export const MechanicalSetup = ({ mechanicalChecklist }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

  const zone = MECHANICAL_ZONES.weekly;

  const handleBegin = () => {
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
    mechanicalChecklist.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim());

    window.scrollTo(0, 0);
    navigate('/mechanical/checklist');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Mechanical Systems"
        subtitle="14.11 Quality Bar"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Checklist Info */}
        <div style={{
          backgroundColor: 'rgba(194, 236, 253, 0.4)',
          border: '1px solid #47C4E6',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>⚙️</span>
            <div>
              <div style={{ fontWeight: '700', color: '#092849', fontSize: '18px' }}>
                Weekly Mechanical Systems Check
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {zone?.timeNeeded} | Tier 3: Human-Verified
              </div>
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#333', marginBottom: '12px' }}>
            Simple walkthrough inspection of all mechanical systems without requiring BAS or IoT sensors.
          </div>
        </div>

        {/* What You'll Check */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            What You'll Check
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MECHANICAL_SECTIONS_SUMMARY.map((section) => (
              <div key={section.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>{section.icon}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                    {section.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {section.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              <div style={{ fontWeight: '600', color: '#059669' }}>{MECHANICAL_RAG_RULES.green.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>All systems operating properly, no issues</div>
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
              <div style={{ fontWeight: '600', color: '#d97706' }}>{MECHANICAL_RAG_RULES.amber.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Minor issues found, being addressed</div>
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
              <div style={{ fontWeight: '600', color: '#dc2626' }}>{MECHANICAL_RAG_RULES.red.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Safety or comfort issues need immediate attention</div>
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
            Some items are marked as <strong>INSTANT RED</strong> (safety hazards, food safety, air quality). If any of these fail, the campus cannot pass until fixed.
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
          Begin Mechanical Systems Check
        </button>
      </div>
    </div>
  );
};
