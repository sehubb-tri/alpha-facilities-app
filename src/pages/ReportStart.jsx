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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="See It, Report It"
        subtitle="Report a facility issue"
        variant="red"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', color: '#092849' }}>
            Snap a Photo
          </h2>
          <p style={{ color: '#666', marginBottom: '28px', fontSize: '17px', lineHeight: '1.5' }}>
            Take a photo of the issue and we'll route it to the right team.
          </p>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '17px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '10px'
            }}>
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
            📷 Take Photo
          </button>
        </div>
      </div>
    </div>
  );
};
