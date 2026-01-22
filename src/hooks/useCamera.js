import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [label, setLabel] = useState('Take Photo');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const callbackRef = useRef(null);
  const fileInputRef = useRef(null);

  const useFilePicker = useCallback((callback) => {
    if (fileInputRef.current) {
      callbackRef.current = callback;
      fileInputRef.current.click();
    }
  }, []);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openCamera = useCallback(async (callback, labelText = 'Take Photo') => {
    callbackRef.current = callback;
    setLabel(labelText);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('No camera API, using file picker');
      useFilePicker(callback);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(mediaStream);
      setIsOpen(true);

      // Wait for next tick to ensure video element is mounted
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.log('Camera API failed, using file picker fallback:', err);
      useFilePicker(callback);
    }
  }, [useFilePicker]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const callback = callbackRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.7);

    // Close camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsOpen(false);

    // Call callback with image data
    if (callback) {
      callback(imageData);
    }
    callbackRef.current = null;
  }, [stream]);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsOpen(false);
    callbackRef.current = null;
  }, [stream]);

  return {
    isOpen,
    label,
    videoRef,
    canvasRef,
    fileInputRef,
    openCamera,
    capturePhoto,
    closeCamera,
    handleFileSelect
  };
};
