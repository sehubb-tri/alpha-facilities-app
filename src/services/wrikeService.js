// ============================================
// WRIKE API INTEGRATION
// Uses Supabase Edge Function to proxy requests (avoids CORS)
// ============================================

import { supabase } from '../supabase/config';

// ============================================
// CAMPUS TO WRIKE FOLDER ID MAPPING
// ============================================
// Each campus has a "01. Request Intake" folder in Wrike
// Add folder IDs here as you set up each campus

const CAMPUS_FOLDER_MAP = {
  // Test campus - use for development/testing
  "TESTING - Copy of Ops P2 Template": "4360915958",

  // Production campuses - add folder IDs as you configure them
  // To find a folder ID: Open the folder in Wrike, look at the URL
  // Example: wrike.com/workspace.htm#/folder/IEAXXXXXXX/...
  // The IEAXXXXXXX part is the folder ID

  // "Alpha School Austin": "FOLDER_ID_HERE",
  // "Alpha High School": "FOLDER_ID_HERE",
  // "Alpha School Miami": "FOLDER_ID_HERE",
  // ... add more as needed
};

/**
 * Get the Wrike folder ID for a campus
 * @param {string} campusName - The campus name from the app
 * @returns {string|null} - The Wrike folder ID or null if not mapped
 */
export const getWrikeFolderForCampus = (campusName) => {
  return CAMPUS_FOLDER_MAP[campusName] || null;
};

/**
 * Check if a campus is configured for Wrike integration
 * @param {string} campusName - The campus name
 * @returns {boolean}
 */
export const isCampusWrikeEnabled = (campusName) => {
  return !!CAMPUS_FOLDER_MAP[campusName];
};

// ============================================
// API HELPERS - Via Supabase Edge Function
// ============================================

/**
 * Make an authenticated request to Wrike API via Edge Function
 * This avoids CORS issues by routing through Supabase
 */
const wrikeRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body } = options;

  console.log(`[Wrike] Calling Edge Function: ${method} ${endpoint}`);
  if (body) {
    console.log('[Wrike] Request body:', JSON.stringify(body).substring(0, 500));
  }

  const { data, error } = await supabase.functions.invoke('wrike-proxy', {
    body: {
      endpoint,
      method,
      body
    }
  });

  console.log('[Wrike] Edge Function response - data:', data ? JSON.stringify(data).substring(0, 500) : 'null');
  console.log('[Wrike] Edge Function response - error:', error);

  if (error) {
    console.error('[Wrike] Edge Function error:', error);
    throw new Error(error.message || 'Wrike API request failed');
  }

  if (data?.error) {
    console.error('[Wrike] API error:', data.error);
    throw new Error(data.error);
  }

  return data;
};

// ============================================
// TASK CREATION
// ============================================

/**
 * Create a task in Wrike
 * @param {string} folderId - The Wrike folder ID to create the task in
 * @param {object} taskData - Task details
 * @returns {object} - The created task
 */
export const createWrikeTask = async (folderId, taskData) => {
  console.log('[Wrike] Creating task in folder:', folderId);
  console.log('[Wrike] Task data:', taskData);

  const { title, description, status = 'Active', priority, dates } = taskData;

  const body = {
    title,
    description,
    status,
  };

  if (priority) {
    body.priority = priority; // 'High', 'Normal', 'Low'
  }

  if (dates) {
    body.dates = dates; // { start: 'YYYY-MM-DD', due: 'YYYY-MM-DD' }
  }

  const result = await wrikeRequest(`/folders/${folderId}/tasks`, {
    method: 'POST',
    body,
  });

  console.log('[Wrike] Task created:', result.data?.[0]?.id);
  return result.data?.[0];
};

/**
 * Add a comment to a Wrike task (useful for adding photo links)
 * @param {string} taskId - The Wrike task ID
 * @param {string} text - The comment text
 */
export const addWrikeComment = async (taskId, text) => {
  const result = await wrikeRequest(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: { text },
  });
  return result.data?.[0];
};

/**
 * Attach a file URL to a Wrike task
 * Note: Wrike requires uploading files, but we can add URLs as comments
 * @param {string} taskId - The Wrike task ID
 * @param {string} url - The photo URL
 * @param {string} description - Optional description
 */
export const attachPhotoUrlToTask = async (taskId, url, description = '') => {
  const text = description
    ? `Photo: ${description}\n${url}`
    : `Photo attached:\n${url}`;

  return addWrikeComment(taskId, text);
};

// ============================================
// HIGH-LEVEL INTEGRATION FUNCTIONS
// ============================================

/**
 * Submit a checklist issue to Wrike as a Request Intake task
 * @param {object} issueData - The issue from the checklist
 * @param {string} campusName - The campus name
 * @param {object} auditorInfo - Auditor name and email
 * @returns {object|null} - The created Wrike task or null if campus not configured
 */
