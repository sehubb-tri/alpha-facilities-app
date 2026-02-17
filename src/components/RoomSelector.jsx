import { hasCampusRooms, getCampusRoomNamesByType, getCampusRoomNames } from '../data/campusRooms';

/**
 * RoomSelector - Shows a dropdown of campus rooms when available, falls back to free text input.
 *
 * Props:
 *   campusName {string} - Selected campus name
 *   value {string} - Current selected/typed room
 *   onChange {function} - Called with new value
 *   placeholder {string} - Placeholder text for input/select
 *   roomTypes {string|string[]} - Filter rooms by type(s). If omitted, shows all rooms.
 *   excludeValues {string[]} - Room names to exclude (e.g., already selected in another dropdown)
 *   style {object} - Optional style overrides
 */
export const RoomSelector = ({
  campusName,
  value,
  onChange,
  placeholder = "Select or enter room...",
  roomTypes,
  excludeValues = [],
  style = {}
}) => {
  const hasRooms = hasCampusRooms(campusName);

  // Get filtered room names
  const allRoomNames = roomTypes
    ? getCampusRoomNamesByType(campusName, roomTypes)
    : getCampusRoomNames(campusName);

  // Exclude already-selected rooms (for multi-select scenarios)
  const availableRooms = allRoomNames.filter(
    name => !excludeValues.includes(name) || name === value
  );

  const baseStyle = {
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    ...style
  };

  if (hasRooms && availableRooms.length > 0) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...baseStyle,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
          color: value ? '#333' : '#999'
        }}
      >
        <option value="">{placeholder}</option>
        {availableRooms.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    );
  }

  // Fallback: free text input
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={baseStyle}
    />
  );
};
