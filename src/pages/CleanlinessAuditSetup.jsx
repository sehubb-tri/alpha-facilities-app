import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { CLEANLINESS_ZONES, CLEANLINESS_RAG_RULES, ROOM_AUDIT_TEMPLATES, getRoomsForWeek, getWeekOfMonth } from '../data/cleanlinessZones';
import { getCampusRooms, hasCampusRooms } from '../data/campusRooms';

const CHECKLIST_TYPES = [
  { id: 'daily', name: 'Daily Cleanliness Check', icon: '✅', color: '#10b981', subtitle: 'Quick vendor verification', redirect: '/audit/setup' },
  { id: 'weekly', name: 'Weekly Cleanliness Audit', icon: '🧹', color: '#2563eb', subtitle: 'Tour route + assigned rooms' },
  { id: 'monthly', name: 'Monthly Deep Dive', icon: '🔍', color: '#7c3aed', subtitle: 'Deep inspection + 30-day review' }
];

export const CleanlinessAuditSetup = ({ cleanlinessAudit }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [selectedType, setSelectedType] = useState(typeParam && ['weekly', 'monthly'].includes(typeParam) ? typeParam : null);
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');

  const selectedZone = selectedType ? CLEANLINESS_ZONES[selectedType] : null;

  // Get room preview for weekly
  const weekNumber = getWeekOfMonth();
  const campusRooms = campusName ? getCampusRooms(campusName) : [];
  const hasRooms = campusName ? hasCampusRooms(campusName) : false;
  const assignedRooms = hasRooms ? getRoomsForWeek(campusRooms, weekNumber) : [];

  const handleBegin = () => {
    if (!selectedType) {
      alert('Please select an audit type');
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
    cleanlinessAudit.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim(), selectedType);

    window.scrollTo(0, 0);
    navigate('/cleanliness/checklist');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Cleanliness Audit"
        subtitle="14.12 Quality Bar"
        onBack={() => navigate('/ops-audits')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Audit Type Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            What are you checking? *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {CHECKLIST_TYPES.map((type) => {
              const zone = CLEANLINESS_ZONES[type.id];
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    if (type.redirect) {
                      navigate(type.redirect);
                      return;
                    }
                    setSelectedType(type.id);
                  }}
                  style={{
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: isSelected ? `3px solid ${type.color}` : '2px solid #e5e7eb',
                    backgroundColor: isSelected ? `${type.color}10` : '#fff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{type.icon}</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isSelected ? type.color : '#333'
                  }}>
                    {type.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    {zone?.timeNeeded || '15-20 min'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                    {type.subtitle}
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
            {selectedType === 'weekly' && (
              <div style={{
                padding: '10px 0',
                borderTop: '1px solid rgba(71, 196, 230, 0.3)'
              }}>
                <div style={{ fontWeight: '500', fontSize: '15px', color: '#2563eb' }}>
                  + Assigned Rooms from Campus Map
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                  Rooms rotate weekly so all are checked at least 1x/month
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campus Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} placeholder="Select campus..." />
        </div>

        {/* Weekly Room Assignment Preview */}
        {selectedType === 'weekly' && campusName && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#092849', marginBottom: '8px' }}>
              Week {weekNumber} Room Assignments
            </div>
            {hasRooms ? (
              <>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  {assignedRooms.length} room{assignedRooms.length !== 1 ? 's' : ''} assigned this week
                  ({campusRooms.length} total rooms, rotating across 4 weeks)
                </div>
                {assignedRooms.map((room, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: idx < assignedRooms.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>{room.name}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {ROOM_AUDIT_TEMPLATES[room.type]?.name || room.type}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                No room map defined for this campus yet. Weekly audit will include tour route checks only.
                Contact Campus Operations to add rooms.
              </div>
            )}
          </div>
        )}

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
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '4px' }}>
            Rating System
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            APPA Level 2 - Ordinary Tidiness
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: '#10b981', flexShrink: 0, marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#059669' }}>{CLEANLINESS_RAG_RULES.green.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>All checks pass + Tour Ready = Yes</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: '#f59e0b', flexShrink: 0, marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#d97706' }}>{CLEANLINESS_RAG_RULES.amber.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Exactly 1 non-critical defect, still tour ready</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: '#ef4444', flexShrink: 0, marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#dc2626' }}>{CLEANLINESS_RAG_RULES.red.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Any restroom/safety/tour-ready failure, or 2+ defects</div>
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
            Items marked <strong>INSTANT RED IF NO</strong> cannot be Amber. This includes ALL restroom defects, safety hazards, and Tour Ready = No.
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px' }}>
            Every "No" answer requires an explanation. Photo evidence required for restroom and safety items.
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
            : 'Select an Audit Type'}
        </button>
      </div>
    </div>
  );
};
