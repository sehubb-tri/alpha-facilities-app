import { supabase } from './config';

// Save health & safety audit to Supabase
export const saveHealthSafetyAudit = async (auditData) => {
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
    .from('health_safety_audits')
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
    console.error('Error saving health & safety audit:', error);
    throw error;
  }

  return data[0];
};

// Get all health & safety audits
export const getHealthSafetyAudits = async () => {
  const { data, error } = await supabase
    .from('health_safety_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching health & safety audits:', error);
    throw error;
  }

  return data;
};

// Get health & safety audits for a specific campus
export const getHealthSafetyAuditsByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('health_safety_audits')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus health & safety audits:', error);
    throw error;
  }

  return data;
};

// Get a single health & safety audit by ID
export const getHealthSafetyAuditById = async (id) => {
  const { data, error } = await supabase
    .from('health_safety_audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching health & safety audit:', error);
    throw error;
  }

  return data;
};

// Update an issue's status/owner/fix date
export const updateHealthSafetyIssue = async (auditId, issueId, updates) => {
  // First get the current audit
  const { data: audit, error: fetchError } = await supabase
    .from('health_safety_audits')
    .select('issues')
    .eq('id', auditId)
    .single();

  if (fetchError) {
    console.error('Error fetching audit for update:', fetchError);
    throw fetchError;
  }

  // Update the specific issue
  const updatedIssues = audit.issues.map(issue =>
    issue.id === issueId ? { ...issue, ...updates } : issue
  );

  // Save back
  const { data, error } = await supabase
    .from('health_safety_audits')
    .update({ issues: updatedIssues })
    .eq('id', auditId)
    .select();

  if (error) {
    console.error('Error updating health & safety issue:', error);
    throw error;
  }

  return data[0];
};

// Get weekly completion rate for a campus
export const getWeeklyCompletionRate = async (campusName, weeksToCheck = 4) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksToCheck * 7));

  const { data, error } = await supabase
    .from('health_safety_audits')
    .select('date')
    .eq('campus', campusName)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching completion rate:', error);
    throw error;
  }

  // Count unique weeks with completed checks
  const uniqueWeeks = new Set(data.map(audit => {
    const d = new Date(audit.date);
    const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
    return weekNum;
  }));

  const completionRate = uniqueWeeks.size / weeksToCheck;

  return Math.min(completionRate, 1.0); // Cap at 100%
};
