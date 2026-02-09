import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Filter } from 'lucide-react';
import { useIssueTracker } from '../hooks/useIssueTracker';
import { CampusHealthCard } from '../components/CampusHealthCard';
import { IssueCard } from '../components/IssueCard';
import { ISSUE_CATEGORIES_MAP, PRIORITIES, ISSUE_STATUSES, TEST_CAMPUS_NAME } from '../data/issueTrackerConfig';

export const CampusIssues = () => {
  const navigate = useNavigate();
  const {
    filteredIssues, campusHealth, loading, error, refresh,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
  } = useIssueTracker();

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    return new Date(b.createdDate) - new Date(a.createdDate);
  });

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

        <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Campus Issues</h1>
        <p style={{ fontSize: '13px', opacity: 0.7, margin: '2px 0 0' }}>{TEST_CAMPUS_NAME}</p>
      </div>

      <div style={{ padding: '16px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Health Card */}
        <CampusHealthCard health={campusHealth} campusName={TEST_CAMPUS_NAME} />

        {/* Filters */}
        <div style={{
          display: 'flex', gap: '8px', marginTop: '16px',
          overflowX: 'auto', paddingBottom: '4px',
        }}>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'open', label: 'Open Only' },
              { value: 'resolved', label: 'Resolved' },
              ...Object.values(ISSUE_STATUSES).map(s => ({ value: s, label: s })),
            ]}
          />
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: 'all', label: 'All Categories' },
              ...Object.keys(ISSUE_CATEGORIES_MAP).map(c => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priority' },
              ...Object.values(PRIORITIES).map(p => ({ value: p, label: p })),
            ]}
          />
        </div>

        {/* Results count */}
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '12px', marginBottom: '8px' }}>
          {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
          {(categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && ' (filtered)'}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            Loading campus issues...
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
        {!loading && sortedIssues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}

        {/* Empty */}
        {!loading && !error && sortedIssues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <Filter size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <div style={{ fontSize: '15px', fontWeight: '500' }}>No issues match filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: '6px 10px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      backgroundColor: value !== 'all' ? '#eff6ff' : '#fff',
      fontSize: '13px',
      color: '#1e293b',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);
