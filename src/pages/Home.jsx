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
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontSize: '17px' }}>No activity yet</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {combined.map((item, idx) => {
          if (item.type === 'audit') {
            return (
              <div
                key={`audit-${item.id || idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px'
                }}
              >
                <span style={{ fontSize: '24px', marginRight: '14px' }}>
                  {item.status === 'GREEN' ? '🟢' : item.status === 'AMBER' ? '🟡' : '🔴'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '17px', color: '#092849' }}>{item.campus}</div>
                  <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                    {item.date} • {item.defects} defect{item.defects !== 1 ? 's' : ''}
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px'
                }}
              >
                <span style={{ fontSize: '24px', marginRight: '14px' }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '17px', color: '#092849' }}>{cat.name}</div>
                  <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>{item.campus}</div>
                </div>
                <span style={{
                  fontSize: '14px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: item.status === 'open' ? '#47C4E6' : '#C2ECFD',
                  color: item.status === 'open' ? '#fff' : '#092849',
                  fontWeight: '500'
                }}>
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo Section */}
      <div style={{ padding: '50px 24px 30px', textAlign: 'center' }}>
        <img
          src="/Alpha School Logo - Blue.png"
          alt="Alpha School"
          style={{
            maxWidth: '200px',
            width: 'auto',
            filter: 'brightness(0) invert(1)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Main Action Buttons */}
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <button
            onClick={() => navigate('/report')}
            style={{
              aspectRatio: '1',
              backgroundColor: '#fff',
              color: '#092849',
              borderRadius: '20px',
              fontSize: '17px',
              fontWeight: '700',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>📸</span>
            <span style={{ textAlign: 'center', lineHeight: '1.3' }}>See It,<br/>Report It</span>
          </button>

          <button
            onClick={() => navigate('/audit/setup')}
            style={{
              aspectRatio: '1',
              backgroundColor: '#fff',
              color: '#092849',
              borderRadius: '20px',
              fontSize: '17px',
              fontWeight: '700',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>✅</span>
            <span style={{ textAlign: 'center', lineHeight: '1.3' }}>Daily<br/>Cleanliness Check</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ padding: '0 24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => navigate('/history')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '14px',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
              {loading ? '...' : audits.length}
            </div>
            <div style={{ fontSize: '15px', color: '#C2ECFD', marginTop: '4px' }}>QC Audits</div>
          </button>
          <button
            onClick={() => navigate('/reports')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '14px',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
              {loading ? '...' : reports.length}
            </div>
            <div style={{ fontSize: '15px', color: '#C2ECFD', marginTop: '4px' }}>Issues Reported</div>
            {openReports > 0 && (
              <div style={{ fontSize: '14px', color: '#47C4E6', marginTop: '4px' }}>{openReports} open</div>
            )}
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '24px',
        flex: 1,
        marginTop: '8px'
      }}>
        <h2 style={{
          fontWeight: '700',
          fontSize: '20px',
          marginBottom: '20px',
          color: '#092849'
        }}>
          Recent Activity
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>Loading...</div>
        ) : (
          renderRecentActivity()
        )}
      </div>
    </div>
  );
};
