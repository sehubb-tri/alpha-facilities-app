import { supabase } from './config';

// Save furniture audit to Supabase
export const saveFurnitureAudit = async (auditData) => {
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
    .from('furniture_audits')
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
      rating,
      issues,
      total_issues: totalIssues,
      open_issues: openIssues,
      instant_red_issues: instantRedIssues,
      start_time: startTime,
      end_time: endTime
    }])
    .select();

  if (error) {
    console.error('Error saving furniture audit:', error);
    throw error;
  }

  return data[0];
};

// Get all furniture audits
export const getFurnitureAudits = async () => {
  const { data, error } = await supabase
    .from('furniture_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching furniture audits:', error);
    throw error;
  }

  return data;
};

// Get furniture audits for a specific campus
export const getFurnitureAuditsByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('furniture_audits')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus furniture audits:', error);
    throw error;
  }

  return data;
};

// Get a single furniture audit by ID
export const getFurnitureAuditById = async (id) => {
  const { data, error } = await supabase
    .from('furniture_audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching furniture audit:', error);
    throw error;
  }

  return data;
};

// Update an issue's status/owner/fix date
export const updateFurnitureIssue = async (auditId, issueId, updates) => {
  // First get the current audit
  const { data: audit, error: fetchError } = await supabase
    .from('furniture_audits')
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
    .from('furniture_audits')
    .update({ issues: updatedIssues })
    .eq('id', auditId)
    .select();

  if (error) {
    console.error('Error updating furniture issue:', error);
    throw error;
  }

  return data[0];
};

// Get recent furniture audits by type
export const getFurnitureAuditsByType = async (campusName, checklistType, limit = 10) => {
  const { data, error } = await supabase
    .from('furniture_audits')
    .select('*')
    .eq('campus', campusName)
    .eq('checklist_type', checklistType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching furniture audits by type:', error);
    throw error;
  }

  return data;
};
