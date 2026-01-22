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
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header
        title={campus?.name || 'Audit'}
        subtitle={`${campus?.city || ''}, ${campus?.state || ''}`}
        onBack={handleExit}
      />

      <div className="bg-white p-4 border-b">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {completedCount} of {allZones.length} zones
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-alpha-500 transition-all"
            style={{ width: `${(completedCount / allZones.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-700 mb-3">Mandatory Zones</h2>
        <div className="space-y-2 mb-6">
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
            <h2 className="font-bold text-gray-700 mb-3">Optional Zones</h2>
            <div className="space-y-2">
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleContinue}
          className="w-full bg-alpha-500 text-white py-4 rounded-xl text-lg font-bold"
        >
          {completedCount === allZones.length
            ? 'Final Question →'
            : completedCount === 0
            ? 'Start First Zone'
            : 'Continue'}{' '}
          →
        </button>
      </div>
    </div>
  );
};
