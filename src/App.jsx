import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCamera } from './hooks/useCamera';
import { useAudit } from './hooks/useAudit';
import { useReport } from './hooks/useReport';
import { useBGWalkthrough } from './hooks/useBGWalkthrough';
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
import { AuditDetails } from './pages/AuditDetails';
import { ReportStart } from './pages/ReportStart';
import { ReportPhoto } from './pages/ReportPhoto';
import { ReportDetails } from './pages/ReportDetails';
import { ReportComplete } from './pages/ReportComplete';
import { ReportsList } from './pages/ReportsList';
import { Settings } from './pages/Settings';

// B&G Weekly Walkthrough Pages
import { BGSetup } from './pages/BGSetup';
import { BGZone } from './pages/BGZone';
import { BGObservations } from './pages/BGObservations';
import { BGGovernance } from './pages/BGGovernance';
import { BGSummary } from './pages/BGSummary';
import { BGComplete } from './pages/BGComplete';

function App() {
  const camera = useCamera();
  const audit = useAudit();
  const report = useReport();
  const bgWalkthrough = useBGWalkthrough();

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

        {/* Audit Flow (Daily Cleanliness) */}
        <Route path="/audit/setup" element={<AuditSetup audit={audit} />} />
        <Route path="/audit/overview" element={<AuditOverview audit={audit} />} />
        <Route path="/audit/zone" element={<AuditZone audit={audit} camera={camera} />} />
        <Route path="/audit/condition" element={<AuditCondition audit={audit} camera={camera} />} />
        <Route path="/audit/tour-ready" element={<AuditTourReady audit={audit} />} />
        <Route path="/audit/summary" element={<AuditSummary audit={audit} />} />
        <Route path="/audit/complete" element={<AuditComplete audit={audit} />} />

        {/* B&G Weekly Walkthrough Flow */}
        <Route path="/bg/setup" element={<BGSetup bgWalkthrough={bgWalkthrough} />} />
        <Route path="/bg/zone" element={<BGZone bgWalkthrough={bgWalkthrough} camera={camera} />} />
        <Route path="/bg/observations" element={<BGObservations bgWalkthrough={bgWalkthrough} camera={camera} />} />
        <Route path="/bg/governance" element={<BGGovernance bgWalkthrough={bgWalkthrough} camera={camera} />} />
        <Route path="/bg/summary" element={<BGSummary bgWalkthrough={bgWalkthrough} />} />
        <Route path="/bg/complete" element={<BGComplete bgWalkthrough={bgWalkthrough} />} />

        {/* History */}
        <Route path="/history" element={<History />} />
        <Route path="/audit/:id" element={<AuditDetails />} />

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
