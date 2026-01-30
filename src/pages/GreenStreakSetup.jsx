import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { GREEN_STREAK_STOPS, GREEN_STREAK_METRICS } from '../data/greenStreakZones';
import { Zap, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

export const GreenStreakSetup = ({ greenStreakWalk }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');

  // Room selections - collected upfront
  const [learningRoom1, setLearningRoom1] = useState('');
  const [learningRoom2, setLearningRoom2] = useState('');
  const [restroom1, setRestroom1] = useState('');
  const [restroom2, setRestroom2] = useState('');

  // Calculate total checks
  const totalChecks = GREEN_STREAK_STOPS.reduce((sum, stop) => sum + stop.checks.length, 0);
  const totalTime = GREEN_STREAK_STOPS.reduce((sum, stop) => {
    const mins = parseInt(stop.timeEstimate) || 0;
    return sum + mins;
  }, 0);

  const handleBegin = () => {
    if (!campusName) {
      alert('Please select a campus');
      return;
    }
    if (!coordinatorName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!coordinatorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coordinatorEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!learningRoom1.trim() || !learningRoom2.trim()) {
      alert('Please enter both learning spaces you will check');
      return;
    }
    if (!restroom1.trim() || !restroom2.trim()) {
      alert('Please enter both restroom locations you will check');
      return;
    }

    const campus = CAMPUSES.find(c => c.name === campusName);

    // Pass room selections to initWalk
    const roomSelections = {
      learning: [learningRoom1.trim(), learningRoom2.trim()],
      restroom: [restroom1.trim(), restroom2.trim()]
    };

    greenStreakWalk.initWalk(campusName, campus, coordinatorName.trim(), coordinatorEmail.trim(), roomSelections);

    window.scrollTo(0, 0);
    navigate('/green-streak/walk');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Green Streak Walk"
        subtitle="Daily CC Oversight Check"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Zap size={32} />
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>Daily Green Streak</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Oversight walk - verify all systems are GO</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} />
              <span style={{ fontSize: '15px' }}>~{totalTime} min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: '15px' }}>{totalChecks} checks</span>
            </div>
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
            value={coordinatorName}
            onChange={(e) => setCoordinatorName(e.target.value)}
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
            value={coordinatorEmail}
            onChange={(e) => setCoordinatorEmail(e.target.value)}
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

        {/* Spaces to Check - All 4 upfront */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <MapPin size={20} color="#10b981" />
            <span style={{ fontSize: '17px', fontWeight: '600', color: '#333' }}>
              Spaces You'll Check Today
            </span>
          </div>

          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#0369a1'
          }}>
            <strong>Tip:</strong> Rotate which rooms you check daily so you see all spaces over the course of a week.
          </div>

          {/* Learning Spaces */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
              Learning Spaces (2 rooms) *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Room 1 (e.g., Room 101, Pod A)"
                value={learningRoom1}
                onChange={(e) => setLearningRoom1(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              />
              <input
                type="text"
                placeholder="Room 2 (e.g., Room 102, Pod B)"
                value={learningRoom2}
                onChange={(e) => setLearningRoom2(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </div>

          {/* Restrooms */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
              Restrooms (2 locations) *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Restroom 1 (e.g., Main hallway)"
                value={restroom1}
                onChange={(e) => setRestroom1(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              />
              <input
                type="text"
                placeholder="Restroom 2 (e.g., Near gym)"
                value={restroom2}
                onChange={(e) => setRestroom2(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          </div>
        </div>

        {/* Walk Route - Compact */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            Walk Route
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {GREEN_STREAK_STOPS.map((stop, idx) => (
              <div key={stop.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f3f4f6',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px'
              }}>
                <span style={{
                  fontWeight: '700',
                  color: '#10b981',
                  fontSize: '12px'
                }}>
                  {idx + 1}
                </span>
                <span style={{ color: '#333' }}>{stop.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What You're Checking - Compact */}
        <div style={{
          backgroundColor: 'rgba(194, 236, 253, 0.4)',
          border: '1px solid #47C4E6',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            5 Green Streak Metrics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.values(GREEN_STREAK_METRICS).filter(m => !m.isVendorQC).map(metric => (
              <div key={metric.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#fff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: metric.color
                }} />
                <span style={{ fontWeight: '500' }}>{metric.name}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '12px' }}>
            + Cleanliness spot-check (vendor QC)
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            How It Works
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '12px',
              flexShrink: 0
            }}>
              Y
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#059669' }}>Yes = All Good</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Move to next check</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '12px',
              flexShrink: 0
            }}>
              N
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#dc2626' }}>No = Issue Found</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Describe the issue (required), add photo (optional)</div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div style={{
          backgroundColor: 'rgba(254, 243, 199, 0.5)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          gap: '12px'
        }}>
          <AlertTriangle size={24} color="#92400e" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
              This is Oversight
            </div>
            <div style={{ fontSize: '14px', color: '#78350f' }}>
              You're verifying systems are working, not fixing them. If something is wrong, log it and escalate.
            </div>
          </div>
        </div>

        {/* Begin Button */}
        <button
          onClick={handleBegin}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Zap size={22} />
          Continue
        </button>
      </div>
    </div>
  );
};
