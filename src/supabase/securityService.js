import { supabase } from './config';

// Save security audit to Supabase
export const saveSecurityAudit = async (auditData) => {
  const {
    date,
    time,
    campus,
    campusData,
    auditor,
    auditorEmail,
    duration,
    zoneResults,
    zoneRatings,
    overallRating,
    issues,
    totalIssues,
    openIssues,
    instantRedIssues,
    startTime,
    endTime
  } = auditData;

  const { data, error } = await supabase
    .from('security_audits')
    .insert([{
      date,
      time,
      campus,
      campus_data: campusData,
      auditor,
      auditor_email: auditorEmail,
      duration,
      zone_results: zoneResults,
      zone_ratings: zoneRatings,
      overall_rating: overallRating,
      issues,
      total_issues: totalIssues,
      open_issues: openIssues,
      instant_red_issues: instantRedIssues,
      start_time: startTime,
      end_time: endTime
    }])
    .select();

  if (error) {
    console.error('Error saving security audit:', error);
    throw error;
  }

  return data[0];
};

// Get all security audits
export const getSecurityAudits = async () => {
  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching security audits:', error);
    throw error;
  }

  return data;
};

// Get security audits for a specific campus
export const getSecurityAuditsByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus security audits:', error);
    throw error;
  }

  return data;
};

// Get a single security audit by ID
export const getSecurityAuditById = async (id) => {
  const { data, error } = await supabase
    .from('security_audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching security audit:', error);
    throw error;
  }

  return data;
};

// Update an issue's status/owner/fix date
export const updateSecurityIssue = async (auditId, issueId, updates) => {
  // First get the current audit
  const { data: audit, error: fetchError } = await supabase
    .from('security_audits')
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
    .from('security_audits')
    .update({ issues: updatedIssues })
    .eq('id', auditId)
    .select();

  if (error) {
    console.error('Error updating security issue:', error);
    throw error;
  }

  return data[0];
};

// Get daily completion rate for a campus (for RAG calculation)
export const getDailyCompletionRate = async (campusName, daysToCheck = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCheck);

  const { data, error } = await supabase
    .from('security_audits')
    .select('date')
    .eq('campus', campusName)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching completion rate:', error);
    throw error;
  }

  // Count unique dates with completed daily checks
  const uniqueDates = new Set(data.map(audit => audit.date));

  // Assuming ~22 business days in a month
  const expectedDays = Math.round(daysToCheck * 0.71); // ~71% are weekdays
  const completionRate = uniqueDates.size / expectedDays;

  return Math.min(completionRate, 1.0); // Cap at 100%
};
