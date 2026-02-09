import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const HEALTH_CONFIG = {
  green: {
    bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    border: '#a7f3d0',
    icon: CheckCircle,
    iconColor: '#059669',
    label: 'Healthy',
    textColor: '#065f46',
  },
  amber: {
    bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    border: '#fde68a',
    icon: AlertTriangle,
    iconColor: '#d97706',
    label: 'Needs Attention',
    textColor: '#92400e',
  },
  red: {
    bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    border: '#fecaca',
    icon: Shield,
    iconColor: '#dc2626',
    label: 'Critical',
    textColor: '#991b1b',
  },
};

export const CampusHealthCard = ({ health, campusName, onClick }) => {
  const config = HEALTH_CONFIG[health.status] || HEALTH_CONFIG.green;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <Icon size={28} color={config.iconColor} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: config.textColor }}>
            {config.label}
          </div>
          <div style={{ fontSize: '13px', color: config.textColor, opacity: 0.8 }}>
            {campusName || 'Test Campus'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: config.textColor, marginBottom: '12px' }}>
        {health.reason}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatBadge label="Open" value={health.openCount} />
        <StatBadge label="Resolved" value={health.resolvedCount} />
        {health.slaViolationCount > 0 && (
          <StatBadge label="SLA Violations" value={health.slaViolationCount} highlight />
        )}
        {health.emergencyCount > 0 && (
          <StatBadge label="Emergency" value={health.emergencyCount} highlight />
        )}
      </div>
    </div>
  );
};

const StatBadge = ({ label, value, highlight }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontSize: '20px',
      fontWeight: '700',
      color: highlight ? '#dc2626' : '#1e293b',
    }}>
      {value}
    </div>
    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </div>
  </div>
);
