import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAudits, getReports, getBGWalkthroughs } from '../supabase/services';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { useI18n } from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Zap, ClipboardList, Camera, ChevronRight, BookOpen, Send } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [audits, setAudits] = useState([]);
  const [reports, setReports] = useState([]);
  const [bgWalkthroughs, setBgWalkthroughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  // Detect landscape orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight && window.innerHeight < 500;
      setIsLandscape(isLandscapeMode);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [auditsData, reportsData, bgData] = await Promise.all([
          getAudits(10),
          getReports(10),
          getBGWalkthroughs(null, 10)
        ]);
        setAudits(auditsData);
        setReports(reportsData);
        setBgWalkthroughs(bgData);
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
      ...bgWalkthroughs.map(bg => ({
        ...bg,
        type: 'bg',
        sortDate: new Date(bg.createdAt || bg.date + ' ' + bg.time)
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
          } else if (item.type === 'bg') {
            return (
              <div
                key={`bg-${item.id || idx}`}
                onClick={() => item.id && navigate(`/bg/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  cursor: item.id ? 'pointer' : 'default'
                }}
              >
                <span style={{ fontSize: '24px', marginRight: '14px' }}>🏢</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '17px', color: '#092849' }}>{item.campus}</div>
                  <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                    {item.date} • B&G • {item.campusRating || 'N/A'}
                  </div>
                </div>
                <span style={{
                  fontSize: '14px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: item.campusRating === 'PASS' ? '#10b981' : '#ef4444',
                  color: '#fff',
                  fontWeight: '500'
                }}>
                  {item.campusRating || 'N/A'}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '20px', marginLeft: '8px' }}>›</span>
              </div>
            );
          } else {
            const cat = ISSUE_CATEGORIES.find(c => c.id === item.category) || {
              icon: '📸',
              name: 'See It, Report It'
            };
            return (
              <div
                key={`report-${item.id || idx}`}
                onClick={() => item.id && navigate(`/report/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '12px',
                  cursor: item.id ? 'pointer' : 'default'
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
                <span style={{ color: '#9ca3af', fontSize: '20px', marginLeft: '8px' }}>›</span>
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
      <div style={{ padding: isLandscape ? '8px 24px' : '16px 24px 20px', textAlign: 'center' }}>
        <img
          src="/Alpha School Logo - Blue.png"
          alt="Alpha School"
          style={{
            maxWidth: isLandscape ? '100px' : '140px',
            width: 'auto',
            filter: 'brightness(0) invert(1)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Main 3 Buttons */}
      <div style={{ padding: '0 20px 20px' }}>
        {/* Green Streak Walk - Primary CTA */}
        <button
          onClick={() => navigate('/green-streak')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={32} color="#fff" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>
              Green Streak Walk
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
              Daily CC oversight check - 15 min
            </div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
        </button>

        {/* Two-column row for Ops Audits and Report It */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Ops Audits */}
          <button
            onClick={() => navigate('/ops-audits')}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '16px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ClipboardList size={26} color="#fff" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#092849' }}>
                Ops Audits
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Detailed checklists
              </div>
            </div>
          </button>

          {/* See It Report It */}
          <button
            onClick={() => navigate('/report')}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '16px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={26} color="#fff" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#092849' }}>
                See It Report It
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Log an issue
              </div>
            </div>
            {openReports > 0 && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                {openReports}
              </div>
            )}
          </button>
        </div>

        {/* External Links Row - Knowledge Hub & Wrike Requests */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          {/* Ops Knowledge Hub */}
          <a
            href="https://ops-handbook-ai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#2B57D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={26} color="#fff" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                Knowledge Hub
              </div>
              <div style={{ fontSize: '12px', color: '#C2ECFD', marginTop: '2px' }}>
                How do we do X?
              </div>
            </div>
          </a>

          {/* Wrike Request Form */}
          <a
            href="https://www.wrike.com/frontend/requestforms/index.html?token=eyJhY2NvdW50SWQiOjY3NDg0NDYsInRhc2tGb3JtSWQiOjI1Nzk5MTJ9CTQ5MjM5MzE4NDU3NTIJNTNlZmY5OGU2MzA2OWIyYWI5OWQ5NWJjNmIxMzg0OWVkZjNmNGNlZGJkNmViMTc5YzQ0YWEzZWNlNmZiZmRmNg=="
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#14b8a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={26} color="#fff" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                Submit Request
              </div>
              <div style={{ fontSize: '12px', color: '#C2ECFD', marginTop: '2px' }}>
                Campus requests
              </div>
            </div>
          </a>
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
