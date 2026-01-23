import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CampusSelector } from '../components/CampusSelector';
import { CAMPUSES } from '../data/campuses';

export const ReportStart = ({ report, camera }) => {
  const navigate = useNavigate();
  const [campusName, setCampusName] = useState('');

  const handleOpenCamera = () => {
    if (!campusName) {
      alert('Please select a campus first');
      return;
    }
    const campus = CAMPUSES.find(c => c.name === campusName);
    report.setCampus(campus);

    camera.openCamera((imageData) => {
      report.setPhoto(imageData);
      navigate('/report/photo');
    }, 'Capture Issue');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="See It, Report It"
        subtitle="Report a facility issue"
        variant="red"
        onBack={() => navigate('/')}
      />

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-xl font-bold mb-2">Snap a Photo</h2>
          <p className="text-gray-600 mb-6">
            Take a photo of the issue and we'll route it to the right team.
          </p>

          <div className="space-y-3 mb-6 text-left">
            <label className="block text-sm font-medium text-gray-700">
              Campus *
            </label>
            <CampusSelector
              id="reportCampus"
              value={campusName}
              onChange={setCampusName}
            />
          </div>

          <button
            onClick={handleOpenCamera}
            className="w-full bg-[#092849] text-white py-4 rounded-xl text-lg font-bold"
          >
            📷 Take Photo
          </button>
        </div>
      </div>
    </div>
  );
};
