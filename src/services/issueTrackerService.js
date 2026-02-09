import { supabase } from '../supabase/config';
import {
  WRIKE_STATUS_MAP, WRIKE_PRIORITY_MAP, PRIORITIES,
  SLA_RULES, SLA_STATUS, ISSUE_STATUSES,
  CATEGORY_KEYWORDS, TEST_CAMPUS_FOLDER_ID,
} from '../data/issueTrackerConfig';

// Reuse the same proxy pattern from wrikeService.js
const wrikeRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body } = options;
  console.log(`[IssueTracker] Wrike: ${method} ${endpoint}`);

  const { data, error } = await supabase.functions.invoke('wrike-proxy', {
    body: { endpoint, method, body }
  });

  if (error) {
    console.error('[IssueTracker] Edge Function error:', error);
    throw new Error(error.message || 'Wrike API request failed');
  }
  if (data?.error) {
    console.error('[IssueTracker] API error:', data.error);
    throw new Error(data.error);
  }
  return data;
};

// Fetch all tasks from a Wrike folder
export const fetchFolderTasks = async (folderId = TEST_CAMPUS_FOLDER_ID) => {
  const fields = encodeURIComponent(JSON.stringify([
    'description', 'briefDescription', 'responsibleIds',
    'status', 'importance', 'createdDate', 'updatedDate',
    'dates', 'customFields', 'parentIds', 'permalink'
  ]));
  const data = await wrikeRequest(`/folders/${folderId}/tasks?fields=${fields}&sortField=CreatedDate&sortOrder=Desc&limit=100`);
  return data?.data || [];
};

// Fetch a single task by ID with full detail
export const fetchTaskDetail = async (taskId) => {
  const fields = encodeURIComponent(JSON.stringify([
    'description', 'briefDescription', 'responsibleIds',
    'status', 'importance', 'createdDate', 'updatedDate',
    'dates', 'customFields', 'parentIds', 'permalink',
    'authorIds', 'hasAttachments'
  ]));
  const data = await wrikeRequest(`/tasks/${taskId}?fields=${fields}`);
  return data?.data?.[0] || null;
};

// Fetch task comments (used for timeline)
export const fetchTaskComments = async (taskId) => {
  const data = await wrikeRequest(`/tasks/${taskId}/comments`);
  return data?.data || [];
};

// Extract campus name from task title (format: [Campus Name] ...)
const extractCampusFromTitle = (title) => {
  const match = title?.match(/^\[([^\]]+)\]/);
  return match ? match[1] : 'Unknown Campus';
};

// Extract auditor info from HTML description
const extractSubmitterFromDescription = (description) => {
  const nameMatch = description?.match(/<b>(?:Auditor|Submitted by|Coordinator|Reporter)[^<]*:<\/b>\s*([^<\n]+)/i);
  const emailMatch = description?.match(/<b>(?:Auditor Email|Email)[^<]*:<\/b>\s*([^<\n\s]+)/i);
  return {
    name: nameMatch ? nameMatch[1].trim() : 'Unknown',
    email: emailMatch ? emailMatch[1].trim() : '',
  };
};

// Extract photo URLs from description
const extractPhotosFromDescription = (description) => {
  if (!description) return [];
  const urls = [];
  const regex = /href="([^"]*supabase[^"]*photos[^"]*)"/gi;
  let match;
  while ((match = regex.exec(description)) !== null) {
    urls.push(match[1]);
  }
  // Also check for direct image URLs
  const imgRegex = /src="([^"]*supabase[^"]*photos[^"]*)"/gi;
  while ((match = imgRegex.exec(description)) !== null) {
    urls.push(match[1]);
  }
  return urls;
};

// Detect category from title and description
const detectCategory = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  return 'Other';
};

// Detect if issue is emergency from title/description
const detectEmergency = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  const emergencyKeywords = ['emergency', 'urgent', '🚨', 'fire', 'flood', 'safety hazard', 'water leak', 'hvac fail'];
  return emergencyKeywords.some(kw => text.includes(kw));
};

