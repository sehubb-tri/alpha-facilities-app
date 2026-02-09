const STATUS_DOTS = {
  'Submitted': '#3b82f6',
  'Triaged': '#6366f1',
  'In Progress': '#f59e0b',
  'Vendor Assigned': '#ec4899',
  'Resolved': '#10b981',
  'Update': '#94a3b8',
};

export const StatusTimeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div style={{ padding: '4px 0' }}>
      {events.map((event, i) => {
        const dotColor = STATUS_DOTS[event.status] || '#94a3b8';
        const isLast = i === events.length - 1;
        const date = new Date(event.timestamp);
        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return (
          <div key={i} style={{ display: 'flex', gap: '12px', minHeight: isLast ? 'auto' : '52px' }}>
            {/* Timeline line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: dotColor, flexShrink: 0,
                border: '2px solid #fff',
                boxShadow: `0 0 0 2px ${dotColor}40`,
              }} />
              {!isLast && (
                <div style={{
                  width: '2px', flex: 1,
                  backgroundColor: '#e2e8f0',
                  marginTop: '2px',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : '16px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  {event.status}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {formatted}
                </span>
              </div>
              {event.note && (
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>
                  {event.note}
                </div>
              )}
              {event.who && event.who !== 'Unknown' && (
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  by {event.who}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
