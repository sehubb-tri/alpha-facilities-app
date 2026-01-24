import { useState, useCallback, useMemo } from 'react';
import { ZONES, TOUR_ROUTE_ZONE_IDS, createRestroomZone } from '../data/zones';

export const useAudit = () => {
  const [campus, setCampus] = useState(null);
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [selectedOptionalZones, setSelectedOptionalZones] = useState([]);
  const [restroomCount, setRestroomCount] = useState(1);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [zoneResults, setZoneResults] = useState({});
  const [conditionAlerts, setConditionAlerts] = useState([]);
  const [tourReady, setTourReady] = useState(null);
  const [zonePhotos, setZonePhotos] = useState({}); // { zoneId: [photo1, photo2, ...] }

  // Generate restroom zone IDs based on count
  const restroomZoneIds = useMemo(() => {
    return Array.from({ length: restroomCount }, (_, i) => `restroom_${i + 1}`);
  }, [restroomCount]);

  // All zones: tour route + optional + restrooms
  const allZones = useMemo(() =>
    [...TOUR_ROUTE_ZONE_IDS, ...selectedOptionalZones, ...restroomZoneIds],
    [selectedOptionalZones, restroomZoneIds]
  );

  const currentZoneId = useMemo(() =>
    allZones[currentZoneIndex],
    [allZones, currentZoneIndex]
  );

  // Get zone config - handles both static zones and dynamic restrooms
  const getZoneConfig = useCallback((zoneId) => {
    if (!zoneId) return null;
    // Check if it's a dynamic restroom zone
    if (zoneId.startsWith('restroom_')) {
      const num = parseInt(zoneId.split('_')[1]);
      return createRestroomZone(num);
    }
    return ZONES[zoneId];
  }, []);

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
          ...(hasIssue ? updates : { photo: null, note: '' })
        };
        return newAlerts;
      } else {
        return [...prev, { zoneId, hasIssue, note: '', photo: null, ...updates }];
      }
    });
  }, []);

  const updateConditionAlertPhoto = useCallback((zoneId, photo) => {
    setConditionAlerts(prev => {
      const idx = prev.findIndex(a => a.zoneId === zoneId);
      if (idx >= 0) {
        const newAlerts = [...prev];
        newAlerts[idx] = { ...newAlerts[idx], photo };
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
    setCurrentZoneIndex(0);
    setZoneResults({});
    setConditionAlerts([]);
    setTourReady(null);
    setZonePhotos({});
  }, []);

  const beginAudit = useCallback((campusData, name, email, optionalZones, numRestrooms = 1) => {
    setCampus(campusData);
    setAuditorName(name);
    setAuditorEmail(email);
    setSelectedOptionalZones(optionalZones);
    setRestroomCount(numRestrooms);
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
      conditionAlerts: conditionAlerts.filter(a => a.hasIssue).length,
      zoneResults,
      conditionAlertDetails: conditionAlerts.filter(a => a.hasIssue),
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
    updateConditionAlertPhoto,
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
