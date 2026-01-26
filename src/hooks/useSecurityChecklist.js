import { useState, useCallback, useEffect } from 'react';
import {
  SECURITY_ZONES,
  SECURITY_ZONE_ORDER,
  calculateZoneRating,
  calculateOverallRating,
  isInstantRed,
  isPhotoRequired
} from '../data/securityZones';

const STORAGE_KEY = 'security_checklist_state';

const getInitialState = () => ({
  // Setup info
  campus: null,
  campusData: null,
  auditor: '',
  auditorEmail: '',
  startTime: null,

  // Current zone (daily, weekly, monthly, annual)
  currentZoneId: 'daily',

  // Check results by zone
  // Structure: { zoneId: { checkId: true/false, ... }, ... }
  zoneResults: {},

  // Issues for NO answers
  // Structure: [{ zoneId, checkId, checkText, tier, instantRed, photos: [], explanation, owner, fixDate }, ...]
  issues: [],

  // Zone ratings
  // Structure: { zoneId: 'GREEN'|'AMBER'|'RED', ... }
  zoneRatings: {},

  // Overall rating
  overallRating: null,

  // Daily completion tracking (for 95% threshold)
  dailyCompletionRate: 1.0, // Assume 100% for now, can be calculated from history

  // Completion
  isComplete: false,
  endTime: null
});

