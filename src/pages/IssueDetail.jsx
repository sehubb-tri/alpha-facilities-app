import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, Image } from 'lucide-react';
import { fetchTaskDetail, fetchTaskComments, normalizeWrikeTask, calculateSLA, buildTimeline } from '../services/issueTrackerService';
import { SLAIndicator } from '../components/SLAIndicator';
import { StatusTimeline } from '../components/StatusTimeline';
import { ISSUE_CATEGORIES_MAP, SLA_RULES } from '../data/issueTrackerConfig';

export const IssueDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [task, comments] = await Promise.all([
          fetchTaskDetail(taskId),
          fetchTaskComments(taskId).catch(() => []),
        ]);
        if (!task) throw new Error('Task not found');
        const normalized = normalizeWrikeTask(task);
        const sla = calculateSLA(normalized);
        setIssue({ ...normalized, sla });
        setTimeline(buildTimeline(normalized, comments));
      } catch (err) {
        console.error('[IssueDetail] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (taskId) load();
  }, [taskId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
          Loading issue...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2B57D0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', color: '#991b1b' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const categoryInfo = ISSUE_CATEGORIES_MAP[issue.category] || ISSUE_CATEGORIES_MAP['Other'];
  const slaRule = SLA_RULES[issue.priority];
  const created = new Date(issue.createdDate);
  const updated = new Date(issue.updatedDate);

  // Strip HTML from description for display
  const plainDescription = issue.description
    ?.replace(/<br\s*\/?>/gi, '\n')
    ?.replace(/<[^>]*>/g, '')
    ?.trim() || '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        padding: '16px 20px 20px',
        color: '#fff',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', marginBottom: '12px' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, lineHeight: '1.3' }}>
          {issue.title}
        </h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <Badge bg="rgba(255,255,255,0.15)" color="#fff">{issue.status}</Badge>
          <Badge bg="rgba(255,255,255,0.1)" color="#fff">{issue.priority}</Badge>
          <Badge bg={`${categoryInfo.color}33`} color="#fff">{categoryInfo.label}</Badge>
        </div>
      </div>

      <div style={{ padding: '16px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* SLA Card */}
        <SLAIndicator sla={issue.sla} />

        {/* Details Card */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
          border: '1px solid #e2e8f0', marginTop: '12px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Details
          </h3>
          <DetailRow label="Submitted By" value={issue.submittedBy} />
          {issue.submittedByEmail && <DetailRow label="Email" value={issue.submittedByEmail} />}
          <DetailRow label="Campus" value={issue.campus} />
          <DetailRow label="Category" value={`${categoryInfo.label} ${categoryInfo.pillar !== '--' ? `(${categoryInfo.pillar})` : ''}`} />
          <DetailRow label="Priority" value={issue.priority} />
          <DetailRow label="Assigned To" value={issue.assignedTo} />
          <DetailRow label="Created" value={formatDate(created)} />
          <DetailRow label="Last Updated" value={formatDate(updated)} />
          <DetailRow label="SLA Target" value={`${slaRule.targetHours}h from submission`} />
          {issue.permalink && (
            <a href={issue.permalink} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              color: '#2B57D0', fontSize: '13px', marginTop: '8px', textDecoration: 'none',
            }}>
              Open in Wrike <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Photos */}
        {issue.photos.length > 0 && (
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
            border: '1px solid #e2e8f0', marginTop: '12px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Photos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {issue.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Photo ${i + 1}`} style={{
                    width: '100%', height: '100px', objectFit: 'cover',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                  }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
          border: '1px solid #e2e8f0', marginTop: '12px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Status Timeline
          </h3>
          {timeline.length > 0 ? (
            <StatusTimeline events={timeline} />
          ) : (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px' }}>
              No timeline events available
            </div>
          )}
        </div>

        {/* Description excerpt */}
        {plainDescription && (
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
            border: '1px solid #e2e8f0', marginTop: '12px', marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Description
            </h3>
            <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
              {plainDescription.substring(0, 1000)}
              {plainDescription.length > 1000 ? '...' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Badge = ({ bg, color, children }) => (
  <span style={{
    backgroundColor: bg, color, borderRadius: '8px',
    padding: '3px 10px', fontSize: '12px', fontWeight: '600',
  }}>
    {children}
  </span>
);

const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
  </div>
);

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
