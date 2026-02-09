import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const SLA_CONFIG = {
  'on-track': { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: Clock, label: 'On Track' },
  'at-risk': { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: AlertTriangle, label: 'At Risk' },
  'overdue': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: XCircle, label: 'Overdue' },
  'resolved': { bg: '#f0f9ff', color: '#64748b', border: '#e2e8f0', icon: CheckCircle, label: 'Resolved' },
};

export const SLAIndicator = ({ sla, compact = false }) => {
  if (!sla) return null;
  const config = SLA_CONFIG[sla.status] || SLA_CONFIG['on-track'];
  const Icon = config.icon;

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '12px',
        padding: '2px 8px',
      }}>
        <Icon size={12} />
        {sla.display || config.label}
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: '10px',
      padding: '8px 12px',
    }}>
      <Icon size={16} color={config.color} />
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: config.color }}>
          {config.label}
        </div>
        {sla.display && (
          <div style={{ fontSize: '11px', color: config.color, opacity: 0.8 }}>
            {sla.display}
          </div>
        )}
      </div>
    </div>
  );
};
