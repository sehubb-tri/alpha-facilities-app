import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusSelector } from '../components/CampusSelector';
import { Header } from '../components/Header';
import { CAMPUSES } from '../data/campuses';
import { ZONES, MANDATORY_ZONE_IDS, OPTIONAL_ZONE_IDS } from '../data/zones';

export const AuditSetup = ({ audit }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');
  const [auditorName, setAuditorName] = useState('');
  const [selectedOptional, setSelectedOptional] = useState([]);

  const handleOptionalToggle = (zoneId) => {
    setSelectedOptional(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleBegin = () => {
    if (!campusName || !auditorName) {
      alert('Please select campus and enter name');
      return;
    }
    const campus = CAMPUSES.find(c => c.name === campusName);
    audit.beginAudit(campus, auditorName, selectedOptional);
    navigate('/audit/overview');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Daily QC Setup"
        subtitle="Select campus and zones"
        onBack={() => navigate('/')}
      />

      <div className="p-5 space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Your Name *
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={auditorName}
            onChange={(e) => setAuditorName(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-xl p-4 text-xl"
            style={{ fontSize: '18px', minHeight: '56px' }}
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Mandatory Zones (5)
          </label>
          <div className="bg-[#C2ECFD]/30 border-2 border-[#47C4E6] rounded-xl p-4 space-y-3">
            {MANDATORY_ZONE_IDS.map(id => (
              <div key={id} className="flex items-center py-2">
                <span className="text-[#2B57D0] mr-3 text-xl">✓</span>
                <span className="text-lg">{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="ml-auto text-sm bg-red-100 text-red-700 px-3 py-1 rounded-lg font-medium">
                    ⚠️ RED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Optional Zones
          </label>
          <div className="space-y-3">
            {OPTIONAL_ZONE_IDS.map(id => (
              <label
                key={id}
                className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer active:bg-gray-50"
                style={{ minHeight: '60px' }}
              >
                <input
                  type="checkbox"
                  checked={selectedOptional.includes(id)}
                  onChange={() => handleOptionalToggle(id)}
                  className="mr-4 accent-[#2B57D0]"
                  style={{ width: '24px', height: '24px', minWidth: '24px' }}
                />
                <span className="flex-1 text-lg">{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-medium">
                    ⚠️
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleBegin}
          className="w-full text-white py-5 rounded-xl text-xl font-bold transition-colors"
          style={{ backgroundColor: '#092849', fontSize: '20px' }}
        >
          Begin Walkthrough
        </button>
      </div>
    </div>
  );
};
