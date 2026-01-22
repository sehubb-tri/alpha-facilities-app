import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getReports } from '../supabase/services';
import { ISSUE_CATEGORIES } from '../data/issueCategories';

export const ReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getReports(50);
        setReports(data);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Reported Issues"
        variant="red"
        onBack={() => navigate('/')}
      />

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📸</div>
            <p>No issues reported</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r, idx) => {
              const cat = ISSUE_CATEGORIES.find(c => c.id === r.category) || {
                icon: '❓',
                name: 'Issue'
              };
              return (
                <div key={r.id || idx} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-start">
                    {r.photo && (
                      <img
                        src={r.photo}
                        alt="Issue"
                        className="w-16 h-16 object-cover rounded mr-3"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">
                          {cat.icon} {cat.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            r.status === 'open'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{r.campus}</div>
                      <div className="text-sm text-gray-500">{r.location}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {r.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
