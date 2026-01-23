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

      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campus *
          </label>
          <CampusSelector value={campusName} onChange={setCampusName} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={auditorName}
            onChange={(e) => setAuditorName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mandatory Zones (5)
          </label>
          <div className="bg-[#C2ECFD]/30 border border-[#47C4E6] rounded-lg p-3 space-y-2">
            {MANDATORY_ZONE_IDS.map(id => (
              <div key={id} className="flex items-center">
                <span className="text-[#2B57D0] mr-2">✓</span>
                <span>{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    ⚠️ RED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional Zones
          </label>
          <div className="space-y-2">
            {OPTIONAL_ZONE_IDS.map(id => (
              <label
                key={id}
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedOptional.includes(id)}
                  onChange={() => handleOptionalToggle(id)}
                  className="w-5 h-5 mr-3 accent-[#2B57D0]"
                />
                <span className="flex-1">{ZONES[id].name}</span>
                {!ZONES[id].amberEligible && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    ⚠️
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleBegin}
          className="w-full bg-alpha-500 hover:bg-alpha-600 text-white py-4 rounded-xl text-lg font-bold transition-colors"
        >
          Begin Walkthrough
        </button>
      </div>
    </div>
  );
};
