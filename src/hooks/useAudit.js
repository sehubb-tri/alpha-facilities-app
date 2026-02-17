import { useState, useCallback, useMemo } from 'react';
import { ZONES, TOUR_ROUTE_ZONE_IDS, FINAL_ZONE_IDS, createRestroomZone, createClassroomZone } from '../data/zones';

export const useAudit = () => {
  const [campus, setCampus] = useState(null);
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [selectedOptionalZones, setSelectedOptionalZones] = useState([]);
  const [restroomCount, setRestroomCount] = useState(1);
  const [restroomNames, setRestroomNames] = useState([]); // Named restrooms (e.g., ["Main Hallway Bathroom", "Carbon Room Bathroom"])
  const [classroomNames, setClassroomNames] = useState([]); // Named classrooms (e.g., ["Neon Room", "Carbon Room"])
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [zoneResults, setZoneResults] = useState({});
  const [conditionAlerts, setConditionAlerts] = useState([]);
  const [tourReady, setTourReady] = useState(null);
  const [zonePhotos, setZonePhotos] = useState({}); // { zoneId: [photo1, photo2, ...] }

  // Generate restroom zone IDs based on count or named restrooms
  const restroomZoneIds = useMemo(() => {
    if (restroomNames.length > 0) {
      return restroomNames.map((_, i) => `restroom_${i + 1}`);
    }
    return Array.from({ length: restroomCount }, (_, i) => `restroom_${i + 1}`);
  }, [restroomCount, restroomNames]);

  // Generate classroom zone IDs based on named classrooms
  const classroomZoneIds = useMemo(() => {
    return classroomNames.map((_, i) => `classroom_${i + 1}`);
  }, [classroomNames]);

  // All zones: tour route + optional + named classrooms + restrooms + final (Alpha Standard)
  // When named classrooms are used, filter out the generic 'classroom' from optional zones
  const allZones = useMemo(() => {
    const optionalFiltered = classroomNames.length > 0
      ? selectedOptionalZones.filter(id => id !== 'classroom')
      : selectedOptionalZones;
    return [...TOUR_ROUTE_ZONE_IDS, ...optionalFiltered, ...classroomZoneIds, ...restroomZoneIds, ...FINAL_ZONE_IDS];
  }, [selectedOptionalZones, classroomZoneIds, restroomZoneIds, classroomNames]);


  const currentZoneId = useMemo(() =>
    allZones[currentZoneIndex],
    [allZones, currentZoneIndex]
  );

  // Get zone config - handles static zones, dynamic restrooms, and dynamic classrooms
  const getZoneConfig = useCallback((zoneId) => {
    if (!zoneId) return null;
    // Check if it's a dynamic restroom zone
    if (zoneId.startsWith('restroom_')) {
      const num = parseInt(zoneId.split('_')[1]);
      const customName = restroomNames.length > 0 ? restroomNames[num - 1] : null;
      return createRestroomZone(num, customName);
    }
    // Check if it's a dynamic classroom zone
    if (zoneId.startsWith('classroom_')) {
      const num = parseInt(zoneId.split('_')[1]);
      const customName = classroomNames.length > 0 ? classroomNames[num - 1] : null;
      return createClassroomZone(num, customName);
    }
    return ZONES[zoneId];
  }, [restroomNames, classroomNames]);

  const currentZone = useMemo(() =>
    getZoneConfig(currentZoneId),
    [currentZoneId, getZoneConfig]
  );

  const countDefects = useCallback((zoneId) => {
    const results = zoneResults[zoneId] || {};
    return Object.values(results).filter(v => v === 'no').length;
  }, [zoneResults]);

  const getTotalDefects = useCallback(() => {
    return allZones.reduce((sum, zoneId) => sum + countDefects(zoneId), 0);
  }, [allZones, countDefects]);

  const calculateStatus = useCallback(() => {
    let totalDefects = 0;
    let hasAmberIneligibleDefect = false;

    for (const zoneId of allZones) {
      const zone = getZoneConfig(zoneId);
      const defects = countDefects(zoneId);
      totalDefects += defects;
      if (zone && !zone.amberEligible && defects > 0) {
        hasAmberIneligibleDefect = true;
      }
    }

    if (tourReady === 'no') return 'RED';
    if (hasAmberIneligibleDefect) return 'RED';
    if (totalDefects === 0) return 'GREEN';
    if (totalDefects === 1) return 'AMBER';
    return 'RED';
  }, [allZones, countDefects, tourReady, getZoneConfig]);

  const isZoneComplete = useCallback((zoneId) => {
    const zone = getZoneConfig(zoneId);
    if (!zone) return false;
    const results = zoneResults[zoneId] || {};
    return Object.keys(results).length === zone.cleanliness.length;
  }, [zoneResults, getZoneConfig]);

  const setResponse = useCallback((zoneId, questionIndex, value) => {
    setZoneResults(prev => ({
      ...prev,
      [zoneId]: {
        ...(prev[zoneId] || {}),
        [questionIndex]: value
      }
    }));
  }, []);

  const setConditionAlert = useCallback((zoneId, hasIssue, updates = {}) => {
    setConditionAlerts(prev => {
      const idx = prev.findIndex(a => a.zoneId === zoneId);
      if (idx >= 0) {
        const newAlerts = [...prev];
        newAlerts[idx] = {
          ...newAlerts[idx],
          hasIssue,
          ...(hasIssue ? updates : { photos: [], note: '' })
        };
        return newAlerts;
      } else {
        return [...prev, { zoneId, hasIssue, note: '', photos: [], ...updates }];
      }
    });
  }, []);

  // Add a photo to condition alert (supports multiple photos)
  const addConditionAlertPhoto = useCallback((zoneId, photo) => {
    console.log('[useAudit] addConditionAlertPhoto called:', {
      zoneId,
      photoLength: photo?.length
    });
    setConditionAlerts(prev => {
      const idx = prev.findIndex(a => a.zoneId === zoneId);
      console.log('[useAudit] Found alert at index:', idx, 'for zone:', zoneId);
      if (idx >= 0) {
        const newAlerts = [...prev];
        const existingPhotos = newAlerts[idx].photos || [];
        newAlerts[idx] = { ...newAlerts[idx], photos: [...existingPhotos, photo] };
        console.log('[useAudit] Updated alert:', newAlerts[idx].zoneId, 'photoCount:', newAlerts[idx].photos.length);
        return newAlerts;
      }
      console.warn('[useAudit] WARNING: No existing alert found for zone:', zoneId);
      return prev;
    });
  }, []);

  // Remove a photo from condition alert
  const removeConditionAlertPhoto = useCallback((zoneId, photoIndex) => {
    setConditionAlerts(prev => {
      const idx = prev.findIndex(a => a.zoneId === zoneId);
      if (idx >= 0) {
        const newAlerts = [...prev];
        const existingPhotos = newAlerts[idx].photos || [];
        newAlerts[idx] = {
          ...newAlerts[idx],
          photos: existingPhotos.filter((_, i) => i !== photoIndex)
        };
        return newAlerts;
      }
      return prev;
    });
  }, []);

  const updateConditionAlertNote = useCallback((zoneId, note) => {
    setConditionAlerts(prev => {
      const idx = prev.findIndex(a => a.zoneId === zoneId);
      if (idx >= 0) {
        const newAlerts = [...prev];
        newAlerts[idx] = { ...newAlerts[idx], note };
        return newAlerts;
      }
      return prev;
    });
  }, []);

  const canCompleteCondition = useCallback((zoneId) => {
    const alert = conditionAlerts.find(a => a.zoneId === zoneId);
    if (!alert) return false;
    if (alert.hasIssue === false) return true;
    return alert.hasIssue && alert.photo && alert.note && alert.note.length > 0;
  }, [conditionAlerts]);

  const getConditionAlert = useCallback((zoneId) => {
    return conditionAlerts.find(a => a.zoneId === zoneId);
  }, [conditionAlerts]);

  // Zone photos functions
  const addZonePhotos = useCallback((zoneId, photos) => {
    setZonePhotos(prev => ({
      ...prev,
      [zoneId]: [...(prev[zoneId] || []), ...photos]
    }));
  }, []);

  const getZonePhotos = useCallback((zoneId) => {
    return zonePhotos[zoneId] || [];
  }, [zonePhotos]);

  const removeZonePhoto = useCallback((zoneId, photoIndex) => {
    setZonePhotos(prev => ({
      ...prev,
      [zoneId]: (prev[zoneId] || []).filter((_, i) => i !== photoIndex)
    }));
  }, []);

  const getAllZonePhotos = useCallback(() => {
    return zonePhotos;
  }, [zonePhotos]);

  const resetAudit = useCallback(() => {
    setCampus(null);
    setAuditorName('');
    setAuditorEmail('');
    setStartTime(null);
    setSelectedOptionalZones([]);
    setRestroomCount(1);
    setRestroomNames([]);
    setClassroomNames([]);
    setCurrentZoneIndex(0);
    setZoneResults({});
    setConditionAlerts([]);
    setTourReady(null);
    setZonePhotos({});
  }, []);

  const beginAudit = useCallback((campusData, name, email, optionalZones, numRestrooms = 1, namedRestrooms = [], namedClassrooms = []) => {
    setCampus(campusData);
    setAuditorName(name);
    setAuditorEmail(email);
    setSelectedOptionalZones(optionalZones);
    setRestroomNames(namedRestrooms);
    setClassroomNames(namedClassrooms);
    // If named restrooms provided, use their count; otherwise use the number
    setRestroomCount(namedRestrooms.length > 0 ? namedRestrooms.length : numRestrooms);
    setStartTime(Date.now());
  }, []);

  const getDuration = useCallback(() => {
    if (!startTime) return 0;
    return Math.round((Date.now() - startTime) / 60000);
  }, [startTime]);

  const getCompletedZonesCount = useCallback(() => {
    return Object.keys(zoneResults).length;
  }, [zoneResults]);

  const getNextIncompleteZoneIndex = useCallback(() => {
    for (let i = 0; i < allZones.length; i++) {
      if (!zoneResults[allZones[i]]) return i;
    }
    return -1;
  }, [allZones, zoneResults]);

  const buildAuditData = useCallback(() => {
    const filteredAlerts = conditionAlerts.filter(a => a.hasIssue);
    console.log('[useAudit] buildAuditData - conditionAlerts:', conditionAlerts);
    console.log('[useAudit] buildAuditData - filtered alerts with hasIssue:', filteredAlerts);
    filteredAlerts.forEach((alert, idx) => {
      console.log(`[useAudit] Alert ${idx}:`, {
        zoneId: alert.zoneId,
        hasIssue: alert.hasIssue,
        hasPhoto: !!alert.photo,
        photoLength: alert.photo?.length,
        note: alert.note
      });
    });

    return {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      campus: campus?.name || '',
      auditor: auditorName,
      auditorEmail: auditorEmail,
      status: calculateStatus(),
      defects: getTotalDefects(),
      zones: allZones.length,
      duration: getDuration(),
      tourReady: tourReady === 'yes',
      conditionAlerts: filteredAlerts.length,
      zoneResults,
      conditionAlertDetails: filteredAlerts,
      campusData: campus,
      zonePhotos
    };
  }, [campus, auditorName, auditorEmail, calculateStatus, getTotalDefects, allZones, getDuration, tourReady, conditionAlerts, zoneResults, zonePhotos]);

  return {
    // State
    campus,
    auditorName,
    auditorEmail,
    startTime,
    selectedOptionalZones,
    restroomCount,
    currentZoneIndex,
    zoneResults,
    conditionAlerts,
    tourReady,
    allZones,
    currentZoneId,
    currentZone,
    zonePhotos,

    // Setters
    setCampus,
    setAuditorName,
    setAuditorEmail,
    setSelectedOptionalZones,
    setRestroomCount,
    setCurrentZoneIndex,
    setTourReady,
    setResponse,
    setConditionAlert,
    addConditionAlertPhoto,
    removeConditionAlertPhoto,
    updateConditionAlertNote,

    // Zone photos
    addZonePhotos,
    getZonePhotos,
    removeZonePhoto,
    getAllZonePhotos,

    // Computed
    countDefects,
    getTotalDefects,
    calculateStatus,
    isZoneComplete,
    canCompleteCondition,
    getConditionAlert,
    getZoneConfig,
    getDuration,
    getCompletedZonesCount,
    getNextIncompleteZoneIndex,

    // Actions
    resetAudit,
    beginAudit,
    buildAuditData
  };
};