export const submitIssueToWrike = async (issueData, campusName, auditorInfo) => {
  const folderId = getWrikeFolderForCampus(campusName);

  if (!folderId) {
    console.log('[Wrike] Campus not configured for Wrike:', campusName);
    return null;
  }

  try {
    // Format the issue as a Wrike task
    const severity = issueData.instantRed ? 'CRITICAL' : 'Issue';
    const title = `[${campusName}] ${severity}: ${issueData.checkText || issueData.category || 'Issue'}`;

    // Build description with all relevant info
    let description = `**Submitted by:** ${auditorInfo.name} (${auditorInfo.email})\n`;
    description += `**Date:** ${new Date().toLocaleDateString()}\n`;
    description += `**Campus:** ${campusName}\n\n`;

    if (issueData.section) {
      description += `**Section:** ${issueData.section}\n`;
    }

    if (issueData.checkText) {
      description += `**Check:** ${issueData.checkText}\n`;
    }

    if (issueData.explanation) {
      description += `\n**Details:**\n${issueData.explanation}\n`;
    }

    if (issueData.location) {
      description += `\n**Location:** ${issueData.location}\n`;
    }

    // Determine priority based on severity
    const priority = issueData.instantRed ? 'High' : 'Normal';

    // Create the task
    const task = await createWrikeTask(folderId, {
      title,
      description,
      priority,
    });

    // Add photos as comments if present
    if (task && issueData.photos && issueData.photos.length > 0) {
      for (let i = 0; i < issueData.photos.length; i++) {
        const photoUrl = issueData.photos[i];
        if (photoUrl && !photoUrl.startsWith('data:')) {
          // Only add if it's a URL, not base64
          await attachPhotoUrlToTask(task.id, photoUrl, `Photo ${i + 1}`);
        }
      }
    }

    console.log('[Wrike] Issue submitted successfully:', task.id);
    return task;

  } catch (error) {
    console.error('[Wrike] Error submitting issue:', error);
    throw error;
  }
};

/**
 * Submit multiple issues from a checklist to Wrike
 * @param {array} issues - Array of issues from the checklist
 * @param {string} campusName - The campus name
 * @param {object} auditorInfo - Auditor name and email
 * @returns {array} - Array of created tasks (or nulls for failures)
 */
export const submitChecklistIssuesToWrike = async (issues, campusName, auditorInfo) => {
  if (!issues || issues.length === 0) {
    console.log('[Wrike] No issues to submit');
    return [];
  }

  const folderId = getWrikeFolderForCampus(campusName);
  if (!folderId) {
    console.log('[Wrike] Campus not configured for Wrike:', campusName);
    return [];
  }

  console.log(`[Wrike] Submitting ${issues.length} issues to Wrike for ${campusName}`);

  const results = [];
  for (const issue of issues) {
    try {
      const task = await submitIssueToWrike(issue, campusName, auditorInfo);
      results.push(task);
    } catch (error) {
      console.error('[Wrike] Failed to submit issue:', error);
      results.push(null);
    }
  }

  const successCount = results.filter(r => r !== null).length;
  console.log(`[Wrike] Submitted ${successCount}/${issues.length} issues successfully`);

  return results;
};

/**
 * Submit a "See It, Report It" report to Wrike
 * @param {object} reportData - The report data
 * @param {string} campusName - The campus name
 * @returns {object|null} - The created Wrike task or null
 */
export const submitReportToWrike = async (reportData, campusName) => {
  const folderId = getWrikeFolderForCampus(campusName);

  if (!folderId) {
    console.log('[Wrike] Campus not configured for Wrike:', campusName);
    return null;
  }

  try {
    const urgentTag = reportData.urgent ? 'URGENT' : '';
    const title = `[${campusName}] ${urgentTag} ${reportData.category}: ${reportData.location || 'Reported Issue'}`.trim();

    let description = `**Category:** ${reportData.category}\n`;
    description += `**Location:** ${reportData.location || 'Not specified'}\n`;
    description += `**Team:** ${reportData.team || 'Not assigned'}\n`;
    description += `**Urgent:** ${reportData.urgent ? 'Yes' : 'No'}\n`;
    description += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

    if (reportData.note) {
      description += `**Notes:**\n${reportData.note}\n`;
    }

    const priority = reportData.urgent ? 'High' : 'Normal';

    const task = await createWrikeTask(folderId, {
      title,
      description,
      priority,
    });

    // Add photo if present
    if (task && reportData.photo && !reportData.photo.startsWith('data:')) {
      await attachPhotoUrlToTask(task.id, reportData.photo, 'Reported issue');
    }

    console.log('[Wrike] Report submitted successfully:', task.id);
    return task;

  } catch (error) {
    console.error('[Wrike] Error submitting report:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Test the Wrike connection
 * @returns {boolean} - True if connection is successful
 */
export const testWrikeConnection = async () => {
  try {
    const result = await wrikeRequest('/contacts?me=true');
    console.log('[Wrike] Connection test successful. User:', result.data?.[0]?.firstName);
    return true;
  } catch (error) {
    console.error('[Wrike] Connection test failed:', error);
    return false;
  }
};

/**
 * Get folder info (useful for verifying folder IDs)
 * @param {string} folderId - The folder ID to check
 * @returns {object|null} - Folder info or null
 */
export const getWrikeFolderInfo = async (folderId) => {
  try {
    const result = await wrikeRequest(`/folders/${folderId}`);
    return result.data?.[0];
  } catch (error) {
    console.error('[Wrike] Error getting folder info:', error);
    return null;
  }
};