// Normalize a Wrike task into our issue data model
export const normalizeWrikeTask = (task) => {
  const campus = extractCampusFromTitle(task.title);
  const submitter = extractSubmitterFromDescription(task.description);
  const photos = extractPhotosFromDescription(task.description);
  const category = detectCategory(task.title, task.description);
  const isEmergency = detectEmergency(task.title, task.description);

  // Map Wrike status
  const wrikeStatus = task.status;
  const status = WRIKE_STATUS_MAP[wrikeStatus] || ISSUE_STATUSES.SUBMITTED;

  // Map priority
  const wrikePriority = task.importance;
  let priority = WRIKE_PRIORITY_MAP[wrikePriority] || PRIORITIES.STANDARD;
  if (isEmergency) priority = PRIORITIES.EMERGENCY;

  const createdDate = task.createdDate;
  const updatedDate = task.updatedDate;

  // Calculate SLA deadline
  const slaRule = SLA_RULES[priority];
  const slaDeadline = new Date(new Date(createdDate).getTime() + slaRule.targetHours * 60 * 60 * 1000).toISOString();

  // Clean title (remove [Campus] prefix)
  const cleanTitle = task.title?.replace(/^\[[^\]]+\]\s*/, '') || task.title;

  return {
    id: task.id,
    title: cleanTitle,
    rawTitle: task.title,
    status,
    wrikeStatus,
    priority,
    category,
    campus,
    submittedBy: submitter.name,
    submittedByEmail: submitter.email,
    assignedTo: task.responsibleIds?.length ? 'Assigned' : 'Unassigned',
    createdDate,
    updatedDate,
    slaDeadline,
    description: task.description,
    briefDescription: task.briefDescription,
    photos,
    permalink: task.permalink,
    isResolved: status === ISSUE_STATUSES.RESOLVED,
    isEmergency,
  };
};

// Calculate SLA status for an issue
export const calculateSLA = (issue) => {
  if (issue.isResolved) {
    return { status: 'resolved', label: 'Resolved', hoursRemaining: 0 };
  }

  const now = Date.now();
  const deadline = new Date(issue.slaDeadline).getTime();
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
  const slaRule = SLA_RULES[issue.priority];

  if (hoursRemaining <= 0) {
    return {
      status: SLA_STATUS.OVERDUE,
      label: 'Overdue',
      hoursRemaining,
      display: formatTimeAgo(Math.abs(hoursRemaining)),
    };
  }

  if (hoursRemaining <= slaRule.atRiskHoursRemaining) {
    return {
      status: SLA_STATUS.AT_RISK,
      label: 'At Risk',
      hoursRemaining,
      display: formatTimeRemaining(hoursRemaining),
    };
  }

  return {
    status: SLA_STATUS.ON_TRACK,
    label: 'On Track',
    hoursRemaining,
    display: formatTimeRemaining(hoursRemaining),
  };
};

// Format hours into readable time remaining
const formatTimeRemaining = (hours) => {
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  }
  if (hours >= 1) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m remaining` : `${h}h remaining`;
  }
  return `${Math.round(hours * 60)}m remaining`;
};

const formatTimeAgo = (hours) => {
  if (hours >= 48) {
    return `${Math.floor(hours / 24)}d overdue`;
  }
  if (hours >= 1) {
    return `${Math.floor(hours)}h overdue`;
  }
  return `${Math.round(hours * 60)}m overdue`;
};

// Calculate campus health from a list of issues
export const calculateCampusHealth = (issues) => {
  const openIssues = issues.filter(i => !i.isResolved);
  const emergencyOpen = openIssues.filter(i => i.isEmergency);
  const slaViolations = openIssues.filter(i => calculateSLA(i).status === SLA_STATUS.OVERDUE);
  const atRisk = openIssues.filter(i => calculateSLA(i).status === SLA_STATUS.AT_RISK);

  let status = 'green';
  let reason = 'All clear';

  if (emergencyOpen.length > 0 || slaViolations.length > 0) {
    status = 'red';
    reason = emergencyOpen.length > 0
      ? `${emergencyOpen.length} open emergency issue${emergencyOpen.length > 1 ? 's' : ''}`
      : `${slaViolations.length} SLA violation${slaViolations.length > 1 ? 's' : ''}`;
  } else if (openIssues.length > 2 || atRisk.length > 0) {
    status = 'amber';
    reason = atRisk.length > 0
      ? `${atRisk.length} issue${atRisk.length > 1 ? 's' : ''} approaching SLA`
      : `${openIssues.length} open issues`;
  }

  return {
    status,
    reason,
    openCount: openIssues.length,
    resolvedCount: issues.length - openIssues.length,
    emergencyCount: emergencyOpen.length,
    slaViolationCount: slaViolations.length,
    atRiskCount: atRisk.length,
    totalCount: issues.length,
  };
};

// Build a simple timeline from task data + comments
export const buildTimeline = (task, comments = []) => {
  const events = [];

  // Created
  events.push({
    status: 'Submitted',
    timestamp: task.createdDate,
    note: `Issue created`,
    who: task.submittedBy || 'Unknown',
  });

  // Add comment-based events
  comments.forEach(comment => {
    const text = comment.text?.replace(/<[^>]*>/g, '') || '';
    events.push({
      status: 'Update',
      timestamp: comment.createdDate,
      note: text.substring(0, 200),
      who: comment.authorId || 'Ops Team',
    });
  });

  // If resolved, add resolution event
  if (task.isResolved || task.status === ISSUE_STATUSES.RESOLVED) {
    events.push({
      status: 'Resolved',
      timestamp: task.updatedDate,
      note: 'Issue resolved',
      who: 'Ops Team',
    });
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return events;
};
