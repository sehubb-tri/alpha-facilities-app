import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ZoneCard } from '../components/ZoneCard';
import { ZONES, MANDATORY_ZONE_IDS } from '../data/zones';

export const AuditOverview = ({ audit }) => {
  const navigate = useNavigate();
  const {
    campus,
    allZones,
    selectedOptionalZones,
    zoneResults,
    countDefects,
    getCompletedZonesCount,
    getNextIncompleteZoneIndex,
    setCurrentZoneIndex
  } = audit;

  const completedCount = getCompletedZonesCount();

  const handleZoneClick = (index) => {
    setCurrentZoneIndex(index);
    navigate('/audit/zone');
  };

  const handleContinue = () => {
    if (completedCount === allZones.length) {
      navigate('/audit/tour-ready');
    } else {
      const nextIndex = getNextIncompleteZoneIndex();
      if (nextIndex >= 0) {
        setCurrentZoneIndex(nextIndex);
        navigate('/audit/zone');
      }
    }
  };

  const handleExit = () => {
    if (window.confirm('Exit? Progress will be lost.')) {
      audit.resetAudit();
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title={campus?.name || 'Audit'}
        subtitle={`${campus?.city || ''}, ${campus?.state || ''}`}
        onBack={handleExit}
      />

      {/* Progress Bar */}
      <div style={{ backgroundColor: '#fff', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#666', marginBottom: '10px' }}>
          <span>Progress</span>
          <span>{completedCount} of {allZones.length} zones</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              backgroundColor: '#092849',
              width: `${(completedCount / allZones.length) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Zone Lists */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ fontWeight: '700', fontSize: '17px', color: '#374151', marginBottom: '14px' }}>
          Mandatory Zones
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {MANDATORY_ZONE_IDS.map((id, idx) => (
            <ZoneCard
              key={id}
              zoneId={id}
              index={idx}
              defects={countDefects(id)}
              isComplete={!!zoneResults[id]}
              onClick={() => handleZoneClick(idx)}
            />
          ))}
        </div>

        {selectedOptionalZones.length > 0 && (
          <>
            <h2 style={{ fontWeight: '700', fontSize: '17px', color: '#374151', marginBottom: '14px' }}>
              Optional Zones
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedOptionalZones.map((id, idx) => (
                <ZoneCard
                  key={id}
                  zoneId={id}
                  index={MANDATORY_ZONE_IDS.length + idx}
                  defects={countDefects(id)}
                  isComplete={!!zoneResults[id]}
                  onClick={() => handleZoneClick(MANDATORY_ZONE_IDS.length + idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            backgroundColor: '#092849',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {completedCount === allZones.length
            ? 'Final Question →'
            : completedCount === 0
            ? 'Start First Zone →'
            : 'Continue →'}
        </button>
      </div>
    </div>
  );
};
