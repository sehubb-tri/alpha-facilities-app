import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Home, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { saveGreenStreakWalk } from '../supabase/greenStreakService';
import {
  createWrikeTask,
  getWrikeFolderForCampus,
  attachUrlToTask
} from '../services/wrikeService';
import { GREEN_STREAK_METRICS } from '../data/greenStreakZones';

export const GreenStreakComplete = ({ greenStreakWalk }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wrikeStatus, setWrikeStatus] = useState(null); // null, 'sending', 'sent', 'error', 'skipped'
  const [error, setError] = useState(null);
  const [wrikeError, setWrikeError] = useState(null);

  const walkData = greenStreakWalk.getWalkData();
  const isGreen = walkData.overallStatus === 'GREEN';

  // Calculate duration
  const duration = walkData.startTime && walkData.endTime
    ? Math.round((new Date(walkData.endTime) - new Date(walkData.startTime)) / 60000)
    : null;

  // Save to database and send to Wrike on mount
  useEffect(() => {
    const saveAndNotify = async () => {
      if (saved || saving) return;

      setSaving(true);
      setError(null);

      // 1. Try to save to Supabase (don't block Wrike if this fails)
      try {
        await saveGreenStreakWalk(walkData);
        console.log('[GreenStreak] Walk saved to Supabase');
        setSaved(true);
      } catch (err) {
        console.error('[GreenStreak] Supabase save failed (continuing to Wrike):', err);
        setError(err.message);
        setSaved(false);
      }

      // 2. Send to Wrike (run regardless of Supabase result)
      const folderId = getWrikeFolderForCampus(walkData.campus);
      console.log('[GreenStreak] Got folder ID:', folderId, 'for campus:', walkData.campus);

      if (!folderId) {
        console.log('[GreenStreak] Campus not configured for Wrike:', walkData.campus);
        setWrikeStatus('skipped');
      } else {
        setWrikeStatus('sending');

        try {
          // Create single consolidated task with all issues
          console.log('[GreenStreak] Creating consolidated Wrike task...');
          const task = await createConsolidatedWrikeTask(walkData, folderId);
          console.log('[GreenStreak] Task created:', task?.id);

          setWrikeStatus('sent');
        } catch (wrikeErr) {
          console.error('[GreenStreak] Wrike error:', wrikeErr);
          setWrikeStatus('error');
          setWrikeError(wrikeErr.message || 'Unknown Wrike error');
        }
      }

      setSaving(false);
    };

    saveAndNotify();
  }, []);

  const handleNewWalk = () => {
    greenStreakWalk.resetWalk();
    navigate('/green-streak');
  };

  const handleGoHome = () => {
    greenStreakWalk.resetWalk();
    navigate('/');
  };

  return (
    <div className="min-h-screen" style={{
      background: isGreen
        ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      color: '#fff'
    }}>
      {/* Success Animation */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <Zap size={64} color="#fff" />
      </div>

      {/* Status */}
      <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        {isGreen ? 'Green Streak Intact!' : 'Walk Complete'}
      </div>

      <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
        {isGreen
          ? 'All systems are GO'
          : `${walkData.totalIssues} issue${walkData.totalIssues !== 1 ? 's' : ''} logged for escalation`}
      </div>

      {/* Stats */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>{duration || '-'}</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>minutes</div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {Object.keys(walkData.checkResults).length}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>checks</div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: '16px',
          paddingTop: '16px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>Campus</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{walkData.campus}</div>
        </div>
      </div>

      {/* Metric Summary */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '32px'
      }}>
        {Object.entries(walkData.metricStatuses || {}).map(([metricId, status]) => (
          <div
            key={metricId}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: status === 'GREEN' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {status === 'GREEN' ? '✓' : '!'} {metricId.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Sync Status */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '24px',
        width: '100%',
        maxWidth: '300px',
        fontSize: '14px'
      }}>
        {/* Supabase status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {saving && !saved ? (
            <Loader size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle size={16} color="#86efac" />
          ) : error ? (
            <AlertCircle size={16} color="#fca5a5" />
          ) : null}
          <span>
            {saving && !saved ? 'Saving to database...' :
             saved ? 'Saved to database' :
             error ? 'Error saving' : ''}
          </span>
        </div>

        {/* Wrike status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wrikeStatus === 'sending' ? (
            <Loader size={16} className="animate-spin" />
          ) : wrikeStatus === 'sent' ? (
            <CheckCircle size={16} color="#86efac" />
          ) : wrikeStatus === 'skipped' ? (
            <span style={{ opacity: 0.6 }}>-</span>
          ) : wrikeStatus === 'error' ? (
            <AlertCircle size={16} color="#fca5a5" />
          ) : null}
          <span>
            {wrikeStatus === 'sending' ? 'Sending to Wrike...' :
             wrikeStatus === 'sent' ? 'Sent to Wrike' :
             wrikeStatus === 'skipped' ? 'Wrike not configured for campus' :
             wrikeStatus === 'error' ? `Wrike error: ${wrikeError}` : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <button
          onClick={handleGoHome}
          style={{
            width: '100%',
            backgroundColor: '#fff',
            color: isGreen ? '#059669' : '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Home size={20} />
          Back to Home
        </button>

        <button
          onClick={handleNewWalk}
          style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <RotateCcw size={20} />
          Start New Walk
        </button>
      </div>

      {/* Timestamp */}
      <div style={{ marginTop: '32px', fontSize: '13px', opacity: 0.6 }}>
        Completed {new Date(walkData.endTime || Date.now()).toLocaleString()}
      </div>
    </div>
  );
};

// ============================================
// WRIKE INTEGRATION HELPERS
// ============================================

/**
 * Create a single consolidated Wrike task for the Green Streak Walk
 * Includes all issues as bullet points in one task
 */
async function createConsolidatedWrikeTask(walkData, folderId) {
  const date = new Date(walkData.date || Date.now()).toLocaleDateString();
  const hasIssues = walkData.issues && walkData.issues.length > 0;

  // Title format: [Campus] Green Streak Walk - Date (X issues) or (All Clear)
  const issueCount = hasIssues ? `${walkData.issues.length} issue${walkData.issues.length !== 1 ? 's' : ''}` : 'All Clear';
  const title = `[${walkData.campus}] Green Streak Walk - ${date} (${issueCount})`;

  // Build description with HTML formatting (Wrike supports HTML)
  let description = '';

  // Header info
  description += `<b>Campus:</b> ${walkData.campus}<br>`;
  description += `<b>Coordinator:</b> ${walkData.coordinator}<br>`;
  description += `<b>Date:</b> ${date}<br>`;
  description += `<b>Status:</b> ${walkData.overallStatus === 'GREEN' ? '🟢 GREEN - All Clear' : '🔴 ISSUES FOUND'}<br>`;
  description += `<br><hr><br>`;

  // Issues section
  if (hasIssues) {
    description += `<h3>Issues Requiring Action</h3>`;
    description += `<ol>`;

    walkData.issues.forEach((issue) => {
      const metric = GREEN_STREAK_METRICS[issue.metric];

      description += `<li>`;
      description += `<b>${metric?.name || issue.metric} - ${issue.stopName}</b><br>`;
      description += `<b>Check:</b> ${issue.question}<br>`;
      description += `<b>Issue:</b> ${issue.description}<br>`;
      if (metric?.escalation) {
        description += `<b>Escalate to:</b> ${metric.escalation}<br>`;
      }
      // Note if photos are attached
      if (issue.photos && issue.photos.length > 0) {
        description += `<b>Photos:</b> ${issue.photos.length} attached<br>`;
      }
      description += `</li>`;
    });

    description += `</ol>`;
  } else {
    description += `<h3>✅ No issues found. Green Streak intact!</h3>`;
  }

  // Metric summary
  description += `<br><hr><br>`;
  description += `<h3>Metric Summary</h3>`;
  description += `<ul>`;
  Object.entries(walkData.metricStatuses || {}).forEach(([metricId, status]) => {
    const metric = GREEN_STREAK_METRICS[metricId];
    const icon = status === 'GREEN' ? '✅' : '❌';
    description += `<li>${icon} <b>${metric?.name || metricId}:</b> ${status}</li>`;
  });
  description += `</ul>`;

  const priority = walkData.overallStatus === 'GREEN' ? 'Normal' : 'High';

  const task = await createWrikeTask(folderId, {
    title,
    description,
    priority
  });

  // Attach photos to the task
  if (task && hasIssues) {
    let photoIndex = 0;
    for (const issue of walkData.issues) {
      if (issue.photos && issue.photos.length > 0) {
        const metric = GREEN_STREAK_METRICS[issue.metric];
        for (const photo of issue.photos) {
          const photoUrl = photo.url || photo;
          if (photoUrl && !photoUrl.startsWith('data:')) {
            photoIndex++;
            try {
              const filename = `${metric?.name || issue.metric}_${issue.stopName}_${photoIndex}.jpg`.replace(/[^a-zA-Z0-9._-]/g, '_');
              await attachUrlToTask(task.id, photoUrl, filename);
              console.log(`[GreenStreak] Attached photo ${photoIndex}: ${filename}`);
            } catch (attachError) {
              console.error(`[GreenStreak] Failed to attach photo:`, attachError);
            }
          }
        }
      }
    }
  }

  return task;
}
