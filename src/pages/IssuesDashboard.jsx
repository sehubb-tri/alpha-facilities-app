import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileText, Building2, BarChart3 } from 'lucide-react';
import { useIssueTracker } from '../hooks/useIssueTracker';
import { useUserIdentity } from '../hooks/useUserIdentity';
import { UserIdentityDropdown } from '../components/UserIdentityDropdown';
import { CampusHealthCard } from '../components/CampusHealthCard';
import { IssueCard } from '../components/IssueCard';
import { TEST_CAMPUS_NAME } from '../data/issueTrackerConfig';

export const IssuesDashboard = () => {
  const navigate = useNavigate();
  const { selectedUser, selectedUserEmail, setSelectedUser, availableUsers } = useUserIdentity();
  const { issues, stats, campusHealth, loading, error, refresh } = useIssueTracker(selectedUserEmail);

  const recentIssues = issues
    .filter(i => !i.isResolved)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
    .slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        padding: '16px 20px 20px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <ArrowLeft size={18} /> Home
          </button>
          <button onClick={refresh} disabled={loading} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Issue Tracker</h1>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: '2px 0 0' }}>Test Campus Dashboard</p>
          </div>
          <UserIdentityDropdown
            selectedEmail={selectedUserEmail}
            onChange={setSelectedUser}
            users={availableUsers}
          />
        </div>
      </div>

      <div style={{ padding: '16px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Campus Health */}
        <CampusHealthCard
          health={campusHealth}
          campusName={TEST_CAMPUS_NAME}
          onClick={() => navigate('/issues/campus')}
        />

        {/* Quick Nav Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          <NavCard
            icon={<FileText size={20} color="#2B57D0" />}
            title="My Submissions"
            subtitle={selectedUser?.name || 'Select user'}
            onClick={() => navigate('/issues/mine')}
          />
          <NavCard
            icon={<Building2 size={20} color="#2B57D0" />}
            title="Campus Issues"
            subtitle={`${stats.open} open`}
            onClick={() => navigate('/issues/campus')}
          />
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
          marginTop: '16px',
        }}>
          <MiniStat label="Total" value={stats.total} />
          <MiniStat label="Open" value={stats.open} color="#2B57D0" />
          <MiniStat label="At Risk" value={stats.atRisk} color="#d97706" />
          <MiniStat label="Overdue" value={stats.slaViolations} color="#dc2626" />
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '16px', marginTop: '16px', color: '#991b1b', fontSize: '14px',
          }}>
            Failed to load issues: {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            Loading issues from Wrike...
          </div>
        )}

        {/* Recent Open Issues */}
        {!loading && recentIssues.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                Recent Open Issues
              </h2>
              <button onClick={() => navigate('/issues/campus')} style={{
                background: 'none', border: 'none', color: '#2B57D0', cursor: 'pointer',
                fontSize: '13px', fontWeight: '500',
              }}>
                View all
              </button>
            </div>
            {recentIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && issues.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px', color: '#94a3b8',
            marginTop: '20px',
          }}>
            <BarChart3 size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>No issues found</div>
            <div style={{ fontSize: '13px' }}>Issues from checklists and reports will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavCard = ({ icon, title, subtitle, onClick }) => (
  <div onClick={onClick} style={{
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
    border: '1px solid #e2e8f0', cursor: 'pointer',
    transition: 'box-shadow 0.15s',
  }}>
    <div style={{ marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{title}</div>
    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</div>
  </div>
);

const MiniStat = ({ label, value, color = '#1e293b' }) => (
  <div style={{
    backgroundColor: '#fff', borderRadius: '10px', padding: '12px 8px',
    textAlign: 'center', border: '1px solid #e2e8f0',
  }}>
    <div style={{ fontSize: '22px', fontWeight: '700', color }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
  </div>
);
