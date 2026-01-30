import { supabase } from './config';

// Save a completed Green Streak Walk to Supabase
export const saveGreenStreakWalk = async (walkData) => {
  const {
    date,
    campus,
    coordinator,
    coordinatorEmail,
    startTime,
    endTime,
    checkResults,
    metricStatuses,
    roomSelections,
    issues,
    totalIssues,
    overallStatus
  } = walkData;

  // Calculate duration in minutes
  const durationMinutes = startTime && endTime
    ? Math.round((new Date(endTime) - new Date(startTime)) / 60000)
    : null;

  const { data, error } = await supabase
    .from('green_streak_walks')
    .insert([{
      date,
      campus,
      coordinator,
      coordinator_email: coordinatorEmail,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      overall_status: overallStatus,
      check_results: checkResults,
      metric_statuses: metricStatuses,
      room_selections: roomSelections,
      issues,
      total_issues: totalIssues || 0
    }])
    .select();

  if (error) {
    console.error('Error saving Green Streak Walk:', error);
    throw error;
  }

  return data[0];
};

// Get all Green Streak Walks
export const getGreenStreakWalks = async () => {
  const { data, error } = await supabase
    .from('green_streak_walks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching Green Streak Walks:', error);
    throw error;
  }

  return data;
};

// Get Green Streak Walks for a specific campus
export const getGreenStreakWalksByCampus = async (campusName) => {
  const { data, error } = await supabase
    .from('green_streak_walks')
    .select('*')
    .eq('campus', campusName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campus Green Streak Walks:', error);
    throw error;
  }

  return data;
};

// Get a single Green Streak Walk by ID
export const getGreenStreakWalkById = async (id) => {
  const { data, error } = await supabase
    .from('green_streak_walks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching Green Streak Walk:', error);
    throw error;
  }

  return data;
};

// Get recent walks for dashboard/streak tracking
export const getRecentWalks = async (campusName, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('green_streak_walks')
    .select('*')
    .eq('campus', campusName)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching recent walks:', error);
    throw error;
  }

  return data;
};

// Get Green Streak stats for a campus
export const getGreenStreakStats = async (campusName, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('green_streak_walks')
    .select('date, overall_status, total_issues')
    .eq('campus', campusName)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching Green Streak stats:', error);
    throw error;
  }

  // Calculate stats
  const totalWalks = data.length;
  const greenWalks = data.filter(w => w.overall_status === 'GREEN').length;
  const totalIssues = data.reduce((sum, w) => sum + (w.total_issues || 0), 0);

  // Calculate current streak (consecutive GREEN days)
  let currentStreak = 0;
  for (const walk of data) {
    if (walk.overall_status === 'GREEN') {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalWalks,
    greenWalks,
    greenRate: totalWalks > 0 ? (greenWalks / totalWalks * 100).toFixed(1) : 0,
    totalIssues,
    currentStreak
  };
};
