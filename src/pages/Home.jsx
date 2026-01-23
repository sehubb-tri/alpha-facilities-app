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
        <div className="text-center py-8" style={{ color: '#141685' }}>
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
                className="flex items-center p-3 rounded-lg"
                style={{ backgroundColor: '#C2ECFD33' }}
              >
                <span className="text-2xl mr-3">
                  {item.status === 'GREEN'
                    ? '🟢'
                    : item.status === 'AMBER'
                    ? '🟡'
                    : '🔴'}
                </span>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: '#092849' }}>{item.campus}</div>
                  <div className="text-sm" style={{ color: '#141685' }}>
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
                className="flex items-center p-3 rounded-lg"
                style={{ backgroundColor: '#C2ECFD33' }}
              >
                <span className="text-2xl mr-3">{cat.icon}</span>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: '#092849' }}>{cat.name}</div>
                  <div className="text-sm" style={{ color: '#141685' }}>{item.campus}</div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: item.status === 'open' ? '#47C4E6' : '#C2ECFD',
                    color: item.status === 'open' ? '#FFFFFF' : '#092849'
                  }}
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
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg, #092849 0%, #141685 100%)' }}
    >
      <div className="px-6 pt-[50px] pb-0">
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

      <div className="px-[25px] pb-[25px]">
        <div className="grid grid-cols-2 gap-[25px]">
          <button
            onClick={() => navigate('/report')}
            className="aspect-square bg-white hover:opacity-90 rounded-2xl text-lg font-bold shadow-lg flex flex-col items-center justify-center p-4 transition-opacity"
            style={{ color: '#092849' }}
          >
            <span className="text-5xl mb-3">📸</span>
            <span className="text-center leading-tight">See It,<br/>Report It</span>
          </button>

          <button
            onClick={() => navigate('/audit/setup')}
            className="aspect-square bg-white hover:opacity-90 rounded-2xl text-lg font-bold shadow-lg flex flex-col items-center justify-center p-4 transition-opacity"
            style={{ color: '#092849' }}
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
            <div className="text-sm" style={{ color: '#C2ECFD' }}>QC Audits</div>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur p-4 rounded-xl text-left transition-colors"
          >
            <div className="text-3xl font-bold">{loading ? '...' : reports.length}</div>
            <div className="text-sm" style={{ color: '#C2ECFD' }}>Issues Reported</div>
            {openReports > 0 && (
              <div className="text-xs mt-1" style={{ color: '#47C4E6' }}>{openReports} open</div>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl mt-2 p-6 min-h-[280px]">
        <h2 className="font-bold text-lg mb-4" style={{ color: '#092849' }}>Recent Activity</h2>
        {loading ? (
          <div className="text-center py-8" style={{ color: '#141685' }}>Loading...</div>
        ) : (
          renderRecentActivity()
        )}
      </div>
    </div>
  );
};
