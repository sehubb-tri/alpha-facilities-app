import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export const AuditTourReady = ({ audit }) => {
  const navigate = useNavigate();
  const { tourReady, setTourReady } = audit;

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header
        title="Final Question"
        onBack={() => navigate('/audit/overview')}
      />

      <div className="p-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="text-lg font-medium mb-4">
            Could a parent tour happen right now?
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setTourReady('yes')}
              className={`w-full p-4 rounded-lg border-2 ${
                tourReady === 'yes'
                  ? 'border-[#47C4E6] bg-[#C2ECFD]/30'
                  : 'border-gray-200'
              } flex items-center`}
            >
              <span className="text-2xl mr-3">✓</span>
              <div className="font-medium">Yes — Tour Ready</div>
            </button>

            <button
              onClick={() => setTourReady('no')}
              className={`w-full p-4 rounded-lg border-2 ${
                tourReady === 'no'
                  ? 'border-[#2B57D0] bg-[#C2ECFD]/30'
                  : 'border-gray-200'
              } flex items-center`}
            >
              <span className="text-2xl mr-3">✗</span>
              <div>
                <div className="font-medium">No — Not Tour Ready</div>
                <div className="text-sm text-[#141685]">⚠️ Automatic RED</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={() => navigate('/audit/summary')}
          disabled={tourReady === null}
          className={`w-full py-4 rounded-xl text-lg font-bold ${
            tourReady !== null
              ? 'bg-alpha-500 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          Review Summary →
        </button>
      </div>
    </div>
  );
};
