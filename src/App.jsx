import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCamera } from './hooks/useCamera';
import { useAudit } from './hooks/useAudit';

// Initialize Wrike debug tools (available via window.wrikeDebug in console)
import './services/wrikeService';
import { useReport } from './hooks/useReport';
import { useBGWalkthrough } from './hooks/useBGWalkthrough';
import { useSecurityChecklist } from './hooks/useSecurityChecklist';
import { useGreenStreakWalk } from './hooks/useGreenStreakWalk';
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
import { ReportDescription } from './pages/ReportDescription';
import { ReportEmergency } from './pages/ReportEmergency';
import { ReportComplete } from './pages/ReportComplete';
import { ReportsList } from './pages/ReportsList';
import { ReportView } from './pages/ReportView';
import { Settings } from './pages/Settings';

// B&G Weekly Walkthrough Pages
import { BGSetup } from './pages/BGSetup';
import { BGZone } from './pages/BGZone';
import { BGGovernance } from './pages/BGGovernance';
import { BGSummary } from './pages/BGSummary';
import { BGComplete } from './pages/BGComplete';
import { BGDetails } from './pages/BGDetails';

// Security Checklist Pages (hidden feature for Jake)
import { SecuritySetup } from './pages/SecuritySetup';
import { SecurityChecklist } from './pages/SecurityChecklist';
import { SecuritySummary } from './pages/SecuritySummary';
import { SecurityComplete } from './pages/SecurityComplete';

// Furniture & Decor Checklist Pages (hidden feature for Taraya/Austin)
import { FurnitureSetup } from './pages/FurnitureSetup';
import { FurnitureChecklist } from './pages/FurnitureChecklist';
import { FurnitureSummary } from './pages/FurnitureSummary';
import { FurnitureComplete } from './pages/FurnitureComplete';
import { useFurnitureChecklist } from './hooks/useFurnitureChecklist';

// Food Safety Checklist Pages (hidden feature for Ops)
import { FoodSafetySetup } from './pages/FoodSafetySetup';
import { FoodSafetyChecklist } from './pages/FoodSafetyChecklist';
import { FoodSafetySummary } from './pages/FoodSafetySummary';
import { FoodSafetyComplete } from './pages/FoodSafetyComplete';
import { useFoodSafetyChecklist } from './hooks/useFoodSafetyChecklist';

// Health & Safety Checklist Pages (14.03 Quality Bar)
import { HealthSafetySetup } from './pages/HealthSafetySetup';
import { HealthSafetyChecklist } from './pages/HealthSafetyChecklist';
import { HealthSafetySummary } from './pages/HealthSafetySummary';
import { HealthSafetyComplete } from './pages/HealthSafetyComplete';
import { useHealthSafetyChecklist } from './hooks/useHealthSafetyChecklist';

// Mechanical Systems Checklist Pages (14.11 Quality Bar)
import { MechanicalSetup } from './pages/MechanicalSetup';
import { MechanicalChecklist } from './pages/MechanicalChecklist';
import { MechanicalSummary } from './pages/MechanicalSummary';
import { MechanicalComplete } from './pages/MechanicalComplete';
import { useMechanicalChecklist } from './hooks/useMechanicalChecklist';

// Green Streak Walk Pages (CC Daily Oversight)
import { GreenStreakSetup } from './pages/GreenStreakSetup';
import { GreenStreakWalk } from './pages/GreenStreakWalk';
import { GreenStreakSummary } from './pages/GreenStreakSummary';
import { GreenStreakComplete } from './pages/GreenStreakComplete';

// Ops Audits Landing Page
import { OpsAudits } from './pages/OpsAudits';

