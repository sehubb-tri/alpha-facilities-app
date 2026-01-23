export const CameraModal = ({
  isOpen,
  label,
  isVideoReady,
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
        muted
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
        <div className="flex-1 flex items-center justify-center">
          {!isVideoReady && (
            <div className="text-white text-lg bg-black/50 px-4 py-2 rounded-lg">
              Loading camera...
            </div>
          )}
        </div>
        <div className="bg-black/50 p-6 flex justify-center">
          <button
            onClick={onCapture}
            disabled={!isVideoReady}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
              isVideoReady
                ? 'bg-white/20 active:bg-white/40'
                : 'bg-gray-500/50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className={`w-16 h-16 rounded-full ${isVideoReady ? 'bg-white' : 'bg-gray-400'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
