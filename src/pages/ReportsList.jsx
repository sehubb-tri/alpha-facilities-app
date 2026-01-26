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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="Reported Issues"
        variant="red"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '17px' }}>
            Loading...
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📸</div>
            <p style={{ fontSize: '17px' }}>No issues reported</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((r, idx) => {
              const cat = ISSUE_CATEGORIES.find(c => c.id === r.category) || {
                icon: '📸',
                name: 'See It, Report It'
              };
              return (
                <div
                  key={r.id || idx}
                  onClick={() => r.id && navigate(`/report/${r.id}`)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: r.id ? 'pointer' : 'default'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {r.photo && (
                      <img
                        src={r.photo}
                        alt="Issue"
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginRight: '14px'
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px'
                      }}>
                        <span style={{ fontWeight: '700', fontSize: '17px', color: '#092849' }}>
                          {cat.icon} {cat.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '14px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            backgroundColor: r.status === 'open' ? '#C2ECFD' : 'rgba(194, 236, 253, 0.5)',
                            color: r.status === 'open' ? '#141685' : '#092849',
                            fontWeight: '500'
                          }}>
                            {r.status}
                          </span>
                          <span style={{ color: '#9ca3af', fontSize: '20px' }}>›</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '15px', color: '#666' }}>{r.campus}</div>
                      <div style={{ fontSize: '15px', color: '#888', marginTop: '2px' }}>{r.location}</div>
                      <div style={{ fontSize: '13px', color: '#aaa', marginTop: '6px' }}>
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
