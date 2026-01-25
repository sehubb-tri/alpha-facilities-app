import { useState, useCallback, useEffect } from 'react';
import { BG_ZONES, BG_ZONE_ORDER, calculateZoneRating, calculateCampusRating, getCheckTier } from '../data/bgZones';

const STORAGE_KEY = 'bg_walkthrough_state';
const PHOTOS_STORAGE_KEY = 'bg_walkthrough_photos';

// Store photos separately in IndexedDB to avoid localStorage limits
const PhotoStorage = {
  db: null,

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BGWalkthroughPhotos', 1);

      request.onerror = () => {
        console.error('[PhotoStorage] Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
    });
  },

  async savePhoto(id, dataUrl) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        const request = store.put({ id, dataUrl, timestamp: Date.now() });
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[PhotoStorage] Error saving photo:', e);
      return id;
    }
  },

  async getPhoto(id) {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.dataUrl || null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[PhotoStorage] Error getting photo:', e);
      return null;
    }
  },

  async clear() {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('[PhotoStorage] Error clearing photos:', e);
    }
  }
};

const getInitialState = () => ({
  // Setup info
  campus: null,
  campusData: null,
  auditor: '',
  auditorEmail: '',
  startTime: null,

  // Current position
  currentZoneIndex: 0,

  // Interior rooms selection
  selectedRooms: {
    classrooms: [], // Array of room names/numbers
    bathrooms: []   // Array of room names/numbers
  },
  currentRoomIndex: 0,

  // Check results by zone
  // Structure: { zoneId: { checkId: true/false, ... }, ... }
  zoneResults: {},

  // Room-based results for interior zone
  // Structure: { roomId: { checkId: true/false, ... }, ... }
  roomResults: {},

  // Issues/defects found
  // Structure: [{ zoneId, checkId, checkText, tier, photos: [], notes, rating, roomId? }, ...]
  issues: [],

  // Observations routed to other pillars
  // Structure: [{ category, description, pillar, tier, photos: [], notes }, ...]
  observations: [],

  // Exit photos for Green zones
  // Structure: { zoneId: photoUrl, ... }
  exitPhotos: {},

  // Zone ratings
  // Structure: { zoneId: 'GREEN'|'AMBER'|'RED', ... }
  zoneRatings: {},

  // Governance data
  priorWeekIssues: [],
  priorWeekResolved: null,

  // Completion
  isComplete: false,
  endTime: null
});

