import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { CLEANLINESS_ZONES, CLEANLINESS_RAG_RULES, ROOM_AUDIT_TEMPLATES, MONTHLY_ROOM_AUDIT_TEMPLATES, MONTHLY_TOUR_ROUTE_AREAS, MONTHLY_CAMPUS_SECTIONS, getRoomsForWeek } from '../data/cleanlinessZones';
import { getCampusRooms, hasCampusRooms } from '../data/campusRooms';
import { getWeeklyAuditCountThisMonth } from '../supabase/cleanlinessAuditService';

const CHECKLIST_TYPES = [
  { id: 'daily', name: 'Daily Cleanliness Check', icon: '✅', color: '#10b981', subtitle: 'Quick vendor verification', redirect: '/audit/setup' },
  { id: 'weekly', name: 'Weekly Cleanliness Audit', icon: '🧹', color: '#2563eb', subtitle: 'Tour route + rooms (4x/month required)' },
  { id: 'monthly', name: 'Monthly Cleanliness Audit', icon: '🔍', color: '#7c3aed', subtitle: 'Every room, deep inspection, determines SLA rating' }
];

export const CleanlinessAuditSetup = ({ cleanlinessAudit }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [selectedType, setSelectedType] = useState(typeParam && ['weekly', 'monthly'].includes(typeParam) ? typeParam : null);
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [auditNumber, setAuditNumber] = useState(null);
  const [auditsCompletedThisMonth, setAuditsCompletedThisMonth] = useState(0);
  const [loadingAuditCount, setLoadingAuditCount] = useState(false);

  const selectedZone = selectedType ? CLEANLINESS_ZONES[selectedType] : null;

  // Fetch audit count when campus changes (for weekly rotation)
  useEffect(() => {
    if (campusName && selectedType === 'weekly') {
      setLoadingAuditCount(true);
      getWeeklyAuditCountThisMonth(campusName)
        .then(count => {
          setAuditsCompletedThisMonth(count);
          // Next audit number is count + 1, capped at 4 (cycles back to 1 after 4)
          const nextAudit = (count % 4) + 1;
          setAuditNumber(nextAudit);
        })
        .catch(err => {
          console.error('Error fetching audit count:', err);
          setAuditNumber(1);
        })
        .finally(() => setLoadingAuditCount(false));
    }
  }, [campusName, selectedType]);

  // Get room preview for weekly
  const campusRooms = campusName ? getCampusRooms(campusName) : [];
  const hasRooms = campusName ? hasCampusRooms(campusName) : false;
  const assignedRooms = (hasRooms && auditNumber) ? getRoomsForWeek(campusRooms, auditNumber) : [];

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
    cleanlinessAudit.initChecklist(campusName, campus, auditorName.trim(), auditorEmail.trim(), selectedType, auditNumber);

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

        {/* Timing Reminder for Weekly */}
        {selectedType === 'weekly' && (
          <div style={{
            backgroundColor: 'rgba(219, 234, 254, 0.5)',
            border: '1px solid #2563eb',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <div style={{ fontSize: '18px', flexShrink: 0 }}>⏰</div>
            <div style={{ fontSize: '14px', color: '#1e40af' }}>
              <strong>Complete before staff and students arrive</strong> (typically 6:00-7:30 AM). This audit verifies overnight vendor work.
            </div>
          </div>
        )}

        {/* Selected Checklist Preview */}
        {selectedZone && selectedType === 'weekly' && (
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
          </div>
        )}

        {/* Monthly Checklist Preview */}
        {selectedType === 'monthly' && (
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #7c3aed',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#092849', marginBottom: '4px' }}>
              Monthly Cleanliness Audit - What You'll Check
            </div>
            <div style={{ fontSize: '13px', color: '#7c3aed', marginBottom: '12px' }}>
              Room-by-room deep inspection of every space in the facility
            </div>

            <div style={{ fontWeight: '500', fontSize: '14px', color: '#333', marginBottom: '8px' }}>
              Tour Route Areas:
            </div>
            {MONTHLY_TOUR_ROUTE_AREAS.map((area, idx) => (
              <div key={idx} style={{
                padding: '6px 0',
                borderBottom: '1px solid rgba(124, 58, 237, 0.15)'
              }}>
                <div style={{ fontSize: '14px', color: '#333' }}>{area.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{area.checks.length} checks</div>
              </div>
            ))}

            <div style={{ fontWeight: '500', fontSize: '14px', color: '#333', marginTop: '12px', marginBottom: '4px' }}>
              + Every Campus Room (deep-dive template per room type)
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              Weekly checks + ceiling tiles, vents, light fixtures, walls, baseboards, cobwebs, floor finish, carpet, under furniture, upholstery, window sills
            </div>

            <div style={{ fontWeight: '500', fontSize: '14px', color: '#333', marginTop: '8px', marginBottom: '4px' }}>
              Campus-Wide Wrap-Up:
            </div>
            {MONTHLY_CAMPUS_SECTIONS.map((section, idx) => (
              <div key={idx} style={{
                padding: '6px 0',
                borderBottom: idx < MONTHLY_CAMPUS_SECTIONS.length - 1 ? '1px solid rgba(124, 58, 237, 0.15)' : 'none'
              }}>
                <div style={{ fontSize: '14px', color: '#333' }}>{section.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{section.checks.length} checks</div>
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

        {/* Weekly Room Assignment Preview */}
        {selectedType === 'weekly' && campusName && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#092849', marginBottom: '4px' }}>
              Audit {auditNumber} of 4 - Room Assignments
            </div>
            <div style={{ fontSize: '12px', color: '#2563eb', marginBottom: '8px' }}>
              {auditsCompletedThisMonth} of 4 completed this month
              {auditsCompletedThisMonth >= 4 && ' (all done! rooms will cycle)'}
            </div>
            {loadingAuditCount ? (
              <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>Loading room assignments...</div>
            ) : hasRooms ? (
              <>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  {assignedRooms.length} room{assignedRooms.length !== 1 ? 's' : ''} assigned for this audit
                  ({campusRooms.length} total rooms, rotating across 4 audits)
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

        {/* Monthly Room List Preview */}
        {selectedType === 'monthly' && campusName && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>
              All Rooms to Inspect
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              Every space in the facility will be checked with expanded deep-dive questions
            </div>
            {hasRooms ? (
              <>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  {campusRooms.length} room{campusRooms.length !== 1 ? 's' : ''} + {MONTHLY_TOUR_ROUTE_AREAS.length} tour route areas + {MONTHLY_CAMPUS_SECTIONS.length} campus-wide sections
                </div>
                {campusRooms.map((room, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: idx < campusRooms.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>{room.name}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {MONTHLY_ROOM_AUDIT_TEMPLATES[room.type]?.name || ROOM_AUDIT_TEMPLATES[room.type]?.name || room.type}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                No room map defined for this campus yet. Monthly audit will include tour route areas and campus-wide sections only.
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
            {selectedType === 'monthly' && ' | Determines campus SLA rating visible to all leadership'}
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
              <div style={{ fontSize: '13px', color: '#666' }}>1-5 non-critical defects, still tour ready, 7 days to fix</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: '#ef4444', flexShrink: 0, marginTop: '2px'
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#dc2626' }}>{CLEANLINESS_RAG_RULES.red.description}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Any restroom or safety/EHS failure, or 6+ non-critical defects</div>
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
            Items marked <strong>INSTANT RED IF NO</strong> cannot be Amber. This includes ALL restroom defects and safety/EHS hazards.
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px' }}>
            Every "No" answer requires an explanation. Photo evidence required for restroom and safety items.
          </div>
          {selectedType === 'monthly' && (
            <div style={{ fontSize: '14px', color: '#78350f', marginTop: '8px', fontWeight: '600' }}>
              This audit determines the campus SLA rating (GREEN / AMBER / RED) visible to all leadership. If the campus fails this audit, a site visit and sign-off is required within 7 days to return to GREEN.
            </div>
          )}
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
