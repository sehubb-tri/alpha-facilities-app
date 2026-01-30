import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Home, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { saveGreenStreakWalk } from '../supabase/greenStreakService';
import {
  createWrikeTask,
  getWrikeFolderForCampus,
  submitIssueToWrike,
  addWrikeComment
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
          // Create summary task for the walk
          console.log('[GreenStreak] Creating summary task...');
          const summaryTask = await createWalkSummaryTask(walkData, folderId);
          console.log('[GreenStreak] Summary task created:', summaryTask?.id);

          // Create individual tasks for each issue
          if (walkData.issues && walkData.issues.length > 0) {
            for (const issue of walkData.issues) {
              try {
                await submitGreenStreakIssue(issue, walkData, folderId);
              } catch (issueError) {
                console.error('[GreenStreak] Error submitting issue:', issueError);
              }
            }
          }

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
 * Create a summary task for the completed Green Streak Walk
 */
async function createWalkSummaryTask(walkData, folderId) {
  const statusEmoji = walkData.overallStatus === 'GREEN' ? '✅' : '🔴';
  const date = new Date(walkData.date || Date.now()).toLocaleDateString();

  const title = `${statusEmoji} [${walkData.campus}] Green Streak Walk - ${date}`;

  // Build description
  let description = `**Green Streak Daily Walk Summary**\n\n`;
  description += `**Campus:** ${walkData.campus}\n`;
  description += `**Coordinator:** ${walkData.coordinator}\n`;
  description += `**Date:** ${date}\n`;
  description += `**Duration:** ${walkData.startTime && walkData.endTime
    ? Math.round((new Date(walkData.endTime) - new Date(walkData.startTime)) / 60000) + ' minutes'
    : 'N/A'}\n\n`;

  description += `**Overall Status:** ${walkData.overallStatus}\n\n`;

  // Add metric statuses
  description += `**Metric Results:**\n`;
  Object.entries(walkData.metricStatuses || {}).forEach(([metricId, status]) => {
    const metric = GREEN_STREAK_METRICS[metricId];
    const icon = status === 'GREEN' ? '✓' : '✗';
    description += `${icon} ${metric?.name || metricId}: ${status}\n`;
  });

  // Add rooms checked
  if (walkData.roomSelections) {
    description += `\n**Spaces Checked:**\n`;
    if (walkData.roomSelections.learning?.length > 0) {
      description += `Learning Spaces: ${walkData.roomSelections.learning.join(', ')}\n`;
    }
    if (walkData.roomSelections.restroom?.length > 0) {
      description += `Restrooms: ${walkData.roomSelections.restroom.join(', ')}\n`;
    }
  }

  // Add issues summary
  if (walkData.totalIssues > 0) {
    description += `\n**Issues Found:** ${walkData.totalIssues}\n`;
    description += `(See separate tasks for each issue)\n`;
  }

  const priority = walkData.overallStatus === 'GREEN' ? 'Normal' : 'High';

  return createWrikeTask(folderId, {
    title,
    description,
    priority
  });
}

/**
 * Submit a Green Streak issue to Wrike
 */
async function submitGreenStreakIssue(issue, walkData, folderId) {
  const metric = GREEN_STREAK_METRICS[issue.metric];
  const date = new Date(walkData.date || Date.now()).toLocaleDateString();

  const title = `[${walkData.campus}] Green Streak Issue: ${metric?.name || issue.metric} - ${issue.stopName}`;

  let description = `**Green Streak Walk Issue**\n\n`;
  description += `**Campus:** ${walkData.campus}\n`;
  description += `**Coordinator:** ${walkData.coordinator}\n`;
  description += `**Date:** ${date}\n\n`;

  description += `**Metric:** ${metric?.name || issue.metric}\n`;
  description += `**Location:** ${issue.stopName}`;
  if (issue.roomName) {
    description += ` - ${issue.roomName}`;
  }
  description += `\n\n`;

  description += `**Check:** ${issue.question}\n\n`;
  description += `**Issue Description:**\n${issue.description}\n`;

  if (metric?.escalation) {
    description += `\n**Escalate to:** ${metric.escalation}\n`;
  }

  const task = await createWrikeTask(folderId, {
    title,
    description,
    priority: 'High'
  });

  // Add photos as comments if present
  if (task && issue.photos && issue.photos.length > 0) {
    for (let i = 0; i < issue.photos.length; i++) {
      const photo = issue.photos[i];
      const photoUrl = photo.url || photo;
      if (photoUrl && !photoUrl.startsWith('data:')) {
        await addWrikeComment(task.id, `Photo ${i + 1}:\n${photoUrl}`);
      }
    }
  }

  return task;
}
