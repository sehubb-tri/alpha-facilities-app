import { getCampusesByState } from '../data/campuses';

export const CampusSelector = ({ value, onChange, id = 'campus' }) => {
  const byState = getCampusesByState();

  return (
    <select
      id={id}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-gray-300 rounded-xl p-4 bg-white"
      style={{ fontSize: '18px', minHeight: '56px' }}
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
