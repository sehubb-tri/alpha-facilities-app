import { useNavigate } from 'react-router-dom';

export const AuditZone = ({ audit }) => {
  const navigate = useNavigate();
  const {
    currentZoneIndex,
    currentZone,
    currentZoneId,
    allZones,
    zoneResults,
    setResponse,
    isZoneComplete
  } = audit;

  const results = zoneResults[currentZoneId] || {};
  const answeredCount = Object.keys(results).length;
  const totalQuestions = currentZone?.cleanliness?.length || 0;
  const complete = isZoneComplete(currentZoneId);

  const handleComplete = () => {
    if (complete) {
      navigate('/audit/condition');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="alpha-gradient text-white p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/audit/overview')} className="text-2xl">
            ←
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">{currentZone?.name}</h1>
            <p className="text-white/70 text-sm">
              Zone {currentZoneIndex + 1} of {allZones.length}
            </p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-alpha-500"
          style={{
            width: `${((currentZoneIndex + 1) / allZones.length) * 100}%`
          }}
        />
      </div>

      {!currentZone?.amberEligible && (
        <div className="bg-[#C2ECFD]/50 border-l-4 border-[#2B57D0] p-3 m-4 rounded">
          <div className="font-medium text-[#141685]">⚠️ Any defect = RED status</div>
        </div>
      )}

      <div className="p-4">
        <div className="space-y-3">
          {currentZone?.cleanliness?.map((question, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm mb-3">
                {idx + 1}. {question}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setResponse(currentZoneId, idx, 'yes')}
                  className={`flex-1 py-2 rounded font-medium ${
                    results[idx] === 'yes'
                      ? 'bg-[#47C4E6] text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setResponse(currentZoneId, idx, 'no')}
                  className={`flex-1 py-2 rounded font-medium ${
                    results[idx] === 'no'
                      ? 'bg-[#141685] text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  ✗ No
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleComplete}
          disabled={!complete}
          className={`w-full py-4 rounded-xl text-lg font-bold ${
            complete
              ? 'bg-alpha-500 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          {complete
            ? 'Complete Zone →'
            : `Answer all (${answeredCount}/${totalQuestions})`}
        </button>
      </div>
    </div>
  );
};
