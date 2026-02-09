import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SLAIndicator } from './SLAIndicator';
import { ISSUE_CATEGORIES_MAP, PRIORITIES } from '../data/issueTrackerConfig';

const STATUS_COLORS = {
  'Submitted': { bg: '#dbeafe', color: '#1d4ed8' },
  'Triaged': { bg: '#e0e7ff', color: '#4338ca' },
  'In Progress': { bg: '#fef3c7', color: '#b45309' },
  'Vendor Assigned': { bg: '#fce7f3', color: '#be185d' },
  'Resolved': { bg: '#ecfdf5', color: '#059669' },
};

const PRIORITY_COLORS = {
  [PRIORITIES.EMERGENCY]: { bg: '#fef2f2', color: '#dc2626', label: 'EMERGENCY' },
  [PRIORITIES.HIGH]: { bg: '#fff7ed', color: '#ea580c', label: 'HIGH' },
  [PRIORITIES.STANDARD]: { bg: '#f0f9ff', color: '#0284c7', label: 'STANDARD' },
  [PRIORITIES.LOW]: { bg: '#f8fafc', color: '#64748b', label: 'LOW' },
};

export const IssueCard = ({ issue }) => {
  const navigate = useNavigate();
  const statusColor = STATUS_COLORS[issue.status] || STATUS_COLORS['Submitted'];
  const priorityColor = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS[PRIORITIES.STANDARD];
  const categoryInfo = ISSUE_CATEGORIES_MAP[issue.category] || ISSUE_CATEGORIES_MAP['Other'];

  const timeAgo = getTimeAgo(issue.updatedDate || issue.createdDate);

  return (
    <div
      onClick={() => navigate(`/issues/${issue.id}`)}
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        marginBottom: '8px',
      }}
    >
      {/* Top row: title + chevron */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', flex: 1, lineHeight: '1.3' }}>
          {issue.title}
        </div>
        <ChevronRight size={18} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
        {/* Status badge */}
        <span style={{
          fontSize: '11px', fontWeight: '600',
          backgroundColor: statusColor.bg, color: statusColor.color,
          borderRadius: '6px', padding: '2px 8px',
        }}>
          {issue.status}
        </span>

        {/* Priority badge */}
        <span style={{
          fontSize: '10px', fontWeight: '700',
          backgroundColor: priorityColor.bg, color: priorityColor.color,
          borderRadius: '6px', padding: '2px 8px',
          letterSpacing: '0.5px',
        }}>
          {priorityColor.label}
        </span>

        {/* Category badge */}
        <span style={{
          fontSize: '11px', fontWeight: '500',
          color: categoryInfo.color,
          borderRadius: '6px', padding: '2px 8px',
          border: `1px solid ${categoryInfo.color}33`,
        }}>
          {categoryInfo.label}
        </span>

        {/* SLA */}
        <SLAIndicator sla={issue.sla} compact />
      </div>

      {/* Bottom info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
        <span>{issue.submittedBy}</span>
        <span>{timeAgo}</span>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
