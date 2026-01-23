import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getAudits } from '../supabase/services';

export const History = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudits = async () => {
      try {
        const data = await getAudits(50);
        setAudits(data);
      } catch (error) {
        console.error('Error loading audits:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAudits();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Audit History" onBack={() => navigate('/')} />

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : audits.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p>No audits yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map((a, idx) => (
              <div key={a.id || idx} className="bg-white rounded-lg p-4 shadow">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {a.status === 'GREEN'
                      ? '🟢'
                      : a.status === 'AMBER'
                      ? '🟡'
                      : '🔴'}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold">{a.campus}</div>
                    <div className="text-sm text-gray-500">
                      {a.date} • {a.auditor}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        a.status === 'GREEN'
                          ? 'text-[#47C4E6]'
                          : a.status === 'AMBER'
                          ? 'text-[#2B57D0]'
                          : 'text-[#141685]'
                      }`}
                    >
                      {a.status}
                    </div>
                    <div className="text-sm text-gray-500">
                      {a.defects} defect{a.defects !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
