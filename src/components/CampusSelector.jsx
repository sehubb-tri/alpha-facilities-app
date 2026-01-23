import { getCampusesByState } from '../data/campuses';

export const CampusSelector = ({ value, onChange, id = 'campus' }) => {
  const byState = getCampusesByState();

  return (
    <select
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '14px 16px',
        fontSize: '17px',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '20px',
        paddingRight: '44px'
      }}
    >
      <option value="">Select campus...</option>
      {Object.keys(byState).sort().map(state => (
        <optgroup key={state} label={state}>
          {byState[state].map(c => (
            <option key={c.name} value={c.name}>
              {c.name} — {c.city}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};
