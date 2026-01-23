import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAudits, getReports } from '../supabase/services';
import { ISSUE_CATEGORIES } from '../data/issueCategories';

export const Home = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [auditsData, reportsData] = await Promise.all([
          getAudits(10),
          getReports(10)
        ]);
        setAudits(auditsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openReports = reports.filter(r => r.status === 'open').length;

  const renderRecentActivity = () => {
    const combined = [
      ...audits.map(a => ({
        ...a,
        type: 'audit',
        sortDate: new Date(a.createdAt || a.date + ' ' + a.time)
      })),
      ...reports.map(r => ({
        ...r,
        type: 'report',
        sortDate: new Date(r.createdAt || r.timestamp)
      }))
    ]
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 5);

    if (combined.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>No activity yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {combined.map((item, idx) => {
          if (item.type === 'audit') {
            return (
              <div
                key={`audit-${item.id || idx}`}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl mr-3">
                  {item.status === 'GREEN'
                    ? '🟢'
                    : item.status === 'AMBER'
                    ? '🟡'
                    : '🔴'}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{item.campus}</div>
                  <div className="text-sm text-gray-500">
                    {item.date} • {item.defects} defect
                    {item.defects !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          } else {
            const cat = ISSUE_CATEGORIES.find(c => c.id === item.category) || {
              icon: '❓',
              name: 'Issue'
            };
            return (
              <div
                key={`report-${item.id || idx}`}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl mr-3">{cat.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-sm text-gray-500">{item.campus}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    item.status === 'open'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen alpha-gradient text-white">
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-center mb-[50px]">
          <img
            src="/Alpha School Logo - Blue.png"
            alt="Alpha School"
            className="max-w-[200px] w-auto brightness-0 invert"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="text-2xl font-bold tracking-tight hidden">ALPHA</div>
        </div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-2 gap-[25px]">
          <button
            onClick={() => navigate('/report')}
            className="aspect-square bg-white/90 hover:bg-white text-gray-800 rounded-2xl text-lg font-bold shadow-lg flex flex-col items-center justify-center p-4 transition-colors"
          >
            <span className="text-5xl mb-3">📸</span>
            <span className="text-center leading-tight">See It,<br/>Report It</span>
          </button>

          <button
            onClick={() => navigate('/audit/setup')}
            className="aspect-square bg-white hover:bg-gray-50 text-alpha-500 rounded-2xl text-lg font-bold shadow-lg flex flex-col items-center justify-center p-4 transition-colors"
          >
            <span className="text-5xl mb-3">✅</span>
            <span className="text-center leading-tight">Daily<br/>Cleanliness Check</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/history')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur p-4 rounded-xl text-left transition-colors"
          >
            <div className="text-3xl font-bold">{loading ? '...' : audits.length}</div>
            <div className="text-white/70 text-sm">QC Audits</div>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur p-4 rounded-xl text-left transition-colors"
          >
            <div className="text-3xl font-bold">{loading ? '...' : reports.length}</div>
            <div className="text-white/70 text-sm">Issues Reported</div>
            {openReports > 0 && (
              <div className="text-yellow-300 text-xs mt-1">{openReports} open</div>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white text-gray-800 rounded-t-3xl mt-2 p-6 min-h-[280px]">
        <h2 className="font-bold text-lg mb-4 text-alpha-500">Recent Activity</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          renderRecentActivity()
        )}
      </div>
    </div>
  );
};
