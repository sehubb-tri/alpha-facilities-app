import { ZONES } from '../data/zones';

export const ZoneCard = ({ zoneId, index, defects, isComplete, onClick }) => {
  const zone = ZONES[zoneId];

  const getBackgroundColor = () => {
    if (!isComplete) return '#fff';
    return defects === 0 ? 'rgba(194, 236, 253, 0.3)' : 'rgba(194, 236, 253, 0.5)';
  };

  const getBadgeColor = () => {
    if (!isComplete) return '#e5e7eb';
    return defects === 0 ? '#47C4E6' : '#141685';
  };

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        backgroundColor: getBackgroundColor(),
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: getBadgeColor(),
          color: isComplete ? '#fff' : '#666',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '14px',
          fontWeight: '700',
          fontSize: '15px'
        }}
      >
        {isComplete ? (defects === 0 ? '✓' : defects) : index + 1}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '17px', color: '#092849' }}>{zone.name}</div>
        {zone.description && (
          <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>{zone.description}</div>
        )}
      </div>
      {!zone.amberEligible && (
        <span style={{
          fontSize: '13px',
          backgroundColor: '#C2ECFD',
          color: '#141685',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          ⚠️
        </span>
      )}
    </button>
  );
};
