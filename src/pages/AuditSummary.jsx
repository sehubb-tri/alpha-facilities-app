import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZONES } from '../data/zones';
import { saveAudit } from '../supabase/services';

export const AuditSummary = ({ audit }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    campus,
    allZones,
    conditionAlerts,
    calculateStatus,
    countDefects,
    getTotalDefects,
    getDuration,
    buildAuditData
  } = audit;

  const status = calculateStatus();
  const totalDefects = getTotalDefects();
  const duration = getDuration();
  const flaggedAlerts = conditionAlerts.filter(a => a.hasIssue).length;

  const statusColors = {
    GREEN: 'bg-[#47C4E6]',
    AMBER: 'bg-[#2B57D0]',
    RED: 'bg-[#141685]'
  };

  const statusIcons = {
    GREEN: '✓',
    AMBER: '⚠️',
    RED: '✗'
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const auditData = buildAuditData();
      await saveAudit(auditData);
      navigate('/audit/complete');
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Error submitting audit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div
        className={`${statusColors[status]} text-white p-6 text-center`}
      >
        <div className="text-5xl mb-2">{statusIcons[status]}</div>
        <div className="text-3xl font-bold">{status}</div>
        <div className="opacity-90">{campus?.name || ''}</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div className="text-xl font-bold">{allZones.length}</div>
            <div className="text-xs text-gray-500">Zones</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div
              className={`text-xl font-bold ${
                totalDefects > 0 ? 'text-[#141685]' : 'text-[#47C4E6]'
              }`}
            >
              {totalDefects}
            </div>
            <div className="text-xs text-gray-500">Defects</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow text-center">
            <div className="text-xl font-bold">{duration}m</div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {allZones.map(zoneId => {
            const zone = ZONES[zoneId];
            const defects = countDefects(zoneId);
            return (
              <div key={zoneId} className="p-3 flex items-center">
                <span
                  className={`w-7 h-7 rounded-full ${
                    defects === 0
                      ? 'bg-[#C2ECFD] text-[#2B57D0]'
                      : 'bg-[#C2ECFD]/50 text-[#141685]'
                  } flex items-center justify-center mr-3 font-bold text-sm`}
                >
                  {defects === 0 ? '✓' : defects}
                </span>
                <span className="flex-1 text-sm">{zone.name}</span>
              </div>
            );
          })}
        </div>

        {flaggedAlerts > 0 && (
          <div className="bg-[#C2ECFD]/30 border border-[#47C4E6] rounded-lg p-3">
            <div className="font-bold text-[#092849] mb-1">
              🔧 {flaggedAlerts} B&G Issue(s) Flagged
            </div>
            <div className="text-sm text-[#141685]">
              Will be sent to B&G team
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-alpha-500 text-white py-4 rounded-xl text-lg font-bold disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : '✓ Submit Audit'}
        </button>
      </div>
    </div>
  );
};
