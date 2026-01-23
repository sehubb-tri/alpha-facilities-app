import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCamera } from './hooks/useCamera';
import { useAudit } from './hooks/useAudit';
import { useReport } from './hooks/useReport';
import { CameraModal } from './components/CameraModal';

// Pages
import { Home } from './pages/Home';
import { AuditSetup } from './pages/AuditSetup';
import { AuditOverview } from './pages/AuditOverview';
import { AuditZone } from './pages/AuditZone';
import { AuditCondition } from './pages/AuditCondition';
import { AuditTourReady } from './pages/AuditTourReady';
import { AuditSummary } from './pages/AuditSummary';
import { AuditComplete } from './pages/AuditComplete';
import { History } from './pages/History';
import { ReportStart } from './pages/ReportStart';
import { ReportPhoto } from './pages/ReportPhoto';
import { ReportDetails } from './pages/ReportDetails';
import { ReportComplete } from './pages/ReportComplete';
import { ReportsList } from './pages/ReportsList';
import { Settings } from './pages/Settings';

function App() {
  const camera = useCamera();
  const audit = useAudit();
  const report = useReport();

  return (
    <BrowserRouter>
      {/* Hidden file input for camera fallback */}
      <input
        type="file"
        ref={camera.fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={camera.handleFileSelect}
      />

      {/* Camera Modal */}
      <CameraModal
        isOpen={camera.isOpen}
        label={camera.label}
        isVideoReady={camera.isVideoReady}
        videoRef={camera.videoRef}
        canvasRef={camera.canvasRef}
        onCapture={camera.capturePhoto}
        onClose={camera.closeCamera}
      />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Audit Flow */}
        <Route path="/audit/setup" element={<AuditSetup audit={audit} />} />
        <Route path="/audit/overview" element={<AuditOverview audit={audit} />} />
        <Route path="/audit/zone" element={<AuditZone audit={audit} camera={camera} />} />
        <Route path="/audit/condition" element={<AuditCondition audit={audit} camera={camera} />} />
        <Route path="/audit/tour-ready" element={<AuditTourReady audit={audit} />} />
        <Route path="/audit/summary" element={<AuditSummary audit={audit} />} />
        <Route path="/audit/complete" element={<AuditComplete audit={audit} />} />

        {/* History */}
        <Route path="/history" element={<History />} />

        {/* Report Flow */}
        <Route path="/report" element={<ReportStart report={report} camera={camera} />} />
        <Route path="/report/photo" element={<ReportPhoto report={report} camera={camera} />} />
        <Route path="/report/details" element={<ReportDetails report={report} />} />
        <Route path="/report/complete" element={<ReportComplete report={report} />} />

        {/* Reports List */}
        <Route path="/reports" element={<ReportsList />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
