import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAudits, getReports } from '../supabase/services';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
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
          <p style={{ fontSize: '17px' }}>{t('history.noAudits')}</p>
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
                onClick={() => item.id && navigate(`/audit/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  cursor: item.id ? 'pointer' : 'default'
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
                <span style={{ color: '#9ca3af', fontSize: '20px' }}>›</span>
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
      {/* Header with Language Switcher and Settings */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '10px',
          padding: '4px 8px'
        }}>
          <LanguageSwitcher style="dropdown" />
        </div>
        <button
          onClick={() => navigate('/settings')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '22px'
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Logo Section */}
      <div style={{ padding: '30px 24px 30px', textAlign: 'center' }}>
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
            <span style={{ textAlign: 'center', lineHeight: '1.3' }}>{t('nav.report')}</span>
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
            <span style={{ textAlign: 'center', lineHeight: '1.3' }}>{t('nav.audit')}</span>
          </button>
        </div>

        {/* Weekly B&G Button */}
        <button
          onClick={() => navigate('/bg/setup')}
          style={{
            width: '100%',
            marginTop: '16px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '700',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            cursor: 'pointer',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '28px' }}>🏢</span>
          <span>Weekly B&G Walkthrough</span>
          <span style={{
            fontSize: '12px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            NEW
          </span>
        </button>
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
            <div style={{ fontSize: '15px', color: '#C2ECFD', marginTop: '4px' }}>{t('history.audits')}</div>
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
            <div style={{ fontSize: '15px', color: '#C2ECFD', marginTop: '4px' }}>{t('history.reports')}</div>
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
          {t('history.title')}
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>{t('common.loading')}</div>
        ) : (
          renderRecentActivity()
        )}
      </div>
    </div>
  );
};
