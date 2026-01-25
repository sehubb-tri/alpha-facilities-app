import { useRef, useCallback, useState } from 'react';
import { uploadPhoto } from '../supabase/services';

// Helper to compress image before uploading
const compressImage = (dataUrl, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      console.log('[useCamera] Compressed image from', dataUrl.length, 'to', compressed.length, 'bytes');
      resolve(compressed);
    };
    img.onerror = () => {
      console.error('[useCamera] Image compression failed, using original');
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

export const useCamera = () => {
  const callbackRef = useRef(null);
  const folderRef = useRef('photos');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // State for CameraModal
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Process and upload image, then call the callback with URL
  const processAndUpload = useCallback(async (dataUrl) => {
    setIsUploading(true);
    try {
      // Compress the image
      const compressed = await compressImage(dataUrl);
      console.log('[useCamera] Uploading to Supabase...');

      // Upload directly to Supabase
      const url = await uploadPhoto(compressed, folderRef.current);

      if (url) {
        console.log('[useCamera] Upload successful:', url);
        if (callbackRef.current) {
          callbackRef.current(url);
        }
      } else {
        console.error('[useCamera] Upload failed, no URL returned');
        // Still call callback with null so UI can show error
        if (callbackRef.current) {
          callbackRef.current(null);
        }
      }
    } catch (error) {
      console.error('[useCamera] Upload error:', error);
      if (callbackRef.current) {
        callbackRef.current(null);
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    console.log('[useCamera] handleFileSelect triggered');
    const file = e.target.files[0];
    if (file) {
      console.log('[useCamera] File selected:', file.name, file.size, 'bytes');
      const reader = new FileReader();
      reader.onload = async (event) => {
        console.log('[useCamera] FileReader loaded, data length:', event.target.result?.length);
        await processAndUpload(event.target.result);
      };
      reader.onerror = (error) => {
        console.error('[useCamera] FileReader error:', error);
        if (callbackRef.current) {
          callbackRef.current(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.log('[useCamera] No file selected');
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processAndUpload]);

  // Stop camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsVideoReady(false);
  }, []);

  // Close camera modal
  const closeCamera = useCallback(() => {
    stopStream();
    setIsOpen(false);
    setLabel('');
    callbackRef.current = null;
  }, [stopStream]);

  // Capture photo from video stream
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      console.error('[useCamera] Cannot capture: video not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log('[useCamera] Photo captured, size:', dataUrl.length);

    closeCamera();

    // Process and upload
    await processAndUpload(dataUrl);
  }, [isVideoReady, closeCamera, processAndUpload]);

  // Open camera - tries native camera first, falls back to file input
  // callback receives a Supabase URL (not base64)
  const openCamera = useCallback((callback, labelText = 'Photo', folder = 'bg-walkthrough') => {
    console.log('[useCamera] openCamera called, callback:', !!callback, 'folder:', folder);
    callbackRef.current = callback;
    folderRef.current = folder;
    setLabel(labelText);

    // On mobile, always use native file input with capture attribute
    // This is more reliable than getUserMedia on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Use file input for mobile - more reliable
      console.log('[useCamera] Mobile detected, using file input');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    // On desktop, try to use getUserMedia for camera modal
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsOpen(true);

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      .then((stream) => {
        console.log('[useCamera] Got video stream');
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('[useCamera] Video ready');
            setIsVideoReady(true);
          };
        }
      })
      .catch((err) => {
        console.error('[useCamera] getUserMedia error:', err);
        // Fall back to file input
        setIsOpen(false);
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      });
    } else {
      // No getUserMedia, use file input
      console.log('[useCamera] No getUserMedia, using file input');
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, []);

  return {
    // For file input fallback
    fileInputRef,
    handleFileSelect,

    // For CameraModal
    isOpen,
    label,
    isVideoReady,
    isUploading,
    videoRef,
    canvasRef,

    // Actions
    openCamera,
    capturePhoto,
    closeCamera
  };
};
