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

// Default test folder - used for ALL campuses during testing
// From URL: wrike.com/workspace.htm?acc=6748446#/folder/4360915958/...
// Numeric ID 4360915958 needs to be converted to alphanumeric v4 ID
const TEST_FOLDER_ID = null; // Will be set after we look it up

const CAMPUS_FOLDER_MAP = {
  // Test campus - use for development/testing
  // NOTE: Wrike API v4 requires alphanumeric IDs, not numeric IDs from URLs
  "TESTING - Copy of Ops P2 Template": "MQAAAAED7kv2",

  // Production campuses - add folder IDs as you configure them
  // To find a folder ID: Use wrikeDebug.getFolderFromPermalink("4360915958") in console
  // The returned id field is the alphanumeric ID to use here

  // "Alpha School Austin": "FOLDER_ID_HERE",
  // "Alpha High School": "FOLDER_ID_HERE",
  // "Alpha School Miami": "FOLDER_ID_HERE",
  // ... add more as needed
};

// TESTING MODE: Set to true to send ALL campuses to the test folder
const TESTING_MODE = true;
const DEFAULT_TEST_FOLDER = "MQAAAAED7kv2"; // Test folder ID

/**
 * Get the Wrike folder ID for a campus
 * @param {string} campusName - The campus name from the app
 * @returns {string|null} - The Wrike folder ID or null if not mapped
 */
export const getWrikeFolderForCampus = (campusName) => {
  // In testing mode, use test folder for all campuses
  if (TESTING_MODE) {
    console.log('[Wrike] TESTING MODE: Using test folder for campus:', campusName);
    return DEFAULT_TEST_FOLDER;
  }
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
// REQUEST FORM SUBMISSION
// ============================================

// Request form ID for Green Streak Walk submissions
// To find this: In Wrike, go to your request form, click "Share", copy the form URL
// The URL will be like: wrike.com/form/eyJhY2NvdW50...  - the part after /form/ is the ID
const GREEN_STREAK_REQUEST_FORM_ID = null; // SET THIS TO YOUR REQUEST FORM ID

/**
 * Submit a request via Wrike Request Form
 * @param {string} requestFormId - The Wrike request form ID
 * @param {object} formData - The form field values
 * @returns {object} - The created request
 */
export const submitWrikeRequest = async (requestFormId, formData) => {
  console.log('[Wrike] Submitting request to form:', requestFormId);
  console.log('[Wrike] Form data:', formData);

  const result = await wrikeRequest(`/request_forms/${requestFormId}/requests`, {
    method: 'POST',
    body: formData,
  });

  console.log('[Wrike] Request submitted:', result.data?.[0]?.id);
  return result.data?.[0];
};

// ============================================
// TASK CREATION (Fallback)
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

  const { title, description, priority, dates } = taskData;

  // Minimal body - only include fields that Wrike API definitely accepts
  // NOTE: Removed 'status' - it requires exact match to workspace workflow status names
  // Wrike will use the default status for new tasks
  const body = {
    title,
    description,
  };

  if (priority) {
    body.importance = priority; // Wrike uses 'importance' not 'priority'. Values: 'High', 'Normal', 'Low'
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
 * Attach a file from URL to a Wrike task
 * @param {string} taskId - The Wrike task ID
 * @param {string} url - The photo URL to attach
 * @param {string} filename - Optional filename for the attachment
 */
export const attachUrlToTask = async (taskId, url, filename = 'photo.jpg') => {
  console.log(`[Wrike] Attaching URL to task ${taskId}:`, url);

  const result = await wrikeRequest(`/tasks/${taskId}/attachments`, {
    method: 'POST',
    body: { url, filename },
    isAttachment: true  // Flag for edge function to handle differently
  });

  console.log('[Wrike] Attachment result:', result);
  return result.data?.[0];
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

/**
 * Get folder info from a Wrike permalink (to find the alphanumeric v4 ID)
 * @param {string} numericId - The numeric folder ID from the URL
 * @returns {object|null} - Folder info including the v4 ID
 */
export const getFolderFromPermalink = async (numericId) => {
  try {
    const permalink = `https://www.wrike.com/open.htm?id=${numericId}`;
    console.log('[Wrike] Looking up folder from permalink:', permalink);
    const result = await wrikeRequest(`/folders?permalink=${encodeURIComponent(permalink)}`);
    console.log('[Wrike] Folder lookup result:', result);
    if (result.data && result.data.length > 0) {
      const folder = result.data[0];
      console.log('[Wrike] Found folder!');
      console.log('[Wrike] Title:', folder.title);
      console.log('[Wrike] Alphanumeric ID (use this!):', folder.id);
      return folder;
    }
    return null;
  } catch (error) {
    console.error('[Wrike] Error looking up folder:', error);
    return null;
  }
};

/**
 * List all folders (to help find folder IDs)
 */
export const listAllFolders = async () => {
  try {
    console.log('[Wrike] Fetching all folders...');
    const result = await wrikeRequest('/folders');
    console.log('[Wrike] Found', result.data?.length, 'folders');
    result.data?.forEach(f => {
      console.log(`[Wrike] Folder: "${f.title}" -> ID: ${f.id}`);
    });
    return result.data;
  } catch (error) {
    console.error('[Wrike] Error listing folders:', error);
    return null;
  }
};

// Expose debug functions on window for console access
if (typeof window !== 'undefined') {
  window.wrikeDebug = {
    listAllFolders,
    getFolderFromPermalink,
    testWrikeConnection,
    getWrikeFolderInfo,
    createWrikeTask,
    // Quick test function to create a test task
    createTestTask: async () => {
      console.log('[Wrike] Creating test task...');
      try {
        const task = await createWrikeTask('MQAAAAED7kv2', {
          title: '[TEST] Manual task creation test - ' + new Date().toLocaleTimeString(),
          description: 'Testing if task creation works directly from console',
          priority: 'Normal'
        });
        console.log('[Wrike] ✅ Test task created successfully!', task);
        return task;
      } catch (error) {
        console.error('[Wrike] ❌ Test task creation failed:', error);
        throw error;
      }
    }
  };
  console.log('[Wrike] Debug functions available: window.wrikeDebug.listAllFolders(), window.wrikeDebug.getFolderFromPermalink("4360915958")');

  // Auto-lookup the test folder ID on load
  setTimeout(async () => {
    try {
      console.log('[Wrike] Looking up folder ID for 4360915958...');
      const folder = await getFolderFromPermalink("4360915958");
      if (folder) {
        console.log('[Wrike] ✅ FOUND! Use this folder ID in code:', folder.id);
        console.log('[Wrike] Folder title:', folder.title);
      }
    } catch (e) {
      console.log('[Wrike] Could not auto-lookup folder:', e.message);
    }
  }, 2000);
}