function App() {
  const camera = useCamera();
  const audit = useAudit();
  const report = useReport();
  const bgWalkthrough = useBGWalkthrough();
  const securityChecklist = useSecurityChecklist();
  const furnitureChecklist = useFurnitureChecklist();
  const foodSafetyChecklist = useFoodSafetyChecklist();
  const healthSafetyChecklist = useHealthSafetyChecklist();
  const mechanicalChecklist = useMechanicalChecklist();
  const greenStreakWalk = useGreenStreakWalk();

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

      {/* Photo Uploading Overlay */}
      {camera.isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Uploading photo...</p>
          </div>
        </div>
      )}

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
        <Route path="/bg/governance" element={<BGGovernance bgWalkthrough={bgWalkthrough} camera={camera} />} />
        <Route path="/bg/summary" element={<BGSummary bgWalkthrough={bgWalkthrough} />} />
        <Route path="/bg/complete" element={<BGComplete bgWalkthrough={bgWalkthrough} />} />

        {/* History */}
        <Route path="/history" element={<History />} />
        <Route path="/audit/:id" element={<AuditDetails />} />
        <Route path="/bg/:id" element={<BGDetails />} />

        {/* Report Flow - Simplified MVP */}
        <Route path="/report" element={<ReportStart report={report} camera={camera} />} />
        <Route path="/report/photo" element={<ReportPhoto report={report} camera={camera} />} />
        <Route path="/report/description" element={<ReportDescription report={report} />} />
        <Route path="/report/emergency" element={<ReportEmergency report={report} />} />
        <Route path="/report/complete" element={<ReportComplete report={report} />} />

        {/* Reports List */}
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/report/:id" element={<ReportView />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* Security Checklist Flow (Hidden - access via /security) */}
        <Route path="/security" element={<SecuritySetup securityChecklist={securityChecklist} />} />
        <Route path="/security/checklist" element={<SecurityChecklist securityChecklist={securityChecklist} camera={camera} />} />
        <Route path="/security/summary" element={<SecuritySummary securityChecklist={securityChecklist} />} />
        <Route path="/security/complete" element={<SecurityComplete securityChecklist={securityChecklist} />} />

        {/* Furniture & Decor Checklist Flow (Hidden - access via /furniture) */}
        <Route path="/furniture" element={<FurnitureSetup furnitureChecklist={furnitureChecklist} />} />
        <Route path="/furniture/checklist" element={<FurnitureChecklist furnitureChecklist={furnitureChecklist} camera={camera} />} />
        <Route path="/furniture/summary" element={<FurnitureSummary furnitureChecklist={furnitureChecklist} />} />
        <Route path="/furniture/complete" element={<FurnitureComplete furnitureChecklist={furnitureChecklist} />} />

        {/* Food Safety Checklist Flow (Hidden - access via /food-safety) */}
        <Route path="/food-safety" element={<FoodSafetySetup foodSafetyChecklist={foodSafetyChecklist} />} />
        <Route path="/food-safety/checklist" element={<FoodSafetyChecklist foodSafetyChecklist={foodSafetyChecklist} camera={camera} />} />
        <Route path="/food-safety/summary" element={<FoodSafetySummary foodSafetyChecklist={foodSafetyChecklist} />} />
        <Route path="/food-safety/complete" element={<FoodSafetyComplete foodSafetyChecklist={foodSafetyChecklist} />} />

        {/* Health & Safety Checklist Flow (14.03 Quality Bar) */}
        <Route path="/health-safety" element={<HealthSafetySetup healthSafetyChecklist={healthSafetyChecklist} />} />
        <Route path="/health-safety/checklist" element={<HealthSafetyChecklist healthSafetyChecklist={healthSafetyChecklist} camera={camera} />} />
        <Route path="/health-safety/summary" element={<HealthSafetySummary healthSafetyChecklist={healthSafetyChecklist} />} />
        <Route path="/health-safety/complete" element={<HealthSafetyComplete healthSafetyChecklist={healthSafetyChecklist} />} />

        {/* Mechanical Systems Checklist Flow (14.11 Quality Bar) */}
        <Route path="/mechanical" element={<MechanicalSetup mechanicalChecklist={mechanicalChecklist} />} />
        <Route path="/mechanical/checklist" element={<MechanicalChecklist mechanicalChecklist={mechanicalChecklist} camera={camera} />} />
        <Route path="/mechanical/summary" element={<MechanicalSummary mechanicalChecklist={mechanicalChecklist} />} />
        <Route path="/mechanical/complete" element={<MechanicalComplete mechanicalChecklist={mechanicalChecklist} />} />

        {/* Green Streak Walk Flow (CC Daily Oversight) */}
        <Route path="/green-streak" element={<GreenStreakSetup greenStreakWalk={greenStreakWalk} />} />
        <Route path="/green-streak/walk" element={<GreenStreakWalk greenStreakWalk={greenStreakWalk} camera={camera} />} />
        <Route path="/green-streak/summary" element={<GreenStreakSummary greenStreakWalk={greenStreakWalk} />} />
        <Route path="/green-streak/complete" element={<GreenStreakComplete greenStreakWalk={greenStreakWalk} />} />

        {/* Ops Audits Landing Page */}
        <Route path="/ops-audits" element={<OpsAudits />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
