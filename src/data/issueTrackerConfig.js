import { CAMPUSES } from './campuses';

// Status flow for issues
export const ISSUE_STATUSES = {
  SUBMITTED: 'Submitted',
  TRIAGED: 'Triaged',
  IN_PROGRESS: 'In Progress',
  VENDOR_ASSIGNED: 'Vendor Assigned',
  RESOLVED: 'Resolved',
};

export const STATUS_ORDER = [
  ISSUE_STATUSES.SUBMITTED,
  ISSUE_STATUSES.TRIAGED,
  ISSUE_STATUSES.IN_PROGRESS,
  ISSUE_STATUSES.VENDOR_ASSIGNED,
  ISSUE_STATUSES.RESOLVED,
];

// Map Wrike status names to our app statuses
// Wrike uses custom workflow statuses per space - these are common mappings
export const WRIKE_STATUS_MAP = {
  'New': ISSUE_STATUSES.SUBMITTED,
  'Active': ISSUE_STATUSES.IN_PROGRESS,
  'In Progress': ISSUE_STATUSES.IN_PROGRESS,
  'Completed': ISSUE_STATUSES.RESOLVED,
  'Done': ISSUE_STATUSES.RESOLVED,
  'Deferred': ISSUE_STATUSES.TRIAGED,
  'Cancelled': ISSUE_STATUSES.RESOLVED,
};

// Priority levels
export const PRIORITIES = {
  EMERGENCY: 'Emergency',
  HIGH: 'High',
  STANDARD: 'Standard',
  LOW: 'Low',
};

// Map Wrike importance to our priority
export const WRIKE_PRIORITY_MAP = {
  'High': PRIORITIES.HIGH,
  'Normal': PRIORITIES.STANDARD,
  'Low': PRIORITIES.LOW,
};

// SLA rules: target hours and at-risk threshold hours remaining
export const SLA_RULES = {
  [PRIORITIES.EMERGENCY]: { targetHours: 4, atRiskHoursRemaining: 2 },
  [PRIORITIES.HIGH]: { targetHours: 24, atRiskHoursRemaining: 6 },
  [PRIORITIES.STANDARD]: { targetHours: 48, atRiskHoursRemaining: 12 },
  [PRIORITIES.LOW]: { targetHours: 168, atRiskHoursRemaining: 48 },
};

// SLA status values
export const SLA_STATUS = {
  ON_TRACK: 'on-track',
  AT_RISK: 'at-risk',
  OVERDUE: 'overdue',
};

// Category mapping to facilities pillars
export const ISSUE_CATEGORIES_MAP = {
  'Cleanliness': { pillar: '14.12', label: 'Cleanliness', color: '#3b82f6' },
  'Buildings & Grounds': { pillar: '14.13', label: 'Buildings & Grounds', color: '#8b5cf6' },
  'Mechanical Systems': { pillar: '14.14', label: 'Mechanical Systems', color: '#f59e0b' },
  'Security': { pillar: '--', label: 'Security', color: '#ef4444' },
  'Other': { pillar: '--', label: 'Other', color: '#6b7280' },
};

// Keywords to auto-detect category from task title/description
export const CATEGORY_KEYWORDS = {
  'Cleanliness': ['clean', 'dirty', 'smudge', 'trash', 'restroom', 'stocked', 'mop', 'sweep', 'spill', 'odor', 'dust', 'glass', 'floor'],
  'Buildings & Grounds': ['paint', 'pothole', 'signage', 'landscap', 'door', 'window', 'wall', 'ceiling', 'roof', 'parking', 'fence', 'exterior'],
  'Mechanical Systems': ['hvac', 'plumb', 'leak', 'lighting', 'electrical', 'temperature', 'humidity', 'air condition', 'heat', 'cool', 'sensor'],
  'Security': ['camera', 'lock', 'alarm', 'fire ext', 'badge', 'access', 'security', 'intrusion', 'safety'],
};

// User roles for the prototype dropdown
export const USER_ROLES = {
  EXECUTIVE: 'Executive',
  SITE_OWNER: 'Site Owner',
  CAMPUS_COORDINATOR: 'Campus Coordinator',
};

// Build user list from campuses.js data + executives
export const getIssueTrackerUsers = () => {
  const users = [];

  // Executives
  users.push(
    { name: 'Sean Hubbard', email: 'sean.hubbard@trilogy.com', role: USER_ROLES.EXECUTIVE, campuses: 'All' },
    { name: 'Sam Anderson', email: 'samuel.anderson@trilogy.com', role: USER_ROLES.EXECUTIVE, campuses: 'All' },
  );

  // Site Owners (deduplicated)
  const owners = new Map();
  CAMPUSES.forEach(c => {
    if (c.owner && c.ownerEmail && !owners.has(c.ownerEmail)) {
      owners.set(c.ownerEmail, {
        name: c.owner,
        email: c.ownerEmail,
        role: USER_ROLES.SITE_OWNER,
        campuses: [],
      });
    }
    if (c.owner && c.ownerEmail && owners.has(c.ownerEmail)) {
      owners.get(c.ownerEmail).campuses.push(c.name);
    }
  });
  owners.forEach(o => users.push(o));

  // Campus Coordinators (deduplicated, skip placeholders)
  const ccs = new Map();
  CAMPUSES.forEach(c => {
    if (c.cc && c.ccEmail && c.cc !== 'Hiring CC' && c.cc !== 'Not Yet' && !ccs.has(c.ccEmail)) {
      ccs.set(c.ccEmail, {
        name: c.cc,
        email: c.ccEmail,
        role: USER_ROLES.CAMPUS_COORDINATOR,
        campuses: [c.name],
      });
    }
  });
  ccs.forEach(cc => users.push(cc));

  return users;
};

// Test campus folder ID
export const TEST_CAMPUS_FOLDER_ID = 'MQAAAAED7kv2';
export const TEST_CAMPUS_NAME = 'TESTING - Copy of Ops P2 Template';
