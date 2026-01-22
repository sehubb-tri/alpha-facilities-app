import { useState, useCallback } from 'react';

export const useReport = () => {
  const [campus, setCampus] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState(null);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [urgent, setUrgent] = useState(false);

  const resetReport = useCallback(() => {
    setCampus(null);
    setPhoto(null);
    setCategory(null);
    setLocation('');
    setNote('');
    setUrgent(false);
  }, []);

  return {
    campus,
    photo,
    category,
    location,
    note,
    urgent,
    setCampus,
    setPhoto,
    setCategory,
    setLocation,
    setNote,
    setUrgent,
    resetReport
  };
};
