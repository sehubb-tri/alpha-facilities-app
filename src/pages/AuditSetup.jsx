import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { ZONES, TOUR_ROUTE_ZONE_IDS, OPTIONAL_ZONE_IDS } from '../data/zones';
import { useI18n } from '../i18n';

export const AuditSetup = ({ audit }) => {
  const navigate = useNavigate();
  const { t, getZoneName } = useI18n();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [restroomCount, setRestroomCount] = useState(1);
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
      alert(t('audit.validation.selectCampus') + ', ' + t('audit.validation.enterName').toLowerCase() + ', ' + t('audit.validation.enterEmail').toLowerCase());
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auditorEmail)) {
      alert(t('audit.validation.enterEmail'));
      return;
    }
    const campus = CAMPUSES.find(c => c.name === campusName);
    audit.beginAudit(campus, auditorName, auditorEmail, selectedOptional, restroomCount);
    audit.setCurrentZoneIndex(0);
    window.scrollTo(0, 0);
    navigate('/audit/zone');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title={t('audit.setup.title')}
        subtitle={t('audit.setup.selectOptionalZones')}
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Campus Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            {t('audit.setup.campus')} *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} placeholder={t('audit.setup.campusPlaceholder')} />
        </div>

        {/* Name Input */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            {t('audit.setup.yourName')} *
          </label>
          <input
            type="text"
            placeholder={t('audit.setup.namePlaceholder')}
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
            {t('audit.setup.email')} *
          </label>
          <input
            type="email"
            placeholder={t('audit.setup.emailPlaceholder')}
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

        {/* Number of Restrooms */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            {t('audit.setup.restroomCount')} *
          </label>
          <select
            value={restroomCount}
            onChange={(e) => setRestroomCount(parseInt(e.target.value))}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num} {getZoneName('restroom')}{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Tour Route Zones */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            Tour Route Zones ({TOUR_ROUTE_ZONE_IDS.length})
          </label>
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.4)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            {TOUR_ROUTE_ZONE_IDS.map((id, index) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index !== TOUR_ROUTE_ZONE_IDS.length - 1 ? '1px solid rgba(71, 196, 230, 0.3)' : 'none'
                }}
              >
                <span style={{ color: '#2B57D0', marginRight: '12px', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '17px', flex: 1 }}>{getZoneName(id)}</span>
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

        {/* Restrooms Preview */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            {getZoneName('restroom')}s ({restroomCount})
          </label>
          <div style={{
            backgroundColor: 'rgba(254, 226, 226, 0.4)',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '16px'
          }}>
            {Array.from({ length: restroomCount }, (_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i !== restroomCount - 1 ? '1px solid rgba(248, 113, 113, 0.3)' : 'none'
                }}
              >
                <span style={{ color: '#b91c1c', marginRight: '12px', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '17px', flex: 1 }}>{getZoneName('restroom')} {i + 1}</span>
                <span style={{
                  fontSize: '13px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  ⚠️ {t('audit.status.red').split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Zones */}
        <div>
          <label style={{ display: 'block', fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '10px' }}>
            {t('audit.setup.optionalZones')}
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
                <span style={{ flex: 1, fontSize: '17px' }}>{getZoneName(id)}</span>
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
          {t('audit.setup.beginWalkthrough')}
        </button>
      </div>
    </div>
  );
};
