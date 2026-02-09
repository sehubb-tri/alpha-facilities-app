import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Inbox } from 'lucide-react';
import { useIssueTracker } from '../hooks/useIssueTracker';
import { useUserIdentity } from '../hooks/useUserIdentity';
import { UserIdentityDropdown } from '../components/UserIdentityDropdown';
import { IssueCard } from '../components/IssueCard';

export const MySubmissions = () => {
  const navigate = useNavigate();
  const { selectedUser, selectedUserEmail, setSelectedUser, availableUsers } = useUserIdentity();
  const { mySubmissions, loading, error, refresh } = useIssueTracker(selectedUserEmail);

  const openCount = mySubmissions.filter(i => !i.isResolved).length;
  const resolvedCount = mySubmissions.filter(i => i.isResolved).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        padding: '16px 20px 20px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={() => navigate('/issues')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <button onClick={refresh} disabled={loading} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>My Submissions</h1>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: '2px 0 0' }}>
              Viewing as: {selectedUser?.name}
            </p>
          </div>
          <UserIdentityDropdown
            selectedEmail={selectedUserEmail}
            onChange={setSelectedUser}
            users={availableUsers}
          />
        </div>

        {/* Count badges */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>
            {openCount} Open
          </span>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>
            {resolvedCount} Resolved
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            Loading your submissions...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '16px', color: '#991b1b', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Issues list */}
        {!loading && mySubmissions.length > 0 && (
          <>
            {/* Open issues section */}
            {openCount > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Open
                </h3>
                {mySubmissions.filter(i => !i.isResolved).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {/* Resolved issues section */}
            {resolvedCount > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Resolved
                </h3>
                {mySubmissions.filter(i => i.isResolved).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && mySubmissions.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px', color: '#94a3b8',
          }}>
            <Inbox size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>No submissions found</div>
            <div style={{ fontSize: '13px' }}>
              {selectedUser?.name ? `No issues submitted by ${selectedUser.name} in this campus` : 'Select a user to view their submissions'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
