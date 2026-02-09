import { USER_ROLES } from '../data/issueTrackerConfig';

export const UserIdentityDropdown = ({ selectedEmail, onChange, users }) => {
  const grouped = {
    [USER_ROLES.EXECUTIVE]: users.filter(u => u.role === USER_ROLES.EXECUTIVE),
    [USER_ROLES.SITE_OWNER]: users.filter(u => u.role === USER_ROLES.SITE_OWNER),
    [USER_ROLES.CAMPUS_COORDINATOR]: users.filter(u => u.role === USER_ROLES.CAMPUS_COORDINATOR),
  };

  return (
    <select
      value={selectedEmail}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        color: '#092849',
        cursor: 'pointer',
        maxWidth: '220px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      {Object.entries(grouped).map(([role, roleUsers]) => (
        roleUsers.length > 0 && (
          <optgroup key={role} label={role}>
            {roleUsers.map(u => (
              <option key={u.email} value={u.email}>
                {u.name}
              </option>
            ))}
          </optgroup>
        )
      ))}
    </select>
  );
};
