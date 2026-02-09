import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchFolderTasks, normalizeWrikeTask,
  calculateSLA, calculateCampusHealth,
} from '../services/issueTrackerService';
import { TEST_CAMPUS_FOLDER_ID } from '../data/issueTrackerConfig';

export const useIssueTracker = (userEmail = null) => {
  const [rawIssues, setRawIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await fetchFolderTasks(TEST_CAMPUS_FOLDER_ID);
      const normalized = tasks.map(normalizeWrikeTask);
      setRawIssues(normalized);
      console.log(`[IssueTracker] Loaded ${normalized.length} issues`);
    } catch (err) {
      console.error('[IssueTracker] Failed to load issues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  // All issues with SLA calculated
  const issues = useMemo(() =>
    rawIssues.map(issue => ({
      ...issue,
      sla: calculateSLA(issue),
    })),
    [rawIssues]
  );

  // Filtered issues
  const filteredIssues = useMemo(() => {
    let result = [...issues];
    if (categoryFilter !== 'all') result = result.filter(i => i.category === categoryFilter);
    if (statusFilter === 'open') result = result.filter(i => !i.isResolved);
    else if (statusFilter === 'resolved') result = result.filter(i => i.isResolved);
    else if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(i => i.priority === priorityFilter);
    return result;
  }, [issues, categoryFilter, statusFilter, priorityFilter]);

  // My submissions (filtered by user email)
  const mySubmissions = useMemo(() => {
    if (!userEmail) return [];
    return issues
      .filter(i => i.submittedByEmail?.toLowerCase() === userEmail.toLowerCase())
      .sort((a, b) => {
        if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
        return new Date(b.createdDate) - new Date(a.createdDate);
      });
  }, [issues, userEmail]);

  // Stats
  const stats = useMemo(() => {
    const open = issues.filter(i => !i.isResolved);
    return {
      total: issues.length,
      open: open.length,
      resolved: issues.length - open.length,
      slaViolations: open.filter(i => i.sla.status === 'overdue').length,
      atRisk: open.filter(i => i.sla.status === 'at-risk').length,
      emergencies: open.filter(i => i.isEmergency).length,
    };
  }, [issues]);

  // Campus health
  const campusHealth = useMemo(() => calculateCampusHealth(issues), [issues]);

  return {
    issues,
    filteredIssues,
    mySubmissions,
    loading,
    error,
    stats,
    campusHealth,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    refresh: loadIssues,
  };
};
