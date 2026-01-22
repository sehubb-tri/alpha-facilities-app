export const CameraModal = ({
  isOpen,
  label,
  videoRef,
  canvasRef,
  onCapture,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex flex-col">
        <div className="bg-black/50 p-4 flex justify-between items-center">
          <button onClick={onClose} className="text-white text-lg">
            ✕ Cancel
          </button>
          <span className="text-white text-sm">📷 {label}</span>
        </div>
        <div className="flex-1" />
        <div className="bg-black/50 p-6 flex justify-center">
          <button
            onClick={onCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/40"
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
