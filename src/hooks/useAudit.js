import { useState, useCallback, useMemo } from 'react';
import { ZONES, MANDATORY_ZONE_IDS } from '../data/zones';

export const useAudit = () => {
  const [campus, setCampus] = useState(null);
  const [auditorName, setAuditorName] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [selectedOptionalZones, setSelectedOptionalZones] = useState([]);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [zoneResults, setZoneResults] = useState({});
  const [conditionAlerts, setConditionAlerts] = useState([]);
  const [tourReady, setTourReady] = useState(null);

  const allZones = useMemo(() =>
    [...MANDATORY_ZONE_IDS, ...selectedOptionalZones],
    [selectedOptionalZones]
  );

  const currentZoneId = useMemo(() =>
    allZones[currentZoneIndex],
    [allZones, currentZoneIndex]
  );

  const currentZone = useMemo(() =>
    ZONES[currentZoneId],
    [currentZoneId]
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
      const zone = ZONES[zoneId];
      const defects = countDefects(zoneId);
      totalDefects += defects;
      if (!zone.amberEligible && defects > 0) {
        hasAmberIneligibleDefect = true;
      }
    }

    if (tourReady === 'no') return 'RED';
    if (hasAmberIneligibleDefect) return 'RED';
    if (totalDefects === 0) return 'GREEN';
    if (totalDefects === 1) return 'AMBER';
    return 'RED';
  }, [allZones, countDefects, tourReady]);

  const isZoneComplete = useCallback((zoneId) => {
    const zone = ZONES[zoneId];
    const results = zoneResults[zoneId] || {};
    return Object.keys(results).length === zone.cleanliness.length;
  }, [zoneResults]);

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

  const resetAudit = useCallback(() => {
    setCampus(null);
    setAuditorName('');
    setStartTime(null);
    setSelectedOptionalZones([]);
    setCurrentZoneIndex(0);
    setZoneResults({});
    setConditionAlerts([]);
    setTourReady(null);
  }, []);

  const beginAudit = useCallback((campusData, name, optionalZones) => {
    setCampus(campusData);
    setAuditorName(name);
    setSelectedOptionalZones(optionalZones);
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
      status: calculateStatus(),
      defects: getTotalDefects(),
      zones: allZones.length,
      duration: getDuration(),
      tourReady: tourReady === 'yes',
      conditionAlerts: conditionAlerts.filter(a => a.hasIssue).length,
      zoneResults,
      conditionAlertDetails: conditionAlerts.filter(a => a.hasIssue),
      campusData: campus
    };
  }, [campus, auditorName, calculateStatus, getTotalDefects, allZones, getDuration, tourReady, conditionAlerts, zoneResults]);

  return {
    // State
    campus,
    auditorName,
    startTime,
    selectedOptionalZones,
    currentZoneIndex,
    zoneResults,
    conditionAlerts,
    tourReady,
    allZones,
    currentZoneId,
    currentZone,

    // Setters
    setCampus,
    setAuditorName,
    setSelectedOptionalZones,
    setCurrentZoneIndex,
    setTourReady,
    setResponse,
    setConditionAlert,
    updateConditionAlertPhoto,
    updateConditionAlertNote,

    // Computed
    countDefects,
    getTotalDefects,
    calculateStatus,
    isZoneComplete,
    canCompleteCondition,
    getConditionAlert,
    getDuration,
    getCompletedZonesCount,
    getNextIncompleteZoneIndex,

    // Actions
    resetAudit,
    beginAudit,
    buildAuditData
  };
};
