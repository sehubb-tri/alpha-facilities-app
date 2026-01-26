import { useState, useCallback } from 'react';

export const useReport = () => {
  const [campus, setCampus] = useState(null);
  const [photos, setPhotos] = useState([]); // Changed to array for multiple photos
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // Legacy fields for backwards compatibility
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const [urgent, setUrgent] = useState(false);

  // Add a single photo to the array
  const addPhoto = useCallback((photoUrl) => {
    setPhotos(prev => [...prev, photoUrl]);
  }, []);

  // Remove a photo by index
  const removePhoto = useCallback((index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // For backwards compatibility - get first photo
  const photo = photos[0] || null;
  const setPhoto = useCallback((photoUrl) => {
    if (photoUrl) {
      setPhotos([photoUrl]);
    } else {
      setPhotos([]);
    }
  }, []);

  const resetReport = useCallback(() => {
    setCampus(null);
    setPhotos([]);
    setDescription('');
    setLocation('');
    setIsEmergency(false);
    setCategory(null);
    setNote('');
    setUrgent(false);
  }, []);

  return {
    campus,
    photos,
    photo, // backwards compat
    description,
    location,
    isEmergency,
    category,
    note,
    urgent,
    setCampus,
    setPhotos,
    setPhoto, // backwards compat
    addPhoto,
    removePhoto,
    setDescription,
    setLocation,
    setIsEmergency,
    setCategory,
    setNote,
    setUrgent,
    resetReport
  };
};
