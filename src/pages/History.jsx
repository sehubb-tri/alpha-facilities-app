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

  const statusColors = {
    GREEN: '#47C4E6',
    AMBER: '#2B57D0',
    RED: '#141685'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header title="Audit History" onBack={() => navigate('/')} />

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '17px' }}>
            Loading...
          </div>
        ) : audits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '17px' }}>No audits yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {audits.map((a, idx) => (
              <div
                key={a.id || idx}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', marginRight: '14px' }}>
                    {a.status === 'GREEN'
                      ? '🟢'
                      : a.status === 'AMBER'
                      ? '🟡'
                      : '🔴'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '17px', color: '#092849' }}>{a.campus}</div>
                    <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                      {a.date} • {a.auditor}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '17px',
                      color: statusColors[a.status] || '#092849'
                    }}>
                      {a.status}
                    </div>
                    <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
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
