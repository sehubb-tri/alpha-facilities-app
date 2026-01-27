import { supabase } from './config';

// Save food safety audit to Supabase
export const saveFoodSafetyAudit = async (auditData) => {
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
    endTime,
    // Food safety specific fields
    studentParticipationCount,
    spotCheckTrigger,
    foodVendor
  } = auditData;

  const { data, error } = await supabase
    .from('food_safety_audits')
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
      end_time: endTime,
      student_participation_count: studentParticipationCount,
      spot_check_trigger: spotCheckTrigger,
      food_vendor: foodVendor
    }])
    .select();

  if (error) {
    console.error('Error saving food safety audit:', error);
    throw error;
  }

  return data[0];
};

// Get all food safety audits
export const getFoodSafetyAudits = async () => {
  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching food safety audits:', error);
    throw error;
  }

  return data;
};

// Get food safety audits for a specific campus
export const getFoodSafetyAuditsByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus food safety audits:', error);
    throw error;
  }

  return data;
};

// Get a single food safety audit by ID
export const getFoodSafetyAuditById = async (id) => {
  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching food safety audit:', error);
    throw error;
  }

  return data;
};

// Update an issue's status/owner/fix date
export const updateFoodSafetyIssue = async (auditId, issueId, updates) => {
  // First get the current audit
  const { data: audit, error: fetchError } = await supabase
    .from('food_safety_audits')
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
    .from('food_safety_audits')
    .update({ issues: updatedIssues })
    .eq('id', auditId)
    .select();

  if (error) {
    console.error('Error updating food safety issue:', error);
    throw error;
  }

  return data[0];
};

// Get recent food safety audits by type
export const getFoodSafetyAuditsByType = async (campusName, checklistType, limit = 10) => {
  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('*')
    .eq('campus', campusName)
    .eq('checklist_type', checklistType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching food safety audits by type:', error);
    throw error;
  }

  return data;
};

// Get monthly completion rate for a campus (for reporting)
export const getMonthlyCompletionRate = async (campusName, monthsToCheck = 3) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsToCheck);

  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('date, checklist_type')
    .eq('campus', campusName)
    .eq('checklist_type', 'monthly')
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching completion rate:', error);
    throw error;
  }

  // Count unique months with completed monthly checks
  const uniqueMonths = new Set(data.map(audit => {
    const d = new Date(audit.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  }));

  const completionRate = uniqueMonths.size / monthsToCheck;

  return Math.min(completionRate, 1.0); // Cap at 100%
};

// Get food safety audits by vendor
export const getFoodSafetyAuditsByVendor = async (vendorName, limit = 20) => {
  const { data, error } = await supabase
    .from('food_safety_audits')
    .select('*')
    .eq('food_vendor', vendorName)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching vendor food safety audits:', error);
    throw error;
  }

  return data;
};
