import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const ReportPhoto = ({ report, camera }) => {
  const navigate = useNavigate();
  const { campus, photo } = report;

  const handleRetake = () => {
    camera.openCamera((imageData) => {
      report.setPhoto(imageData);
    }, 'Capture Issue');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Review Photo"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report')}
      />

      <div className="p-4 space-y-4">
        {photo ? (
          <>
            <div className="rounded-lg overflow-hidden shadow">
              <img src={photo} alt="Issue photo" className="w-full" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 py-3 rounded-lg font-medium"
              >
                🔄 Retake
              </button>
              <button
                onClick={() => navigate('/report/details')}
                className="flex-1 bg-[#092849] text-white py-3 rounded-lg font-medium"
              >
                Continue →
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center text-gray-400">
            <div className="text-6xl mb-4">📷</div>
            <p>No photo captured</p>
            <button
              onClick={handleRetake}
              className="mt-4 bg-[#092849] text-white px-6 py-2 rounded-lg"
            >
              Take Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
