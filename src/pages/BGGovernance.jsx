import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BG_ZONES, BG_ZONE_ORDER } from '../data/bgZones';
import { getBGWalkthroughs } from '../supabase/services';

export const BGGovernance = ({ bgWalkthrough }) => {
  const navigate = useNavigate();
  const [priorWeekData, setPriorWeekData] = useState(null);
  const [loadingPrior, setLoadingPrior] = useState(true);
  const [localResults, setLocalResults] = useState({});
  const [elapsedTime, setElapsedTime] = useState('0:00');

  const {
    currentZoneIndex,
    campus,
    zoneResults,
    startTime,
    recordZoneResults,
    goToZone,
    calculateAndSetZoneRating
  } = bgWalkthrough;

  // Live timer effect
  useEffect(() => {
    if (!startTime) return;

    const updateTimer = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now - start;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours > 0) {
        setElapsedTime(`${hours}:${mins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${mins}:${diffSecs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const currentZoneId = BG_ZONE_ORDER[currentZoneIndex];
  const currentZone = BG_ZONES[currentZoneId];
  const totalZones = BG_ZONE_ORDER.length;

  // Load prior week's walkthrough data
  useEffect(() => {
    const loadPriorWeek = async () => {
      if (!campus) {
        setLoadingPrior(false);
        return;
      }

      try {
        const walkthroughs = await getBGWalkthroughs(campus, 2);
        // Get the most recent completed walkthrough (not the current one)
        const prior = walkthroughs.find(w => w.isComplete);
        if (prior) {
          setPriorWeekData(prior);
        }
      } catch (error) {
        console.error('Error loading prior week data:', error);
      } finally {
        setLoadingPrior(false);
      }
    };

    loadPriorWeek();
  }, [campus]);

  // Initialize local results when zone changes
  useEffect(() => {
    const existingResults = zoneResults[currentZoneId] || {};
    setLocalResults(existingResults);
  }, [currentZoneId, zoneResults]);

  const handleResponse = (checkId, value) => {
    setLocalResults(prev => ({
      ...prev,
      [checkId]: value
    }));
  };

  // Get governance checks from zone definition
  const governanceChecks = currentZone?.sections?.flatMap(section =>
    section.checks.map(check => ({ ...check, section: section.name }))
  ) || [];

  const getTotalChecks = () => governanceChecks.length;
  const getAnsweredCount = () => Object.keys(localResults).filter(k => localResults[k] !== undefined).length;
  const isComplete = getAnsweredCount() === getTotalChecks();

  // Check for failed items
  const failedChecks = governanceChecks.filter(check => localResults[check.id] === false);
  const isGreen = failedChecks.length === 0 && isComplete;

  const canProceed = isComplete;

  const handleComplete = () => {
    // Save results
    recordZoneResults(currentZoneId, localResults);

    // Calculate zone rating
    calculateAndSetZoneRating(currentZoneId);

    // This is the last zone, go to summary
    navigate('/bg/summary');
  };

  const handleBack = () => {
    if (currentZoneIndex > 0) {
      goToZone(currentZoneIndex - 1);
      navigate('/bg/zone');
    }
  };

  // Count prior week issues
  const priorAmberCount = priorWeekData?.issues?.filter(i =>
    i.tier === 2 || i.tier === 3 || i.amberEligible
  ).length || 0;
  const priorRedCount = priorWeekData?.issues?.filter(i =>
    i.tier === 1 || i.amberIneligible
  ).length || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleBack}
            style={{
              fontSize: '24px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            ←
          </button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              {currentZone?.name}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0' }}>
              Zone {currentZoneIndex + 1} of {totalZones}
            </p>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>⏱️</span>
            <span>{elapsedTime}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', backgroundColor: '#e5e7eb' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#092849',
            width: `${((currentZoneIndex + 1) / totalZones) * 100}%`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Prior Week Summary */}
      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
            📊 Prior Week Summary
          </h3>

          {loadingPrior ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              Loading prior week data...
            </div>
          ) : priorWeekData ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                    {priorWeekData.greenZones || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#065f46' }}>Green Zones</div>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                    {priorAmberCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>Amber Issues</div>
                </div>
                <div style={{
                  backgroundColor: '#fee2e2',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                    {priorRedCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#991b1b' }}>Red Issues</div>
                </div>
              </div>

              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Date:</strong> {priorWeekData.date}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Auditor:</strong> {priorWeekData.auditor}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>Campus Rating:</strong>{' '}
                <span style={{
                  fontWeight: '600',
                  color: priorWeekData.campusRating === 'PASS' ? '#059669' : '#dc2626'
                }}>
                  {priorWeekData.campusRating || 'N/A'}
                </span>
              </div>

              {/* Prior Issues List */}
              {priorWeekData.issues?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                    Open Issues from Prior Week:
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {priorWeekData.issues.map((issue, idx) => (
                      <div key={idx} style={{
                        padding: '10px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        fontSize: '13px'
                      }}>
                        <div style={{ fontWeight: '500', color: '#374151' }}>
                          {issue.zoneName} - {issue.section}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: '2px' }}>
                          {issue.checkText}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: issue.tier === 1 ? '#fee2e2' : '#fef3c7',
                          color: issue.tier === 1 ? '#b91c1c' : '#92400e'
                        }}>
                          Tier {issue.tier}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <div>No prior week walkthrough found for this campus.</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                This may be the first B&G walkthrough.
              </div>
            </div>
          )}
        </div>

        {/* Governance Checks */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#092849' }}>
            ✅ Governance Checks
          </h3>

          {currentZone?.sections?.map(section => (
            <div key={section.name} style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {section.name}
              </div>

              {section.checks.map(check => {
                const result = localResults[check.id];
                return (
                  <div key={check.id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '15px', marginBottom: '10px', color: '#333', lineHeight: '1.4' }}>
                      {check.text}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleResponse(check.id, true)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '15px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: result === true ? '#10b981' : '#f3f4f6',
                          color: result === true ? '#fff' : '#333'
                        }}
                      >
                        ✓ Yes
                      </button>
                      <button
                        onClick={() => handleResponse(check.id, false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '15px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: result === false ? '#ef4444' : '#f3f4f6',
                          color: result === false ? '#fff' : '#333'
                        }}
                      >
                        ✗ No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Green Zone Success Message */}
        {isComplete && isGreen && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
              ✅ All governance checks passed!
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
          onClick={handleComplete}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            backgroundColor: canProceed ? '#092849' : '#d1d5db',
            color: canProceed ? '#fff' : '#9ca3af'
          }}
        >
          {!isComplete
            ? `Answer All Questions (${getAnsweredCount()}/${getTotalChecks()})`
            : 'View Summary →'}
        </button>
      </div>
    </div>
  );
};
