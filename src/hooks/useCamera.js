import { useRef, useCallback } from 'react';

export const useCamera = () => {
  const callbackRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (callbackRef.current) {
          callbackRef.current(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Simply opens the native camera/file picker
  const openCamera = useCallback((callback) => {
    callbackRef.current = callback;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return {
    fileInputRef,
    openCamera,
    handleFileSelect
  };
};
