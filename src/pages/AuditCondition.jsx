import { useNavigate } from 'react-router-dom';

export const AuditCondition = ({ audit, camera }) => {
  const navigate = useNavigate();
  const {
    currentZoneIndex,
    currentZone,
    currentZoneId,
    allZones,
    setConditionAlert,
    updateConditionAlertPhoto,
    updateConditionAlertNote,
    canCompleteCondition,
    getConditionAlert,
    setCurrentZoneIndex
  } = audit;

  const alert = getConditionAlert(currentZoneId);
  const canContinue = canCompleteCondition(currentZoneId);

  const handleTakePhoto = () => {
    camera.openCamera((imageData) => {
      updateConditionAlertPhoto(currentZoneId, imageData);
    }, 'B&G Issue');
  };

  const handleFinish = () => {
    if (!canContinue) return;

    if (currentZoneIndex < allZones.length - 1) {
      setCurrentZoneIndex(currentZoneIndex + 1);
      navigate('/audit/zone');
    } else {
      navigate('/audit/overview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-orange-500 text-white p-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/audit/zone')}
            className="text-2xl mr-3"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold">Building Check</h1>
            <p className="text-orange-100 text-sm">{currentZone?.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-lg font-medium mb-4">
            Any building issues to flag for B&G?
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Examples: holes in walls, broken fixtures, damaged flooring, water
            damage
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setConditionAlert(currentZoneId, false)}
              className={`w-full p-4 rounded-lg border-2 ${
                alert?.hasIssue === false
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              } flex items-center`}
            >
              <span className="text-2xl mr-3">✓</span>
              <div className="font-medium">No issues</div>
            </button>

            <button
              onClick={() => setConditionAlert(currentZoneId, true)}
              className={`w-full p-4 rounded-lg border-2 ${
                alert?.hasIssue === true
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200'
              } flex items-center`}
            >
              <span className="text-2xl mr-3">🔧</span>
              <div className="text-left">
                <div className="font-medium">Yes — flag for B&G</div>
                <div className="text-sm text-gray-500">
                  Photo + description required
                </div>
              </div>
            </button>
          </div>
        </div>

        {alert?.hasIssue === true && (
          <div className="bg-white rounded-lg p-4 shadow animate-slide-up">
            <div className="mb-4">
              {alert.photo ? (
                <div className="relative">
                  <img
                    src={alert.photo}
                    alt="Issue"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={handleTakePhoto}
                    className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg text-sm shadow"
                  >
                    🔄 Retake
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTakePhoto}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <div className="font-medium">Tap to Take Photo</div>
                </button>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the issue *
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g., Hole in drywall near door"
              className="w-full border border-gray-300 rounded-lg p-3"
              value={alert.note || ''}
              onChange={(e) =>
                updateConditionAlertNote(currentZoneId, e.target.value)
              }
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {(alert.note || '').length}/100
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">
            B&G alerts are separate from cleanliness and do NOT affect your
            score.
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleFinish}
          disabled={!canContinue}
          className={`w-full py-4 rounded-xl text-lg font-bold ${
            canContinue
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          {currentZoneIndex < allZones.length - 1
            ? 'Next Zone →'
            : 'Finish Zones →'}
        </button>
      </div>
    </div>
  );
};
