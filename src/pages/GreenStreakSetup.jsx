import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { GREEN_STREAK_STOPS, GREEN_STREAK_METRICS } from '../data/greenStreakZones';
import { Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const GreenStreakSetup = ({ greenStreakWalk }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');

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

    const campus = CAMPUSES.find(c => c.name === campusName);

    greenStreakWalk.initWalk(campusName, campus, coordinatorName.trim(), coordinatorEmail.trim());

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

        {/* Walk Overview */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: '600', color: '#092849', marginBottom: '12px' }}>
            Walk Route
          </div>
          {GREEN_STREAK_STOPS.map((stop, idx) => (
            <div key={stop.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: idx < GREEN_STREAK_STOPS.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '14px',
                marginRight: '12px'
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#333' }}>{stop.name}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {stop.checks.length} checks - {stop.timeEstimate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What You're Checking */}
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
                padding: '8px 12px',
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
          Begin Green Streak Walk
        </button>
      </div>
    </div>
  );
};
