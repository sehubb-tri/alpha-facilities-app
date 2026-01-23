import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { analyzeIssuePhoto, hasOpenAIKey } from '../services/openai';

export const ReportPhoto = ({ report, camera }) => {
  const navigate = useNavigate();
  const {
    campus,
    photo,
    aiAnalysis,
    analyzing,
    analysisError,
    setAiAnalysis,
    setAnalyzing,
    setAnalysisError,
    setCategory,
    setUrgent
  } = report;

  // Auto-analyze photo when it's set
  useEffect(() => {
    if (photo && !aiAnalysis && !analyzing && !analysisError) {
      analyzePhoto();
    }
  }, [photo]);

  const analyzePhoto = async () => {
    if (!hasOpenAIKey()) {
      setAnalysisError('OpenAI API key not configured. Please add it in settings.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeIssuePhoto(photo);
      setAiAnalysis(result);
      // Pre-fill the category and urgent based on AI suggestion
      setCategory(result.category);
      setUrgent(result.suggestedUrgent);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message || 'Failed to analyze photo');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    // Reset AI analysis when retaking
    setAiAnalysis(null);
    setAnalysisError(null);
    camera.openCamera((imageData) => {
      report.setPhoto(imageData);
    }, 'Capture Issue');
  };

  const handleConfirmAndContinue = () => {
    navigate('/report/details');
  };

  const handleChangeCategory = (newCategory) => {
    setCategory(newCategory);
  };

  const getCategoryInfo = (categoryId) => {
    return ISSUE_CATEGORIES.find(c => c.id === categoryId);
  };

  const selectedCategory = getCategoryInfo(report.category);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header
        title="AI Analysis"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {photo ? (
          <>
            {/* Photo Preview */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <img
                src={photo}
                alt="Issue photo"
                style={{ width: '100%', display: 'block' }}
              />
            </div>

            {/* Analysis Status */}
            {analyzing && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Analyzing Photo...
                </div>
                <div style={{ fontSize: '15px', color: '#666' }}>
                  AI is identifying the issue type
                </div>
                <div style={{
                  marginTop: '16px',
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#2B57D0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    width: '60%'
                  }} />
                </div>
              </div>
            )}

            {/* Analysis Error */}
            {analysisError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                  ⚠️ Analysis Failed
                </div>
                <div style={{ fontSize: '15px', color: '#991b1b', marginBottom: '12px' }}>
                  {analysisError}
                </div>
                <button
                  onClick={analyzePhoto}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/report/details')}
                  style={{
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Skip & Enter Manually
                </button>
              </div>
            )}

            {/* AI Analysis Results */}
            {aiAnalysis && !analyzing && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>🤖</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                    AI Detected
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '13px',
                    color: aiAnalysis.confidence === 'high' ? '#059669' : aiAnalysis.confidence === 'medium' ? '#d97706' : '#9ca3af',
                    backgroundColor: aiAnalysis.confidence === 'high' ? '#d1fae5' : aiAnalysis.confidence === 'medium' ? '#fef3c7' : '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    {aiAnalysis.confidence} confidence
                  </span>
                </div>

                {/* AI Description */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '16px', color: '#0369a1', fontWeight: '500' }}>
                    "{aiAnalysis.description}"
                  </div>
                </div>

                {/* Detected Category */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>
                    Is this correct?
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: selectedCategory ? 'rgba(194, 236, 253, 0.3)' : '#f3f4f6',
                    border: selectedCategory ? '2px solid #2B57D0' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '14px'
                  }}>
                    <span style={{ fontSize: '32px', marginRight: '12px' }}>
                      {selectedCategory?.icon || '❓'}
                    </span>
                    <div>
                      <div style={{ fontSize: '17px', fontWeight: '600', color: '#333' }}>
                        {selectedCategory?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Routes to: {selectedCategory?.team || 'Facilities'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Urgent Suggestion */}
                {aiAnalysis.suggestedUrgent && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>🚨</span>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626' }}>
                        Marked as Urgent
                      </div>
                      <div style={{ fontSize: '13px', color: '#991b1b' }}>
                        AI suggests this needs immediate attention
                      </div>
                    </div>
                  </div>
                )}

                {/* Change Category Option */}
                <button
                  onClick={() => navigate('/report/details')}
                  style={{
                    width: '100%',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  ✏️ Change category or add details
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRetake}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '17px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔄 Retake
              </button>
              <button
                onClick={handleConfirmAndContinue}
                disabled={analyzing}
                style={{
                  flex: 1,
                  backgroundColor: analyzing ? '#d1d5db' : '#092849',
                  color: analyzing ? '#9ca3af' : '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '17px',
                  border: 'none',
                  cursor: analyzing ? 'not-allowed' : 'pointer'
                }}
              >
                {aiAnalysis ? '✓ Confirm' : 'Continue →'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
            <p style={{ fontSize: '17px', marginBottom: '20px' }}>No photo captured</p>
            <button
              onClick={handleRetake}
              style={{
                backgroundColor: '#092849',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '17px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Take Photo
            </button>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; width: 30%; }
          50% { opacity: 1; width: 70%; }
        }
      `}</style>
    </div>
  );
};
