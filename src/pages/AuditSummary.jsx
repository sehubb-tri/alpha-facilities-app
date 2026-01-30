import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAudit } from '../supabase/services';
import { useI18n } from '../i18n';
import { submitChecklistIssuesToWrike, isCampusWrikeEnabled } from '../services/wrikeService';

export const AuditSummary = ({ audit }) => {
  const navigate = useNavigate();
  const { t, getZoneName } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const {
    campus,
    auditor,
    auditorEmail,
    allZones,
    conditionAlerts,
    zoneResults,
    calculateStatus,
    countDefects,
    getTotalDefects,
    getDuration,
    buildAuditData,
    getZoneConfig,
    getZonePhotos
  } = audit;

  const status = calculateStatus();
  const totalDefects = getTotalDefects();
  const duration = getDuration();
  const flaggedAlerts = conditionAlerts.filter(a => a.hasIssue).length;

  const statusColors = {
    GREEN: '#47C4E6',
    AMBER: '#2B57D0',
    RED: '#141685'
  };

  const statusIcons = {
    GREEN: '✓',
    AMBER: '⚠️',
    RED: '✗'
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const auditData = buildAuditData();
      await saveAudit(auditData);

      const campusName = campus?.name;
      const wrikeEnabled = isCampusWrikeEnabled(campusName);

      // Collect ALL defects from zoneResults (every "no" answer)
      const allDefects = [];
      for (const zoneId of allZones) {
        const zone = getZoneConfig(zoneId);
        const results = zoneResults[zoneId] || {};
        const zoneName = zone?.type === 'restroom' ? zone?.name : (zone?.name || zoneId);
        const questions = zone?.cleanliness || [];
        const photos = getZonePhotos ? getZonePhotos(zoneId) : [];

        // Find all "no" answers in this zone
        Object.entries(results).forEach(([questionIndex, answer]) => {
          if (answer === 'no') {
            const questionText = questions[parseInt(questionIndex)] || `Question ${parseInt(questionIndex) + 1}`;
            allDefects.push({
              checkText: questionText,
              section: zoneName,
              explanation: '',
              photos: photos,
              instantRed: !zone?.amberEligible
            });
          }
        });
      }

      // Also collect flagged B&G condition alerts
      const flaggedConditionAlerts = conditionAlerts.filter(a => a.hasIssue);
      const mappedAlerts = flaggedConditionAlerts.map(alert => {
        const zone = getZoneConfig(alert.zoneId);
        const zoneName = zone?.type === 'restroom' ? zone?.name : (zone?.name || alert.zoneId);
        return {
          checkText: 'B&G Condition Alert: ' + (alert.note || 'Issue reported'),
          section: zoneName,
          explanation: alert.note || '',
          photos: alert.photos || [],
          instantRed: false
        };
      });

      // Combine all issues
      const allIssues = [...allDefects, ...mappedAlerts];

      // DEBUG: Show what's happening with Wrike
      console.log('[Wrike Debug] Campus:', campusName, 'Enabled:', wrikeEnabled);
      console.log('[Wrike Debug] Defects:', allDefects.length, 'B&G Alerts:', mappedAlerts.length, 'Total:', allIssues.length);

      if (allIssues.length > 0 && campusName && wrikeEnabled) {
        try {
          console.log('[AuditSummary] Submitting', allIssues.length, 'issues to Wrike...');
          await submitChecklistIssuesToWrike(
            allIssues,
            campusName,
            { name: auditor, email: auditorEmail }
          );
          console.log('[AuditSummary] Wrike submission complete');
          alert('Wrike: Submitted ' + allIssues.length + ' issues successfully!');
        } catch (wrikeError) {
          console.error('[AuditSummary] Wrike submission failed:', wrikeError);
          alert('Wrike Error: ' + wrikeError.message);
        }
      } else if (allIssues.length > 0 && !wrikeEnabled) {
        // Debug alert to show why it's not submitting
        console.log('[Wrike Debug] Wrike not enabled for campus:', campusName);
        alert('Wrike not enabled for: ' + campusName);
      } else if (allIssues.length === 0) {
        console.log('[Wrike Debug] No issues to submit (all passed)');
      }

      navigate('/audit/complete');
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Error submitting audit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      {/* Status Header */}
      <div style={{
        backgroundColor: statusColors[status],
        color: '#fff',
        padding: '28px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '56px', marginBottom: '8px' }}>{statusIcons[status]}</div>
        <div style={{ fontSize: '32px', fontWeight: '700' }}>{t(`audit.status.${status}`)}</div>
        <div style={{ opacity: 0.9, fontSize: '17px', marginTop: '4px' }}>{campus?.name || ''}</div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#092849' }}>{allZones.length}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{t('audit.summary.zones')}</div>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: totalDefects > 0 ? '#141685' : '#47C4E6'
            }}>
              {totalDefects}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{t('audit.summary.defects')}</div>
          </div>
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#092849' }}>{duration}m</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{t('audit.summary.duration')}</div>
          </div>
        </div>

        {/* Zone Results List */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {allZones.map((zoneId, idx) => {
            const zone = getZoneConfig(zoneId);
            const defects = countDefects(zoneId);
            return (
              <div
                key={zoneId}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: idx !== allZones.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: defects === 0 ? '#C2ECFD' : 'rgba(194, 236, 253, 0.5)',
                  color: defects === 0 ? '#2B57D0' : '#141685',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '14px',
                  fontWeight: '700',
                  fontSize: '15px'
                }}>
                  {defects === 0 ? '✓' : defects}
                </span>
                <span style={{ flex: 1, fontSize: '17px', color: '#374151' }}>{zone?.type === 'restroom' ? zone?.name : getZoneName(zoneId)}</span>
              </div>
            );
          })}
        </div>

        {/* B&G Issues Alert */}
        {flaggedAlerts > 0 && (
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.3)',
            border: '1px solid #47C4E6',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: '700', color: '#092849', marginBottom: '4px', fontSize: '17px' }}>
              🔧 {flaggedAlerts} {t('audit.summary.bgIssuesFlagged')}
            </div>
            <div style={{ fontSize: '15px', color: '#141685' }}>
              {t('audit.summary.sentToBGTeam')}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            backgroundColor: submitting ? '#9ca3af' : '#092849',
            color: '#fff',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? t('audit.summary.submitting') : `✓ ${t('audit.summary.submitAudit')}`}
        </button>
      </div>
    </div>
  );
};
