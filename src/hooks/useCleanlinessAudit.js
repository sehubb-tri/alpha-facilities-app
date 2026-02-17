import { useState, useCallback, useEffect } from 'react';
import {
  CLEANLINESS_ZONES,
  CLEANLINESS_RAG_RULES,
  calculateCleanlinessZoneRating,
  isCleanlinessInstantRed,
  isCleanlinessPhotoRequired,
  ROOM_AUDIT_TEMPLATES,
  getTemplateForRoomType,
  generateRoomChecks,
  getRoomsForWeek,
  getWeekOfMonth
} from '../data/cleanlinessZones';
import { getCampusRooms } from '../data/campusRooms';

const STORAGE_KEY = 'cleanliness_audit_state';

const getInitialState = () => ({
  // Setup info
  campus: null,
  campusData: null,
  auditor: '',
  auditorEmail: '',
  startTime: null,

  // Which checklist type: 'weekly' or 'monthly'
  checklistType: null,

  // For weekly: which rooms are assigned this week
  assignedRooms: [],
  weekNumber: null,

  // Check results: { checkId: true/false }
  checkResults: {},

  // Issues for NO answers
  issues: [],

  // Final rating
  rating: null,

  // Completion
  isComplete: false,
  endTime: null
});

export const useCleanlinessAudit = () => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.startTime && !parsed.isComplete) {
          const startDate = new Date(parsed.startTime).toDateString();
          const today = new Date().toDateString();
          if (startDate === today) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error('Error restoring cleanliness audit state:', e);
    }
    return getInitialState();
  });

  // Save to localStorage on state change
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('[useCleanlinessAudit] Error saving to localStorage:', e);
      }
    }
  }, [state]);

  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Initialize checklist
  // auditNumber: for weekly, which audit this is (1-4) based on how many have been done this month
  const initChecklist = useCallback((campus, campusData, auditor, auditorEmail, checklistType, auditNumber) => {
    // For weekly, use audit number to determine room assignments
    let assignedRooms = [];
    let weekNumber = null;

    if (checklistType === 'weekly') {
      const allRooms = getCampusRooms(campus);
      // Use the passed audit number (count-based), fall back to calendar week
      weekNumber = auditNumber || getWeekOfMonth();
      assignedRooms = getRoomsForWeek(allRooms, weekNumber);
    }

    setState({
      ...getInitialState(),
      campus,
      campusData,
      auditor,
      auditorEmail,
      checklistType,
      assignedRooms,
      weekNumber,
      startTime: new Date().toISOString()
    });
  }, []);

  const resetChecklist = useCallback(() => {
    clearSavedState();
    setState(getInitialState());
  }, [clearSavedState]);

  // Get current zone definition
  const getCurrentZone = useCallback(() => {
    if (!state.checklistType) return null;
    const zone = CLEANLINESS_ZONES[state.checklistType];
    if (!zone) return null;

    // For weekly, dynamically add assigned room sections
    if (state.checklistType === 'weekly' && state.assignedRooms.length > 0) {
      const roomSections = state.assignedRooms.map(room => {
        const template = getTemplateForRoomType(room.type);
        const checks = generateRoomChecks(room, template);
        return {
          name: `Assigned Room: ${room.name}`,
          description: `${template.name} audit - ${room.name}`,
          isAssignedRoom: true,
          roomName: room.name,
          roomType: room.type,
          checks
        };
      });

      // Insert room sections before the Tour Ready section (last section)
      const staticSections = [...zone.sections];
      const tourReadySection = staticSections.pop(); // Remove Tour Ready
      return {
        ...zone,
        sections: [...staticSections, ...roomSections, tourReadySection]
      };
    }

    return zone;
  }, [state.checklistType, state.assignedRooms]);

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
    setState(prev => ({
      ...prev,
      checkResults: {
        ...prev.checkResults,
        ...results
      }
    }));
  }, []);

  // Add issue
  const addIssue = useCallback((issue) => {
    const generatedId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      issues: [...prev.issues, {
        id: generatedId,
        timestamp: new Date().toISOString(),
        instantRed: isCleanlinessInstantRed(issue.checkId),
        photoRequired: isCleanlinessPhotoRequired(issue.checkId),
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

  // Remove issue
  const removeIssue = useCallback((issueId) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.filter(issue => issue.id !== issueId)
    }));
  }, []);

  // Get completion status
  const getZoneCompletionStatus = useCallback((zoneId) => {
    const zone = getCurrentZone();
    if (!zone) return { complete: false, answered: 0, total: 0 };

    let totalChecks = 0;
    let answeredChecks = 0;

    zone.sections.forEach(section => {
      section.checks.forEach(check => {
        totalChecks++;
        if (state.checkResults[check.id] !== undefined) {
          answeredChecks++;
        }
      });
    });

    return {
      complete: answeredChecks === totalChecks,
      answered: answeredChecks,
      total: totalChecks
    };
  }, [state.checkResults, getCurrentZone]);

  // Check if all issues have required fields
  const allIssuesComplete = useCallback(() => {
    return state.issues.every(issue => {
      if (!issue.explanation || issue.explanation.trim() === '') return false;
      if (issue.photoRequired && (!issue.photos || issue.photos.length === 0)) return false;
      return true;
    });
  }, [state.issues]);

  // Complete checklist - calculate rating
  const completeChecklist = useCallback(() => {
    // For cleanliness, rating is much stricter
    // We use the zone-level rating based on all check results
    const zone = getCurrentZone();
    if (!zone) return { rating: 'RED' };

    const failedChecks = [];
    zone.sections.forEach(section => {
      section.checks.forEach(check => {
        if (state.checkResults[check.id] === false) {
          failedChecks.push(check);
        }
      });
    });

    let rating = 'GREEN';

    if (failedChecks.length > 0) {
      // Check for instant red
      const hasInstantRed = failedChecks.some(check =>
        check.instantRed || isCleanlinessInstantRed(check.id)
      );

      if (hasInstantRed) {
        rating = 'RED';
      } else if (failedChecks.length > CLEANLINESS_RAG_RULES.amber.maxOpenIssues) {
        // More than 1 defect = RED
        rating = 'RED';
      } else {
        // Exactly 1 non-critical defect
        rating = 'AMBER';
      }
    }

    // Tour Ready = No => RED
    if (state.checkResults['tour_ready'] === false) {
      rating = 'RED';
    }

    setState(prev => ({
      ...prev,
      rating,
      isComplete: true,
      endTime: new Date().toISOString()
    }));

    clearSavedState();
    return { rating };
  }, [state.checkResults, getCurrentZone, clearSavedState]);

  // Get checklist data for saving
  const getChecklistData = useCallback(() => {
    const duration = state.startTime && state.endTime
      ? Math.round((new Date(state.endTime) - new Date(state.startTime)) / 60000)
      : null;

    const zone = CLEANLINESS_ZONES[state.checklistType];

    return {
      date: state.startTime ? new Date(state.startTime).toLocaleDateString() : null,
      time: state.startTime ? new Date(state.startTime).toLocaleTimeString() : null,
      campus: state.campus,
      campusData: state.campusData,
      auditor: state.auditor,
      auditorEmail: state.auditorEmail,
      duration,
      checklistType: state.checklistType,
      checklistName: zone?.name || state.checklistType,
      weekNumber: state.weekNumber,
      assignedRooms: state.assignedRooms,
      checkResults: state.checkResults,
      rating: state.rating,
      issues: state.issues,
      totalIssues: state.issues.length,
      openIssues: state.issues.filter(i => i.status === 'open').length,
      instantRedIssues: state.issues.filter(i => i.instantRed).length,
      startTime: state.startTime,
      endTime: state.endTime
    };
  }, [state]);

  const isInProgress = state.startTime && !state.isComplete;

  return {
    ...state,
    isInProgress,
    currentZoneId: state.checklistType,
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
    addIssue,
    updateIssue,
    addPhotoToIssue,
    removeIssue,
    completeChecklist,
    clearSavedState
  };
};

export default useCleanlinessAudit;
