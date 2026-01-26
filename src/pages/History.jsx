import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getAudits, getBGWalkthroughs } from '../supabase/services';

export const History = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [bgWalkthroughs, setBgWalkthroughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'audits', 'bg'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [auditsData, bgData] = await Promise.all([
          getAudits(50),
          getBGWalkthroughs(null, 50)
        ]);
        setAudits(auditsData);
        setBgWalkthroughs(bgData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statusColors = {
    GREEN: '#47C4E6',
    AMBER: '#2B57D0',
    RED: '#141685'
  };

  // Combine and sort all items
  const getCombinedItems = () => {
    let items = [];

    if (filter === 'all' || filter === 'audits') {
      items = [...items, ...audits.map(a => ({
        ...a,
        type: 'audit',
        sortDate: new Date(a.createdAt || a.date + ' ' + a.time)
      }))];
    }

    if (filter === 'all' || filter === 'bg') {
      items = [...items, ...bgWalkthroughs.map(bg => ({
        ...bg,
        type: 'bg',
        sortDate: new Date(bg.createdAt || bg.date + ' ' + bg.time)
      }))];
    }

    return items.sort((a, b) => b.sortDate - a.sortDate);
  };

  const combinedItems = getCombinedItems();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header title="History" onBack={() => navigate('/')} />

      <div style={{ padding: '20px' }}>
        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          backgroundColor: '#fff',
          padding: '6px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? '#092849' : 'transparent',
              color: filter === 'all' ? '#fff' : '#666'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('audits')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filter === 'audits' ? '#092849' : 'transparent',
              color: filter === 'audits' ? '#fff' : '#666'
            }}
          >
            Cleanliness
          </button>
          <button
            onClick={() => setFilter('bg')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filter === 'bg' ? '#092849' : 'transparent',
              color: filter === 'bg' ? '#fff' : '#666'
            }}
          >
            B&G
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '17px' }}>
            Loading...
          </div>
        ) : combinedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '17px' }}>No records yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {combinedItems.map((item, idx) => {
              if (item.type === 'audit') {
                return (
                  <div
                    key={`audit-${item.id || idx}`}
                    onClick={() => item.id && navigate(`/audit/${item.id}`)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: item.id ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '28px', marginRight: '14px' }}>
                        {item.status === 'GREEN' ? '🟢' : item.status === 'AMBER' ? '🟡' : '🔴'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '17px', color: '#092849' }}>{item.campus}</div>
                        <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                          {item.date} • {item.auditor}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginTop: '4px',
                          display: 'inline-block',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          Cleanliness
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginRight: '8px' }}>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '17px',
                          color: statusColors[item.status] || '#092849'
                        }}>
                          {item.status}
                        </div>
                        <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                          {item.defects} defect{item.defects !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: '24px' }}>›</span>
                    </div>
                  </div>
                );
              } else {
                // B&G Walkthrough
                return (
                  <div
                    key={`bg-${item.id || idx}`}
                    onClick={() => item.id && navigate(`/bg/${item.id}`)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      cursor: item.id ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '28px', marginRight: '14px' }}>🏢</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '17px', color: '#092849' }}>{item.campus}</div>
                        <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                          {item.date} • {item.auditor}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginTop: '4px',
                          display: 'inline-block',
                          backgroundColor: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          B&G Walkthrough
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginRight: '8px' }}>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '17px',
                          color: item.campusRating === 'PASS' ? '#10b981' : '#ef4444'
                        }}>
                          {item.campusRating || 'N/A'}
                        </div>
                        <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                          {item.totalIssues || 0} issue{item.totalIssues !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: '24px' }}>›</span>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