export const useBGWalkthrough = () => {
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
      console.error('Error restoring B&G walkthrough state:', e);
    }
    return getInitialState();
  });

  // Save to localStorage on state change (excluding large photo data)
  useEffect(() => {
    if (state.startTime && !state.isComplete) {
      try {
        // Create a copy without base64 photo data to avoid localStorage limits
        const stateToSave = {
          ...state,
          // Keep photo IDs/URLs but strip base64 data from issues
          issues: state.issues.map(issue => ({
            ...issue,
            photos: issue.photos.map(photo =>
              // Keep URLs and photo IDs, but skip huge base64 data
              photo && photo.startsWith('data:') && photo.length > 10000
                ? `photo_ref_${issue.id}_${Date.now()}` // Replace with reference
                : photo
            )
          })),
          // Same for observations
          observations: state.observations.map(obs => ({
            ...obs,
            photos: obs.photos.map(photo =>
              photo && photo.startsWith('data:') && photo.length > 10000
                ? `photo_ref_${obs.id}_${Date.now()}`
                : photo
            )
          })),
          // Same for exit photos
          exitPhotos: Object.fromEntries(
            Object.entries(state.exitPhotos).map(([zoneId, photo]) => [
              zoneId,
              photo && photo.startsWith('data:') && photo.length > 10000
                ? `photo_ref_exit_${zoneId}`
                : photo
            ])
          )
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error('[useBGWalkthrough] Error saving to localStorage:', e);
        // If localStorage fails, at least the in-memory state is preserved
      }
    }
  }, [state]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear IndexedDB photos
    PhotoStorage.clear().catch(e => console.error('[useBGWalkthrough] Error clearing photo storage:', e));
  }, []);

  // Initialize walkthrough
  const initWalkthrough = useCallback((campus, campusData, auditor, auditorEmail) => {
    setState({
      ...getInitialState(),
      campus,
      campusData,
      auditor,
      auditorEmail,
      startTime: new Date().toISOString()
    });
  }, []);

  // Reset walkthrough
  const resetWalkthrough = useCallback(() => {
    clearSavedState();
    setState(getInitialState());
  }, [clearSavedState]);

  // Get current zone
  const getCurrentZone = useCallback(() => {
    const zoneId = BG_ZONE_ORDER[state.currentZoneIndex];
    return BG_ZONES[zoneId];
  }, [state.currentZoneIndex]);

  // Set selected rooms for interior zone
  const setSelectedRooms = useCallback((classrooms, bathrooms) => {
    setState(prev => ({
      ...prev,
      selectedRooms: { classrooms, bathrooms }
    }));
  }, []);

  // Get current room for interior zone
  const getCurrentRoom = useCallback(() => {
    const allRooms = [
      ...state.selectedRooms.classrooms.map(name => ({ name, type: 'classroom' })),
      ...state.selectedRooms.bathrooms.map(name => ({ name, type: 'bathroom' }))
    ];
    return allRooms[state.currentRoomIndex] || null;
  }, [state.selectedRooms, state.currentRoomIndex]);

  // Get total room count
  const getTotalRoomCount = useCallback(() => {
    return state.selectedRooms.classrooms.length + state.selectedRooms.bathrooms.length;
  }, [state.selectedRooms]);

  // Record check result
  const recordCheckResult = useCallback((zoneId, checkId, result, roomId = null) => {
    setState(prev => {
      if (roomId) {
        // Room-based result (interior zone)
        const roomKey = `${roomId}`;
        return {
          ...prev,
          roomResults: {
            ...prev.roomResults,
            [roomKey]: {
              ...(prev.roomResults[roomKey] || {}),
              [checkId]: result
            }
          }
        };
      } else {
        // Zone-based result
        return {
          ...prev,
          zoneResults: {
            ...prev.zoneResults,
            [zoneId]: {
              ...(prev.zoneResults[zoneId] || {}),
              [checkId]: result
            }
          }
        };
      }
    });
  }, []);

  // Record batch results for a zone
  const recordZoneResults = useCallback((zoneId, results, roomId = null) => {
    setState(prev => {
      if (roomId) {
        return {
          ...prev,
          roomResults: {
            ...prev.roomResults,
            [roomId]: {
              ...(prev.roomResults[roomId] || {}),
              ...results
            }
          }
        };
      } else {
        return {
          ...prev,
          zoneResults: {
            ...prev.zoneResults,
            [zoneId]: {
              ...(prev.zoneResults[zoneId] || {}),
              ...results
            }
          }
        };
      }
    });
  }, []);

  // Add issue
  const addIssue = useCallback((issue) => {
    setState(prev => ({
      ...prev,
      issues: [...prev.issues, {
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        tier: getCheckTier(issue.checkId),
        photos: [],
        notes: '',
        ...issue
      }]
    }));
  }, []);

  // Update issue (add photos, notes)
  const updateIssue = useCallback((issueId, updates) => {
    setState(prev => ({
      ...prev,
      issues: prev.issues.map(issue =>
        issue.id === issueId ? { ...issue, ...updates } : issue
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

  // Add observation (routed to other pillar)
  const addObservation = useCallback((observation) => {
    setState(prev => ({
      ...prev,
      observations: [...prev.observations, {
        id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        photos: [],
        notes: '',
        ...observation
      }]
    }));
  }, []);

  // Update observation
  const updateObservation = useCallback((obsId, updates) => {
    setState(prev => ({
      ...prev,
      observations: prev.observations.map(obs =>
        obs.id === obsId ? { ...obs, ...updates } : obs
      )
    }));
  }, []);

  // Remove observation
  const removeObservation = useCallback((obsId) => {
    setState(prev => ({
      ...prev,
      observations: prev.observations.filter(obs => obs.id !== obsId)
    }));
  }, []);

  // Add exit photo for green zone
  const addExitPhoto = useCallback((zoneId, photoUrl) => {
    setState(prev => ({
      ...prev,
      exitPhotos: {
        ...prev.exitPhotos,
        [zoneId]: photoUrl
      }
    }));
  }, []);

  // Set prior week issues (for governance zone)
  const setPriorWeekIssues = useCallback((issues) => {
    setState(prev => ({
      ...prev,
      priorWeekIssues: issues
    }));
  }, []);

  // Calculate and set zone rating
  const calculateAndSetZoneRating = useCallback((zoneId) => {
    const zone = BG_ZONES[zoneId];
    let rating;

    if (zone.isRoomBased) {
      // For interior zone, aggregate all room results
      const allRoomResults = Object.values(state.roomResults).reduce((acc, roomResult) => {
        Object.entries(roomResult).forEach(([checkId, result]) => {
          // If any room has a NO, the check is NO
          if (acc[checkId] === undefined || result === false) {
            acc[checkId] = result;
          }
        });
        return acc;
      }, {});
      rating = calculateZoneRating(zoneId, allRoomResults);
    } else if (zone.isObservationZone) {
      // Observation zone is always GREEN (it's just routing)
      rating = 'GREEN';
    } else if (zone.isGovernanceZone) {
      // Governance zone rating based on its checks
      rating = calculateZoneRating(zoneId, state.zoneResults[zoneId] || {});
    } else {
      rating = calculateZoneRating(zoneId, state.zoneResults[zoneId] || {});
    }

    setState(prev => ({
      ...prev,
      zoneRatings: {
        ...prev.zoneRatings,
        [zoneId]: rating
      }
    }));

    return rating;
  }, [state.zoneResults, state.roomResults]);

  // Move to next zone
  const nextZone = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentZoneIndex + 1;
      if (nextIndex >= BG_ZONE_ORDER.length) {
        return prev;
      }
      return {
        ...prev,
        currentZoneIndex: nextIndex,
        currentRoomIndex: 0
      };
    });
  }, []);

  // Move to previous zone
  const prevZone = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentZoneIndex: Math.max(0, prev.currentZoneIndex - 1)
    }));
  }, []);

  // Move to next room (for interior zone)
  const nextRoom = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRoomIndex: prev.currentRoomIndex + 1
    }));
  }, []);

  // Move to previous room
  const prevRoom = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRoomIndex: Math.max(0, prev.currentRoomIndex - 1)
    }));
  }, []);

  // Go to specific zone
  const goToZone = useCallback((zoneIndex) => {
    setState(prev => ({
      ...prev,
      currentZoneIndex: zoneIndex,
      currentRoomIndex: 0
    }));
  }, []);

  // Complete walkthrough
  const completeWalkthrough = useCallback(() => {
    // Calculate all zone ratings
    const finalRatings = {};
    BG_ZONE_ORDER.forEach(zoneId => {
      const zone = BG_ZONES[zoneId];
      if (zone.isObservationZone) {
        finalRatings[zoneId] = 'GREEN';
      } else if (zone.isRoomBased) {
        const allRoomResults = Object.values(state.roomResults).reduce((acc, roomResult) => {
          Object.entries(roomResult).forEach(([checkId, result]) => {
            if (acc[checkId] === undefined || result === false) {
              acc[checkId] = result;
            }
          });
          return acc;
        }, {});
        finalRatings[zoneId] = calculateZoneRating(zoneId, allRoomResults);
      } else {
        finalRatings[zoneId] = calculateZoneRating(zoneId, state.zoneResults[zoneId] || {});
      }
    });

    const campusRating = calculateCampusRating(finalRatings);

    setState(prev => ({
      ...prev,
      zoneRatings: finalRatings,
      campusRating,
      isComplete: true,
      endTime: new Date().toISOString()
    }));

    clearSavedState();

    return { zoneRatings: finalRatings, campusRating };
  }, [state.zoneResults, state.roomResults, clearSavedState]);

  // Get walkthrough summary data
  const getWalkthroughData = useCallback(() => {
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
      roomResults: state.roomResults,
      selectedRooms: state.selectedRooms,
      zoneRatings: state.zoneRatings,
      campusRating: state.campusRating,

      // Issues and observations
      issues: state.issues,
      observations: state.observations,
      exitPhotos: state.exitPhotos,

      // Counts
      totalIssues: state.issues.length,
      totalObservations: state.observations.length,
      greenZones: Object.values(state.zoneRatings).filter(r => r === 'GREEN').length,
      amberZones: Object.values(state.zoneRatings).filter(r => r === 'AMBER').length,
      redZones: Object.values(state.zoneRatings).filter(r => r === 'RED').length,

      // Timestamps
      startTime: state.startTime,
      endTime: state.endTime
    };
  }, [state]);

  // Check if walkthrough is in progress
  const isInProgress = state.startTime && !state.isComplete;

  // Check if current zone is complete (all checks answered)
  const isCurrentZoneComplete = useCallback(() => {
    const zone = getCurrentZone();
    if (!zone) return false;

    if (zone.isObservationZone) {
      // Observation zone is always "complete" - user can add as many or few as needed
      return true;
    }

    if (zone.isRoomBased) {
      // Check if all rooms have all checks answered
      const allRooms = [
        ...state.selectedRooms.classrooms,
        ...state.selectedRooms.bathrooms
      ];

      if (allRooms.length === 0) return false;

      return allRooms.every(roomId => {
        const roomResult = state.roomResults[roomId] || {};
        return zone.sections.every(section =>
          section.checks.every(check => roomResult[check.id] !== undefined)
        );
      });
    }

    const zoneResult = state.zoneResults[zone.id] || {};
    return zone.sections.every(section =>
      section.checks.every(check => zoneResult[check.id] !== undefined)
    );
  }, [getCurrentZone, state.zoneResults, state.roomResults, state.selectedRooms]);

  return {
    // State
    ...state,
    isInProgress,

    // Getters
    getCurrentZone,
    getCurrentRoom,
    getTotalRoomCount,
    getWalkthroughData,
    isCurrentZoneComplete,

    // Actions
    initWalkthrough,
    resetWalkthrough,
    setSelectedRooms,
    recordCheckResult,
    recordZoneResults,
    addIssue,
    updateIssue,
    removeIssue,
    addObservation,
    updateObservation,
    removeObservation,
    addExitPhoto,
    setPriorWeekIssues,
    calculateAndSetZoneRating,
    nextZone,
    prevZone,
    nextRoom,
    prevRoom,
    goToZone,
    completeWalkthrough,
    clearSavedState
  };
};

export default useBGWalkthrough;
