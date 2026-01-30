import { useState, useCallback, useEffect } from 'react';
import {
  GREEN_STREAK_STOPS,
  GREEN_STREAK_METRICS,
  calculateOverallStatus,
  getCompletionPercentage
} from '../data/greenStreakZones';

const STORAGE_KEY = 'green_streak_walk_state';

const getInitialState = () => ({
  // Setup info
  campus: null,
  campusData: null,
  coordinator: '',
  coordinatorEmail: '',
  startTime: null,

  // Current position in the walk
  currentStopIndex: 0,
  currentCheckIndex: 0,

  // Room selections for sampling stops (arrays for multiple rooms)
  roomSelections: {
    learning: [], // Which classrooms they're checking (2 rooms)
    restroom: []  // Which restrooms they're checking (2 restrooms)
  },

  // Track which room instance we're on for multi-room stops (0 or 1)
  currentRoomIndex: 0,

  // Check results: { checkId: true/false }
  checkResults: {},

  // Issues for "No" answers
  // { checkId, question, metric, stopId, description, photos: [], timestamp }
  issues: [],

  // Completion
  isComplete: false,
  endTime: null,
  overallStatus: null,
  metricStatuses: null
});

export const useGreenStreakWalk = () => {
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
      console.error('Error restoring green streak walk state:', e);
    }
    return getInitialState();
  });

  // Save to localStorage on state change
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('[useGreenStreakWalk] Error saving to localStorage:', e);
      }
    }
  }, [state]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Initialize walk
  const initWalk = useCallback((campus, campusData, coordinator, coordinatorEmail) => {
    setState({
      ...getInitialState(),
      campus,
      campusData,
      coordinator,
      coordinatorEmail,
      startTime: new Date().toISOString()
    });
  }, []);

  // Reset walk
  const resetWalk = useCallback(() => {
    clearSavedState();
    setState(getInitialState());
  }, [clearSavedState]);

  // Get current stop
  const getCurrentStop = useCallback(() => {
    return GREEN_STREAK_STOPS[state.currentStopIndex] || null;
  }, [state.currentStopIndex]);

  // Get current check
  const getCurrentCheck = useCallback(() => {
    const stop = getCurrentStop();
    if (!stop) return null;
    return stop.checks[state.currentCheckIndex] || null;
  }, [getCurrentStop, state.currentCheckIndex]);

  // Set room selection for sampling stops (supports multiple rooms)
  const setRoomSelection = useCallback((stopId, roomName, roomIndex = 0) => {
    setState(prev => {
      const currentSelections = prev.roomSelections[stopId] || [];
      const newSelections = [...currentSelections];
      newSelections[roomIndex] = roomName;

      return {
        ...prev,
        roomSelections: {
          ...prev.roomSelections,
          [stopId]: newSelections
        }
      };
    });
  }, []);

  // Get current room index for multi-room stops
  const getCurrentRoomIndex = useCallback(() => {
    return state.currentRoomIndex || 0;
  }, [state.currentRoomIndex]);

  // Set current room index
  const setCurrentRoomIndex = useCallback((index) => {
    setState(prev => ({
      ...prev,
      currentRoomIndex: index
    }));
  }, []);

  // Record check result (Yes = true, No = false)
  const recordCheckResult = useCallback((checkId, result, issueData = null) => {
    setState(prev => {
      const newState = {
        ...prev,
        checkResults: {
          ...prev.checkResults,
          [checkId]: result
        }
      };

      // If "No" and we have issue data, add to issues
      if (result === false && issueData) {
        const issue = {
          id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          checkId,
          timestamp: new Date().toISOString(),
          ...issueData
        };
        newState.issues = [...prev.issues, issue];
      }

      return newState;
    });
  }, []);

  // Add issue for a "No" answer
  const addIssue = useCallback((issueData) => {
    const issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      photos: [],
      ...issueData
    };

    setState(prev => ({
      ...prev,
      issues: [...prev.issues, issue]
    }));

    return issue.id;
  }, []);

  // Update issue (add description, photos, etc.)
  const updateIssue = useCallback((issueId, updates) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
      )
    }));
  }, []);

  // Add photo to issue
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

  // Remove issue (if they change answer to Yes)
  const removeIssue = useCallback((checkId) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.filter(issue => issue.checkId !== checkId)
    }));
  }, []);

  // Navigate to next check
  const nextCheck = useCallback(() => {
    setState(prev => {
      const currentStop = GREEN_STREAK_STOPS[prev.currentStopIndex];
      if (!currentStop) return prev;

      const roomCount = currentStop.roomCount || 1;
      const currentRoomIdx = prev.currentRoomIndex || 0;

      // If there are more checks in this stop for current room
      if (prev.currentCheckIndex < currentStop.checks.length - 1) {
        return {
          ...prev,
          currentCheckIndex: prev.currentCheckIndex + 1
        };
      }

      // If multi-room stop and more rooms to check
      if (roomCount > 1 && currentRoomIdx < roomCount - 1) {
        return {
          ...prev,
          currentCheckIndex: 0,
          currentRoomIndex: currentRoomIdx + 1
        };
      }

      // Move to next stop
      if (prev.currentStopIndex < GREEN_STREAK_STOPS.length - 1) {
        return {
          ...prev,
          currentStopIndex: prev.currentStopIndex + 1,
          currentCheckIndex: 0,
          currentRoomIndex: 0
        };
      }

      // Walk complete
      return prev;
    });
  }, []);

  // Navigate to previous check
  const prevCheck = useCallback(() => {
    setState(prev => {
      const currentStop = GREEN_STREAK_STOPS[prev.currentStopIndex];
      const currentRoomIdx = prev.currentRoomIndex || 0;

      // If not at first check of current room
      if (prev.currentCheckIndex > 0) {
        return {
          ...prev,
          currentCheckIndex: prev.currentCheckIndex - 1
        };
      }

      // If multi-room and not on first room, go back to previous room's last check
      if (currentRoomIdx > 0) {
        return {
          ...prev,
          currentCheckIndex: currentStop.checks.length - 1,
          currentRoomIndex: currentRoomIdx - 1
        };
      }

      // Move to previous stop
      if (prev.currentStopIndex > 0) {
        const prevStop = GREEN_STREAK_STOPS[prev.currentStopIndex - 1];
        const prevRoomCount = prevStop.roomCount || 1;
        return {
          ...prev,
          currentStopIndex: prev.currentStopIndex - 1,
          currentCheckIndex: prevStop.checks.length - 1,
          currentRoomIndex: prevRoomCount - 1
        };
      }

      return prev;
    });
  }, []);

  // Go to specific stop
  const goToStop = useCallback((stopIndex) => {
    setState(prev => ({
      ...prev,
      currentStopIndex: stopIndex,
      currentCheckIndex: 0
    }));
  }, []);

  // Check if walk is complete (all required checks answered, including multi-room)
  const isWalkComplete = useCallback(() => {
    for (const stop of GREEN_STREAK_STOPS) {
      const roomCount = stop.roomCount || 1;

      for (let roomIdx = 0; roomIdx < roomCount; roomIdx++) {
        for (const check of stop.checks) {
          if (check.optional) continue;

          // Generate the same key format as the walk page
          const checkKey = roomCount > 1 ? `${check.id}_room${roomIdx}` : check.id;

          if (state.checkResults[checkKey] === undefined) {
            return false;
          }
        }
      }
    }
    return true;
  }, [state.checkResults]);

  // Check if all issues have required description
  const allIssuesHaveDescription = useCallback(() => {
    return state.issues.every(issue =>
      issue.description && issue.description.trim() !== ''
    );
  }, [state.issues]);

  // Complete the walk
  const completeWalk = useCallback(() => {
    const status = calculateOverallStatus(state.checkResults);

    setState(prev => ({
      ...prev,
      isComplete: true,
      endTime: new Date().toISOString(),
      overallStatus: status.overall,
      metricStatuses: status.metricStatuses
    }));

    clearSavedState();

    return status;
  }, [state.checkResults, clearSavedState]);

  // Get walk summary data
  const getWalkData = useCallback(() => {
    const duration = state.startTime && state.endTime
      ? Math.round((new Date(state.endTime) - new Date(state.startTime)) / 60000)
      : null;

    const status = calculateOverallStatus(state.checkResults);

    return {
      // Meta
      type: 'green_streak_walk',
      date: state.startTime ? new Date(state.startTime).toLocaleDateString() : null,
      time: state.startTime ? new Date(state.startTime).toLocaleTimeString() : null,
      campus: state.campus,
      campusData: state.campusData,
      coordinator: state.coordinator,
      coordinatorEmail: state.coordinatorEmail,
      duration,

      // Room selections
      roomSelections: state.roomSelections,

      // Results
      checkResults: state.checkResults,
      completionPercentage: getCompletionPercentage(state.checkResults),

      // Status
      overallStatus: status.overall,
      metricStatuses: status.metricStatuses,
      streakIntact: status.streakIntact,

      // Issues
      issues: state.issues,
      totalIssues: state.issues.length,

      // Timestamps
      startTime: state.startTime,
      endTime: state.endTime
    };
  }, [state]);

  // Get progress info
  const getProgress = useCallback(() => {
    let totalChecks = 0;
    let completedChecks = 0;
    let currentOverallIndex = 0;

    for (let i = 0; i < GREEN_STREAK_STOPS.length; i++) {
      const stop = GREEN_STREAK_STOPS[i];
      for (let j = 0; j < stop.checks.length; j++) {
        const check = stop.checks[j];
        if (!check.optional) {
          totalChecks++;
          if (state.checkResults[check.id] !== undefined) {
            completedChecks++;
          }
        }
        if (i < state.currentStopIndex || (i === state.currentStopIndex && j < state.currentCheckIndex)) {
          currentOverallIndex++;
        }
      }
    }

    return {
      currentStop: state.currentStopIndex + 1,
      totalStops: GREEN_STREAK_STOPS.length,
      currentCheckInStop: state.currentCheckIndex + 1,
      totalChecksInStop: GREEN_STREAK_STOPS[state.currentStopIndex]?.checks.length || 0,
      completedChecks,
      totalChecks,
      percentage: Math.round((completedChecks / totalChecks) * 100),
      currentOverallIndex: currentOverallIndex + 1
    };
  }, [state.currentStopIndex, state.currentCheckIndex, state.checkResults]);

  // Check if walk is in progress
  const isInProgress = state.startTime && !state.isComplete;

  return {
    // State
    ...state,
    isInProgress,
    stops: GREEN_STREAK_STOPS,
    metrics: GREEN_STREAK_METRICS,

    // Getters
    getCurrentStop,
    getCurrentCheck,
    getCurrentRoomIndex,
    getProgress,
    getWalkData,
    isWalkComplete,
    allIssuesHaveDescription,

    // Actions
    initWalk,
    resetWalk,
    setRoomSelection,
    setCurrentRoomIndex,
    recordCheckResult,
    addIssue,
    updateIssue,
    addPhotoToIssue,
    removeIssue,
    nextCheck,
    prevCheck,
    goToStop,
    completeWalk,
    clearSavedState
  };
};

export default useGreenStreakWalk;
