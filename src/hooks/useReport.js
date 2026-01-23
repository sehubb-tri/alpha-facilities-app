import { useState, useCallback } from 'react';

export const useReport = () => {
  const [campus, setCampus] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState(null);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [urgent, setUrgent] = useState(false);

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null); // { category, description, suggestedUrgent, confidence }
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const resetReport = useCallback(() => {
    setCampus(null);
    setPhoto(null);
    setCategory(null);
    setLocation('');
    setNote('');
    setUrgent(false);
    setAiAnalysis(null);
    setAnalyzing(false);
    setAnalysisError(null);
  }, []);

  return {
    campus,
    photo,
    category,
    location,
    note,
    urgent,
    aiAnalysis,
    analyzing,
    analysisError,
    setCampus,
    setPhoto,
    setCategory,
    setLocation,
    setNote,
    setUrgent,
    setAiAnalysis,
    setAnalyzing,
    setAnalysisError,
    resetReport
  };
};
