import { useState, useCallback, useEffect } from 'react';
import {
  FOOD_SAFETY_ZONES,
  calculateZoneRating,
  isInstantRed,
  isPhotoRequired
} from '../data/foodSafetyZones';

const STORAGE_KEY = 'food_safety_checklist_state';

const getInitialState = () => ({
  // Setup info
  campus: null,
  campusData: null,
  auditor: '',
  auditorEmail: '',
  startTime: null,

  // Which checklist type are we doing (monthly, spot_check)
  checklistType: null,

  // Food safety specific fields
  foodVendor: '',
  spotCheckTrigger: '', // Reason for spot check if applicable
  studentParticipationCount: null,

  // Check results for the selected checklist type only
  // Structure: { checkId: true/false, ... }
  checkResults: {},

  // Issues for NO answers
  // Structure: [{ checkId, checkText, section, instantRed, photos: [], explanation }, ...]
  issues: [],

  // Final rating for this checklist
  rating: null,

  // Completion
  isComplete: false,
  endTime: null
});

export const useFoodSafetyChecklist = () => {
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
      console.error('Error restoring food safety checklist state:', e);
    }
    return getInitialState();
  });

  // Save to localStorage on state change
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('[useFoodSafetyChecklist] Error saving to localStorage:', e);
      }
    }
  }, [state]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Initialize checklist with a specific type (monthly, spot_check)
  const initChecklist = useCallback((campus, campusData, auditor, auditorEmail, checklistType, foodVendor = '', spotCheckTrigger = '') => {
    setState({
      ...getInitialState(),
      campus,
      campusData,
      auditor,
      auditorEmail,
      checklistType,
      foodVendor,
      spotCheckTrigger,
      startTime: new Date().toISOString()
    });
  }, []);

  // Reset checklist
  const resetChecklist = useCallback(() => {
    clearSavedState();
    setState(getInitialState());
  }, [clearSavedState]);

  // Get current zone (the selected checklist type)
  const getCurrentZone = useCallback(() => {
    return state.checklistType ? FOOD_SAFETY_ZONES[state.checklistType] : null;
  }, [state.checklistType]);

  // Record check result
  const recordCheckResult = useCallback((checkId, result) => {
    setState(prev => ({
      ...prev,
      checkResults: {
        ...prev.checkResults,
        [checkId]: result
      }
    }));
  }, []);

  // Record batch results
  const recordZoneResults = useCallback((zoneId, results) => {
    // zoneId is ignored since we only have one zone now
    setState(prev => ({
      ...prev,
      checkResults: {
        ...prev.checkResults,
        ...results
      }
    }));
  }, []);

  // Set student participation count
  const setStudentParticipationCount = useCallback((count) => {
    setState(prev => ({
      ...prev,
      studentParticipationCount: count
    }));
  }, []);

  // Set food vendor
  const setFoodVendor = useCallback((vendor) => {
    setState(prev => ({
      ...prev,
      foodVendor: vendor
    }));
  }, []);

  // Set spot check trigger
  const setSpotCheckTrigger = useCallback((trigger) => {
    setState(prev => ({
      ...prev,
      spotCheckTrigger: trigger
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

  // Get completion status
  const getZoneCompletionStatus = useCallback((zoneId) => {
    const zone = FOOD_SAFETY_ZONES[zoneId || state.checklistType];
    if (!zone) return { complete: false, answered: 0, total: 0 };

    let totalChecks = 0;
    let answeredChecks = 0;

    zone.sections.forEach(section => {
      section.checks.forEach(check => {
        // Skip optional checks from total count
        if (!check.optional) {
          totalChecks++;
          if (state.checkResults[check.id] !== undefined) {
            answeredChecks++;
          }
        }
      });
    });

    return {
      complete: answeredChecks === totalChecks,
      answered: answeredChecks,
      total: totalChecks
    };
  }, [state.checkResults, state.checklistType]);

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

  // Complete checklist - calculate rating for this checklist type only
  const completeChecklist = useCallback(() => {
    const rating = calculateZoneRating(state.checklistType, state.checkResults, state.issues);

    setState(prev => ({
      ...prev,
      rating,
      isComplete: true,
      endTime: new Date().toISOString()
    }));

    clearSavedState();

    return { rating };
  }, [state.checklistType, state.checkResults, state.issues, clearSavedState]);

  // Get checklist summary data
  const getChecklistData = useCallback(() => {
    const duration = state.startTime && state.endTime
      ? Math.round((new Date(state.endTime) - new Date(state.startTime)) / 60000)
      : null;

    const zone = FOOD_SAFETY_ZONES[state.checklistType];

    return {
      // Meta
      date: state.startTime ? new Date(state.startTime).toLocaleDateString() : null,
      time: state.startTime ? new Date(state.startTime).toLocaleTimeString() : null,
      campus: state.campus,
      campusData: state.campusData,
      auditor: state.auditor,
      auditorEmail: state.auditorEmail,
      duration,

      // Checklist type info
      checklistType: state.checklistType,
      checklistName: zone?.name || state.checklistType,

      // Food safety specific
      foodVendor: state.foodVendor,
      spotCheckTrigger: state.spotCheckTrigger,
      studentParticipationCount: state.studentParticipationCount,

      // Results
      checkResults: state.checkResults,
      rating: state.rating,

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

  // For compatibility with existing code that expects zoneResults/zoneRatings
  const zoneResults = { [state.checklistType]: state.checkResults };
  const zoneRatings = state.rating ? { [state.checklistType]: state.rating } : {};

  return {
    // State
    ...state,
    isInProgress,
    // Compatibility aliases
    currentZoneId: state.checklistType,
    zoneResults,
    zoneRatings,
    overallRating: state.rating,

    // Getters
    getCurrentZone,
    getZoneCompletionStatus,
    getChecklistData,
    allIssuesComplete,

    // Actions
    initChecklist,
    resetChecklist,
    recordCheckResult,
    recordZoneResults,
    setStudentParticipationCount,
    setFoodVendor,
    setSpotCheckTrigger,
    addIssue,
    updateIssue,
    addPhotoToIssue,
    removeIssue,
    completeChecklist,
    clearSavedState,
    // No-op for compatibility
    setCurrentZone: () => {},
    calculateAndSetZoneRating: () => {}
  };
};

export default useFoodSafetyChecklist;
