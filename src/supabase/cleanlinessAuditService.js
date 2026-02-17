import { supabase } from './config';

// Save cleanliness audit (weekly or monthly) to Supabase
export const saveCleanlinessAudit = async (auditData) => {
  const {
    date,
    time,
    campus,
    campusData,
    auditor,
    auditorEmail,
    duration,
    checklistType,
    checklistName,
    weekNumber,
    assignedRooms,
    checkResults,
    rating,
    issues,
    totalIssues,
    openIssues,
    instantRedIssues,
    startTime,
    endTime
  } = auditData;

  const { data, error } = await supabase
    .from('cleanliness_audits')
    .insert([{
      date,
      time,
      campus,
      campus_data: campusData,
      auditor,
      auditor_email: auditorEmail,
      duration,
      checklist_type: checklistType,
      checklist_name: checklistName,
      week_number: weekNumber,
      assigned_rooms: assignedRooms,
      check_results: checkResults,
      overall_rating: rating,
      issues,
      total_issues: totalIssues,
      open_issues: openIssues,
      instant_red_issues: instantRedIssues,
      start_time: startTime,
      end_time: endTime
    }])
    .select();

  if (error) {
    console.error('Error saving cleanliness audit:', error);
    throw error;
  }

  return data[0];
};

// Get all cleanliness audits
export const getCleanlinessAudits = async () => {
  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cleanliness audits:', error);
    throw error;
  }

  return data;
};

// Get cleanliness audits for a specific campus
export const getCleanlinessAuditsByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus cleanliness audits:', error);
    throw error;
  }

  return data;
};

// Get cleanliness audits by type (weekly or monthly)
export const getCleanlinessAuditsByType = async (campusName, checklistType) => {
  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('*')
    .eq('campus', campusName)
    .eq('checklist_type', checklistType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cleanliness audits by type:', error);
    throw error;
  }

  return data;
};

// Get a single cleanliness audit by ID
export const getCleanlinessAuditById = async (id) => {
  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching cleanliness audit:', error);
    throw error;
  }

  return data;
};

// Update an issue's status/owner/fix date
export const updateCleanlinessIssue = async (auditId, issueId, updates) => {
  const { data: audit, error: fetchError } = await supabase
    .from('cleanliness_audits')
    .select('issues')
    .eq('id', auditId)
    .single();

  if (fetchError) {
    console.error('Error fetching audit for update:', fetchError);
    throw fetchError;
  }

  const updatedIssues = audit.issues.map(issue =>
    issue.id === issueId ? { ...issue, ...updates } : issue
  );

  const { data, error } = await supabase
    .from('cleanliness_audits')
    .update({ issues: updatedIssues })
    .eq('id', auditId)
    .select();

  if (error) {
    console.error('Error updating cleanliness issue:', error);
    throw error;
  }

  return data[0];
};

// Get weekly completion rate for a campus (for monthly review)
export const getWeeklyCompletionRate = async (campusName, daysToCheck = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCheck);

  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('date, checklist_type')
    .eq('campus', campusName)
    .eq('checklist_type', 'weekly')
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching completion rate:', error);
    throw error;
  }

  const uniqueWeeks = new Set(data.map(audit => audit.date));
  // Expect ~4 weekly audits per month
  const expectedWeeks = Math.ceil(daysToCheck / 7);
  const completionRate = uniqueWeeks.size / expectedWeeks;

  return Math.min(completionRate, 1.0);
};

// Get count of completed weekly audits for a campus in the current month
// Used to determine which audit number (1-4) this is, and which rooms to assign
export const getWeeklyAuditCountThisMonth = async (campusName) => {
  // First day of current month at midnight UTC
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error, count } = await supabase
    .from('cleanliness_audits')
    .select('id', { count: 'exact', head: true })
    .eq('campus', campusName)
    .eq('checklist_type', 'weekly')
    .gte('created_at', monthStart);

  if (error) {
    console.error('Error fetching weekly audit count:', error);
    return 0;
  }

  return count || 0;
};

// Check for repeat defects (same check failed in same zone within 30 days)
export const checkRepeatDefects = async (campusName, checkId, zoneName) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('cleanliness_audits')
    .select('issues, created_at')
    .eq('campus', campusName)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error checking repeat defects:', error);
    return false;
  }

  // Look for the same checkId in previous audit issues
  for (const audit of data) {
    if (audit.issues) {
      const matchingIssue = audit.issues.find(i =>
        i.checkId === checkId && i.section === zoneName
      );
      if (matchingIssue) {
        return true; // Repeat defect found
      }
    }
  }

  return false;
};