export const useSecurityChecklist = () => {
  const [state, setState] = useState(() => {
    // Try to restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's from today and not complete
        if (parsed.startTime && !parsed.isComplete) {
          const startDate = new Date(parsed.startTime).toDateString();
          const today = new Date().toDateString();
          if (startDate === today) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Error restoring security checklist state:', e);
    }
    return getInitialState();
  });

  // Save to localStorage on state change
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('[useSecurityChecklist] Error saving to localStorage:', e);
      }
    }
  }, [state]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Initialize checklist
  const initChecklist = useCallback((campus, campusData, auditor, auditorEmail) => {
    setState({
      ...getInitialState(),
      campus,
      campusData,
      auditor,
      auditorEmail,
      startTime: new Date().toISOString()
    });
  }, []);

  // Reset checklist
  const resetChecklist = useCallback(() => {
    clearSavedState();
    setState(getInitialState());
  }, [clearSavedState]);

  // Get current zone
  const getCurrentZone = useCallback(() => {
    return SECURITY_ZONES[state.currentZoneId];
  }, [state.currentZoneId]);

  // Set current zone
  const setCurrentZone = useCallback((zoneId) => {
    setState(prev => ({
      ...prev,
      currentZoneId: zoneId
    }));
  }, []);

  // Record check result
  const recordCheckResult = useCallback((zoneId, checkId, result) => {
    setState(prev => ({
      ...prev,
      zoneResults: {
        ...prev.zoneResults,
        [zoneId]: {
          ...(prev.zoneResults[zoneId] || {}),
          [checkId]: result
        }
      }
    }));
  }, []);

  // Record batch results for a zone
  const recordZoneResults = useCallback((zoneId, results) => {
    setState(prev => ({
      ...prev,
      zoneResults: {
        ...prev.zoneResults,
        [zoneId]: {
          ...(prev.zoneResults[zoneId] || {}),
          ...results
        }
      }
    }));
  }, []);

  // Add issue - returns the generated ID
  const addIssue = useCallback((issue) => {
    const generatedId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      issues: [...prev.issues, {
        id: generatedId,
        timestamp: new Date().toISOString(),
        instantRed: isInstantRed(issue.checkId),
        photoRequired: isPhotoRequired(issue.checkId),
        photos: [],
        explanation: '',
        owner: '',
        fixDate: '',
        status: 'open',
        ...issue
      }]
    }));
    return generatedId;
  }, []);

  // Update issue
  const updateIssue = useCallback((issueId, updates) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    }));
  }, []);

  // Add a photo to an issue
  const addPhotoToIssue = useCallback((issueId, photoData) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId
          ? { ...issue, photos: [...(issue.photos || []), photoData] }
          : issue
      )
    }));
  }, []);

  // Remove issue
  const removeIssue = useCallback((issueId) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.filter(issue => issue.id !== issueId)
    }));
  }, []);

  // Get issues for a specific zone
  const getZoneIssues = useCallback((zoneId) => {
    return state.issues.filter(issue => issue.zoneId === zoneId);
  }, [state.issues]);

  // Get open issues count
  const getOpenIssuesCount = useCallback(() => {
    return state.issues.filter(issue => issue.status === 'open').length;
  }, [state.issues]);

  // Calculate and set zone rating
  const calculateAndSetZoneRating = useCallback((zoneId) => {
    const zoneResults = state.zoneResults[zoneId] || {};
    const zoneIssues = state.issues.filter(i => i.zoneId === zoneId);
    const rating = calculateZoneRating(zoneId, zoneResults, zoneIssues);

    setState(prev => ({
      ...prev,
      zoneRatings: {
        ...prev.zoneRatings,
        [zoneId]: rating
      }
    }));

    return rating;
  }, [state.zoneResults, state.issues]);

  // Navigate to next zone in order
  const nextZone = useCallback(() => {
    const currentIndex = SECURITY_ZONE_ORDER.indexOf(state.currentZoneId);
    if (currentIndex < SECURITY_ZONE_ORDER.length - 1) {
      setState(prev => ({
        ...prev,
        currentZoneId: SECURITY_ZONE_ORDER[currentIndex + 1]
      }));
    }
  }, [state.currentZoneId]);

  // Navigate to previous zone
  const prevZone = useCallback(() => {
    const currentIndex = SECURITY_ZONE_ORDER.indexOf(state.currentZoneId);
    if (currentIndex > 0) {
      setState(prev => ({
        ...prev,
        currentZoneId: SECURITY_ZONE_ORDER[currentIndex - 1]
      }));
    }
  }, [state.currentZoneId]);

  // Get zone completion status
  const getZoneCompletionStatus = useCallback((zoneId) => {
    const zone = SECURITY_ZONES[zoneId];
    if (!zone) return { complete: false, answered: 0, total: 0 };

    const results = state.zoneResults[zoneId] || {};
    let totalChecks = 0;
    let answeredChecks = 0;

    zone.sections.forEach(section => {
      section.checks.forEach(check => {
        totalChecks++;
        if (results[check.id] !== undefined) {
          answeredChecks++;
        }
      });
    });

    return {
      complete: answeredChecks === totalChecks,
      answered: answeredChecks,
      total: totalChecks
    };
  }, [state.zoneResults]);

  // Check if all issues have required fields
  const allIssuesComplete = useCallback(() => {
    return state.issues.every(issue => {
      // Must have explanation
      if (!issue.explanation || issue.explanation.trim() === '') return false;
      // If photo required, must have at least one photo
      if (issue.photoRequired && (!issue.photos || issue.photos.length === 0)) return false;
      return true;
    });
  }, [state.issues]);

  // Complete checklist
  const completeChecklist = useCallback(() => {
    // Calculate all zone ratings
    const finalRatings = {};
    SECURITY_ZONE_ORDER.forEach(zoneId => {
      const zoneResults = state.zoneResults[zoneId] || {};
      const zoneIssues = state.issues.filter(i => i.zoneId === zoneId);
      finalRatings[zoneId] = calculateZoneRating(zoneId, zoneResults, zoneIssues);
    });

    const overallRating = calculateOverallRating(finalRatings, state.dailyCompletionRate);

    setState(prev => ({
      ...prev,
      zoneRatings: finalRatings,
      overallRating,
      isComplete: true,
      endTime: new Date().toISOString()
    }));

    clearSavedState();

    return { zoneRatings: finalRatings, overallRating };
  }, [state.zoneResults, state.issues, state.dailyCompletionRate, clearSavedState]);

  // Get checklist summary data
  const getChecklistData = useCallback(() => {
    const duration = state.startTime && state.endTime
      ? Math.round((new Date(state.endTime) - new Date(state.startTime)) / 60000)
      : null;

    return {
      // Meta
      date: state.startTime ? new Date(state.startTime).toLocaleDateString() : null,
      time: state.startTime ? new Date(state.startTime).toLocaleTimeString() : null,
      campus: state.campus,
      campusData: state.campusData,
      auditor: state.auditor,
      auditorEmail: state.auditorEmail,
      duration,

      // Results
      zoneResults: state.zoneResults,
      zoneRatings: state.zoneRatings,
      overallRating: state.overallRating,

      // Issues
      issues: state.issues,
      totalIssues: state.issues.length,
      openIssues: state.issues.filter(i => i.status === 'open').length,
      instantRedIssues: state.issues.filter(i => i.instantRed).length,

      // Timestamps
      startTime: state.startTime,
      endTime: state.endTime
    };
  }, [state]);

  // Check if checklist is in progress
  const isInProgress = state.startTime && !state.isComplete;

  return {
    // State
    ...state,
    isInProgress,

    // Getters
    getCurrentZone,
    getZoneCompletionStatus,
    getZoneIssues,
    getOpenIssuesCount,
    getChecklistData,
    allIssuesComplete,

    // Actions
    initChecklist,
    resetChecklist,
    setCurrentZone,
    recordCheckResult,
    recordZoneResults,
    addIssue,
    updateIssue,
    addPhotoToIssue,
    removeIssue,
    calculateAndSetZoneRating,
    nextZone,
    prevZone,
    completeChecklist,
    clearSavedState
  };
};

export default useSecurityChecklist;
