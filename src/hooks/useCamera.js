import { useRef, useCallback } from 'react';

export const useCamera = () => {
  const callbackRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((e) => {
    console.log('[useCamera] handleFileSelect triggered');
    const file = e.target.files[0];
    if (file) {
      console.log('[useCamera] File selected:', file.name, file.size, 'bytes');
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('[useCamera] FileReader loaded, data length:', event.target.result?.length);
        if (callbackRef.current) {
          console.log('[useCamera] Calling callback with image data');
          callbackRef.current(event.target.result);
        } else {
          console.error('[useCamera] ERROR: No callback registered!');
        }
      };
      reader.onerror = (error) => {
        console.error('[useCamera] FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('[useCamera] No file selected');
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Simply opens the native camera/file picker
  const openCamera = useCallback((callback) => {
    console.log('[useCamera] openCamera called, callback:', !!callback);
    callbackRef.current = callback;
    if (fileInputRef.current) {
      console.log('[useCamera] Clicking file input');
      fileInputRef.current.click();
    } else {
      console.error('[useCamera] ERROR: fileInputRef is null!');
    }
  }, []);

  return {
    fileInputRef,
    openCamera,
    handleFileSelect
  };
};
