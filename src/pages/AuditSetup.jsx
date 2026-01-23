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

      <div className="p-4 space-y-5">
        {/* Campus Dropdown */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} />
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={auditorName}
            onChange={(e) => setAuditorName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
          />
        </div>

        {/* Mandatory Zones */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Mandatory Zones (5)
          </label>
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'rgba(194, 236, 253, 0.3)', border: '1px solid #47C4E6' }}
          >
            {MANDATORY_ZONE_IDS.map((id, index) => (
              <div
                key={id}
                className={`flex items-center ${index !== MANDATORY_ZONE_IDS.length - 1 ? 'mb-3 pb-3 border-b border-[#47C4E6]/30' : ''}`}
              >
                <span className="text-[#2B57D0] mr-3 text-lg">✓</span>
                <span className="text-base flex-1">{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                    ⚠️ RED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Zones */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Optional Zones
          </label>
          <div className="space-y-2">
            {OPTIONAL_ZONE_IDS.map(id => (
              <label
                key={id}
                className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer active:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedOptional.includes(id)}
                  onChange={() => handleOptionalToggle(id)}
                  className="mr-3 accent-[#2B57D0]"
                  style={{ width: '22px', height: '22px' }}
                />
                <span className="flex-1 text-base">{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
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
          className="w-full text-white py-4 rounded-xl text-lg font-bold"
          style={{ backgroundColor: '#092849' }}
        >
          Begin Walkthrough
        </button>
      </div>
    </div>
  );
};
